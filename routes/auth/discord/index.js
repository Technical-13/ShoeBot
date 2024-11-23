require( 'dotenv' ).config();
const config = require( '../../../config.json' );
const fs = require( 'fs' );
const express = require( 'express' );
const router = express.Router();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const endpoint = 'https://discord.com/api/v10';
const clientID = ( ENV.CLIENT_ID || config.clientId );
const CLIENT_TOKEN = ENV.token;
const REDIRECT_URI = encodeURIComponent( 'http://node4.lunes.host:' + ( ENV.PORT || 3000 ) + '/auth/discord/callback' );

router.get( '/signin', ( req, res ) => { res.redirect( 'https://discord.com/oauth2/authorize?client_id=' + clientID + '&response_type=code&redirect_uri=' + REDIRECT_URI + '&scope=guilds+identify' ); } );

router.get( '/callback',  ( req, res ) => {

  const { code } = req.query;
  if ( !code ) { return res.status( 400 ).json( { error: 'Authentication "code" not found in URL parameters.' } ); }
  fetch( endpoint + '/oauth2/token' +  )
} );

module.exports = router;