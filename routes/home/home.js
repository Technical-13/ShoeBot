require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
const express = require( 'express' );
const router = express.Router();
const htmlHome = fs.readFileSync( './web/home.html' );
const objTimeString = require( '../../jsonObjects/time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

router.get( '/', ( req, res ) => {
  new Promise( async ( resolve, reject ) => {
    const pageHome = cheerio.loadBuffer( htmlHome );
    pageHome( 'title' ).text( bot );
    pageHome( 'h1' ).text( bot );
    let status = '';
    switch ( ENV.clientStatus ) {
      case 'starting': status='Initializing'; break;
      case 'connected': status='Connected'; break;
      case 'ready': status='Ready'; break;
      case 'crashed': status='Crashed'; break;
      default: status='Unknown';
    }
    pageHome( '#about' ).append( '<p>Status: ' + status + '</p>' );
    pageHome( '#about' ).append( '<p>Last restart: ' + strNow() + '</p>' );
    pageHome( '#about' ).toggleClass( 'hidden' );
    resolve( pageHome.html() );
  } )
  .then( ( pageHTML ) => { res.send( pageHTML ); } );
} );

module.exports = router;