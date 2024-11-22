require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const fs = require( 'fs' );
const express = require( 'express' );
const router = express.Router();

router.get( '/signin', ( req, res ) => { res.redirect( 'https://discord.com/oauth2/authorize?client_id=' + ENV.CLIENT_ID + '&response_type=code&redirect_uri=' + encodeURIComponent( 'http://node4.lunes.host:' + ( ENV.PORT || 3000 ) ) + '&scope=guilds+identify' ); } );

router.get( '/callback',  ( req, res ) => {
  const { code } = req.query;
  if ( !code ) { return res.status( 400 ).json( { error: 'Authentication "code" not found in URL parameters.' } ); }
} );

module.exports = router;