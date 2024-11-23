require( 'dotenv' ).config();
const { availableMemory, constrainedMemory, ENV: env, uptime, version } = process;
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
const express = require( 'express' );
const router = express.Router();
const htmlHome = fs.readFileSync( './web/home.html' );
const { packages } = require( '../../package-lock.json' );
const objTimeString = require( '../../jsonObjects/time.json' );
const duration = require( '../../functions/duration.js' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

router.get( '/', async ( req, res ) => {
  const botVers = {
    axios: packages[ "node_modules/axios" ].version,
    cheerio: packages[ "node_modules/cheerio" ].version,
    djs: packages[ "node_modules/discord.js" ].version,
    express: packages[ "node_modules/express" ].version,
    node: version,
    mongoose: packages[ "node_modules/mongoose" ].version
  };
  const bot = ( ENV.BOT_USERNAME || 'Server' );
  const usedMemory = constrainedMemory() - availableMemory();
  const memPercent = Math.floor( usedMemory / constrainedMemory() * 1000 ) / 10;
  const msServer = ( new Date() ) - ( ( new Date() ) - Math.floor( uptime() * 1000 ) );
  const upServer = await duration( msServer, { getMonths: true, getWeeks: true, getSeconds: true } );
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
    pageHome( '#about' ).append( '<p>Uptime: ' + upServer + '</p>' );
    pageHome( '#about' ).append( '<p>Memory Usage: ' + memPercent + '%</p>' );
    pageHome( '#about' ).append( '<p>Verbosity Level: ' + ENV.VERBOSITY + '</p>' );
    pageHome( '#about' ).append( '<p>Package Versions: <ul>\n\t<li>' + botVers.join( '</li>\n\t<li>' ) + '</li>\n</ul></p>' );
    pageHome( '#about' ).append( '<p>Last restart: ' + strNow() + '</p>' );
    pageHome( '#about' ).toggleClass( 'hidden' );
    resolve( pageHome.html() );
  } )
  .then( ( pageHTML ) => { res.send( pageHTML ); } );
} );

module.exports = router;