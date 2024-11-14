const client = require( '..' );
require( 'dotenv' ).config();
const ENV = process.env;
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const mongoose = require( 'mongoose' );
const getBotConfig = require( './getBotDB.js' );
const strConnectDB = ( ENV.mongodb || '' );
mongoose.set( 'strictQuery', false );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/database.js' );

module.exports = async () => {
  try {
    await mongoose.disconnect().then( dbDisconnected => console.log( chalk.yellow( 'MongoDB closed.' ) ) );
    await mongoose.connect( strConnectDB )
    .then( async dbConnected => {
      const botConfig = await getBotConfig();
      if ( ENV.VERBOSITY != botConfig.Verbosity ) {
        var verbosityColor;
        switch ( ENV.VERBOSITY ) {
          case 5: verbosityColor = '#D61F1F'; break;
          case 4: verbosityColor = '#E03C32'; break;
          case 3: verbosityColor = '#FFD301'; break;
          case 2: verbosityColor = '#7BB662'; break;
          case 1: verbosityColor = '#639754'; break;
          case 0: verbosityColor = '#006B3D'; break;
          default: verbosityColor = '#0000FF'; break;
        }
        console.warn( '%s %s', chalk.bold.red( 'Bot verbosity being reset on restart to process.env value of:' ), chalk.underline.hex( verbosityColor ).bold( '_ ' + ENV.VERBOSITY + ' _' ) );
      }
      var botVerbosity = ( ENV.VERBOSITY || botConfig.Verbosity || -1 );
      if ( isNaN( botVerbosity ) || botVerbosity < 0 || botVerbosity > 5 ) {
        console.log(
          'Bot Verbosity level not valid, defaulting to max verbosity level 5!\n\t' +
          'To fix this, please add %s to your %s file.\n\t' +
          'Valid values are:\n\t\t%s\n\t\t%s\n\t\t%s\n\t\t%s\n\t\t%s\n\t\t%s',
          chalk.green.bold( 'VERBOSITY=#' ), chalk.green.bold( '.env' ),
          chalk.hex( '#D61F1F' ).bold( '5 - All messages' ),
          chalk.hex( '#E03C32' ).bold( '4 - Major debugging messages' ),
          chalk.hex( '#FFD301' ).bold( '3 - Moderate debugging messages' ),
          chalk.hex( '#7BB662' ).bold( '2 - Minor debugging messages' ),
          chalk.hex( '#639754' ).bold( '1 - Basic system messages' ),
          chalk.hex( '#006B3D' ).bold( '0 - Required system messages' )
        );
        botVerbosity = 5;
      }
      client.verbosity = botVerbosity;
      console.log( chalk.greenBright( 'Connected to MongoDB.' ) );
    } )
    .catch( dbConnectErr => { console.error( chalk.bold.red( 'Failed to connect to MongoDB:\n%o' ), dbConnectErr ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
}