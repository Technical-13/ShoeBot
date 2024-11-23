require( 'dotenv' ).config();
const config = require( '../../../config.json' );
const fs = require( 'fs' );
const Users = require( '../../../models/BotUser.js' );
const duration = require( '../../../functions/duration.js' );
const express = require( 'express' );
const router = express.Router();
const jwt = require( 'jsonwebtoken' );
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const endpoint = 'https://discord.com/api/v10';
const clientID = ( ENV.CLIENT_ID || config.clientId );
const CLIENT_TOKEN = ENV.token;
const verUserDB = config.verUserDB;
const strScript = chalk.hex( '#FFA500' ).bold( './routes/auth/discord/index.js' );
const REDIRECT_URI = encodeURIComponent( 'http://node4.lunes.host:' + ( ENV.PORT || 3000 ) + '/auth/discord/callback' );

router.get( '/signin', ( req, res ) => { res.redirect( 'https://discord.com/oauth2/authorize?client_id=' + clientID + '&response_type=code&redirect_uri=' + REDIRECT_URI + '&scope=guilds+identify' ); } );

router.get( '/callback', async ( req, res ) => {
  const { code } = req.query;
  if ( !code ) { return res.status( 400 ).json( { error: 'Authentication "code" not found in URL parameters.' } ); }

  const oauthRes = await fetch( endpoint + '/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams( {
      client_id: clientID,
      client_secret: CLIENT_TOKEN,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code: code,
    } ).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  } );

  if ( !oauthRes.ok ) {
    switch ( oauthRes.status ) {
      case 400:// Bad Request
      case 405:// Method Not Allowed
        console.error( '%s: "%s": Fatal error - please check code in %s', oauthRes.status, oauthRes.statusText, strScript );
        return res.send( oauthRes.statusText + ': Something is wrong with my code, my developer has been notified.' );
        break;
      case 429:// Too Many Requests
        let nextTry = await duration( ( ( new Date() ) - ( oauthRes.headers[ 'retry-after' ] * 1000 ) ), { getSeconds } );
        console.error( '%s: "%s"\n\tPlease try again in %s', oauthRes.status, oauthRes.statusText, nextTry );
        return res.send( 'Too many requests, please try again in ' + nextTry );
        break;
      default:
        console.error( 'Failed to fetch token: %o', oauthRes );
        return res.send( 'Failed to fetch token.' );
    }
  }

  const oauthResJson = await oauthRes.json();

  const userRes = await fetch( endpoint + '/users/@me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + oauthResJson.access_token
    },
  } );

  if ( !userRes.ok ) {
    switch ( userRes.status ) {
      default:
        console.error( 'Failed to fetch user: %o', userRes );
        return res.send( 'Failed to fetch user.' );
    }
  }

  const userResJson = await userRes.json();

  let user = await Users.findOne( { _id: userResJson.id } );

  if ( !user ) {
    user = new BotUser( {
      _id: userResJson.id,
      Auths: { Discord: {
        accessToken: oauthResJson.access_token,
        expiresIn: oauthResJson.expires_in,
        refreshToken: oauthResJson.refresh_token,
        tokenType: oauthResJson.token_type
      } },
      Avatar: { hash: userResJson.avatar },
      Bot: ( oauthResJson.bot || false ),
      Guilds: [],
      Score: 0,
      UserName: userResJson.username,
      Version: verUserDB
    } );
  }
  else {
    user.Auths.Discord.accessToken = oauthResJson.access_token;
    user.Auths.Discord.expiresIn = oauthResJson.expires_in;
    user.Auths.Discord.refreshToken = oauthResJson.refresh_token;
    user.Auths.Discord.tokenType = oauthResJson.token_type;
  }

  await Users.findOneAndUpdate( { _id: userResJson.id }, user, { upsert: true } )
  .catch( errUpdate => { console.error( 'Failed to add/update user to/in database: %s', errUpdate.stack ); } );

} );

router.get( '/signout', ( req, res ) => { res/*.clearCookie( 'token' )*/.sendStatus( 200 ); } );

module.exports = router;