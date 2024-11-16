require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const express = require( 'express' );
const router = express.Router();
const objTimeString = require( '../jsonObjects/time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

router.get( '/', ( req, res ) => {
  console.log( req.user );
  res.send( 'received!' );
} );

router.post( '/', ( req, res ) => {
  res.send( bot + ' was last restarted: ' + strNow() );
} );

module.exports = router;