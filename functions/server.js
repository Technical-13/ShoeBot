require( 'dotenv' ).config();
const ENV = process.env;
const path = require( 'path' );
const express = require( 'express' );
const app = express();
const bot = ( ENV.BOT_USERNAME || 'Server' );
const botPort = ( ENV.PORT || 3000 );
const objTimeString = require( '../jsonObjects/time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

// Set up Pug as the view engine
app.set( 'view engine', 'pug' );
app.set( 'views', path.join( __dirname, 'views' ) );

// Define a route for the home page
app.get( '/', ( req, res ) => {
  res.render( 'index', { bot: bot, restartedAt: strNow() } );
} );

function keepAlive() {
  var server = app.listen( botPort, () => {
    const port = server.address().port;
    console.log( '%s is ready on port %s.\n\thttps://%s.MagentaRV.info', bot, port );
  } );
}

module.exports = keepAlive;