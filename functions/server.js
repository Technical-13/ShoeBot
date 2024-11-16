require( 'dotenv' ).config();
const ENV = process.env;
const chalk = require( 'chalk' );
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const strConnectDB = ( ENV.mongodb || null );
const rootRouter = require( '../routes/rootRouter.js' );
//const baseMiddleware = require( '../routes/middlewares/base-middleware' );
const cookieParser = require( 'cookie-parser' );
const cors = require( 'cors' );
const app = express();
const bot = ( ENV.BOT_USERNAME || 'Server' );
const botPort = ( ENV.PORT || 3000 );
const objTimeString = require( '../jsonObjects/time.json' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/server.js' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

app.use( cors( { credentials: true, origin: 'https://node4.lunes.host:' + botPort } ) );
app.use( cookieParser() );
//app.use( '/', baseMiddleware );
app.use( '/', baseRouter );

if ( !strConnectDB ) { throw new Error( chalk.bold.red( `Failed to get process.env.mongodb in ${strScript}.` ) ); }

async function keepAlive() {
  try {
    await mongoose.connect( strConnectDB )
    .then( async dbConnected => {
      console.log( chalk.greenBright( 'Connected dashboard to MongoDB.' ) );
      app.listen( botPort, () => {
        const port = server.address().port;
        console.log( '%s is ready on port %s.\n\thttps://%s.MagentaRV.info', bot, port, bot );
      } );
    } )
    .catch( dbConnectErr => { console.error( chalk.bold.red( 'Failed to connect dashboard to MongoDB:\n%o' ), dbConnectErr ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript + '@keepAlive()', errObject.stack ); }
}

module.exports = keepAlive;