require( 'dotenv' ).config();
const ENV = process.env;
const express = require( 'express' );
const app = express();
const bot = ( ENV.BOT_USERNAME || 'Server' );
const botPort = ( ENV.PORT || 3000 );
const objTimeString = require( '../jsonObjects/time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

app.get( '/', ( req, res ) => {
  res.send( bot + ' was last restarted: ' + strNow() );
} );

app.get( '/users/:userId(\d{17,19})', ( req, res ) => {
  console.log( 'req.params: %o', req.params );
  res.send( 'Hello ' + req.params.userId );
} );

app.get( '/guilds/:guildId(\d{17,19})', ( req, res ) => {
app.get( '/users/:userId(\d{17,19})', ( req, res ) => {
  console.log( 'req.params: %o', req.params );
  res.send( 'Guild: ' + req.params.guildId );
} );

function keepAlive() {
  var server = app.listen( botPort, () => {
    const port = server.address().port;
    console.log( '%s is ready on port %s.\n\thttps://%s.MagentaRV.info', bot, port, bot );
  } );
}

module.exports = keepAlive;