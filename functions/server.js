require( 'dotenv' ).config();
const ENV = process.env;
const express = require( 'express' );
const app = express();
const bot = ( ENV.BOT_USERNAME || 'Server' );
const botPort = ( ENV.PORT || 3000 );
const objTimeString = require( '../jsonObjects/time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

app.get( '/', ( req, res ) => {
  if ( req ) {
    res.json( { request: req } );
  } else { res.send( bot + ' was last restarted: ' + strNow() ); }
} );

function keepAlive() {
  var server = app.listen( botPort, () => {
    const port = server.address().port;
    console.log( '%s is ready on port %s.\n\thttps://%s.MagentaRV.info', bot, port, bot );
  } );
}

module.exports = keepAlive;