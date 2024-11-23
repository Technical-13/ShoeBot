require( 'dotenv' ).config();
const config = require( '../../../config.json' );
const fs = require( 'fs' );
const Users = require( '../../models/BotUser.js' );
const express = require( 'express' );
const router = express.Router();
const jwt = require( 'jsonwebtoken' );
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const endpoint = 'https://discord.com/api/v10';
const clientID = ( ENV.CLIENT_ID || config.clientId );
const CLIENT_TOKEN = ENV.token;
const verUserDB = config.verUserDB;
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
      code,
    } ).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  } );

  if ( !oauthRes.ok ) {
    console.log( 'error', oauthRes );
    res.send( 'error' );
    return;
  }

  const oauthResJson = await oauthRes.json();

  const userRes = await fetch( endpoint + '/users/@me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + oauthResJson.access_token
    },
  } );

  if ( !userRes.ok ) { return res.send( 'error' ); }

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

  await Users.findOneAndUpdate( { _id: userResJson.id }, user, { upsert: true } );

} );

router.get( '/signout', ( req, res ) => { res.clearCookie( 'token' ).sendStatus( 200 ); } );

module.exports = router;