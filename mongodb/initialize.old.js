//const modData = { name: 'initialize', platform: 'methods', type: 'mongodb' };
//const { buildPath, chalk, config, env, mongoose } = bot;
//mongoose.set( 'strictQuery', false );
const getBotConfig = require( buildPath( { ...modData, name: 'getBotDB', type: 'models' } ) );

//module.exports = async () => {
//  try {
/* SKIPPING THIS PROCESS FOR NOW - PROBABLY NOT REALLY NEEDED? *//*    await mongoose.disconnect()
    .then( () => { console.log( chalk.yellow( 'MongoDB closed.' ) ); } )
    .catch( errDisconnect => {
      console.warn( '%s %s', chalk.bold.yellow( 'Warning during MongoDB disconnect:' ), errDisconnect.message );
    } );//*/

/*    if ( !env.mongodb ) {// USED
      console.error( chalk.bold.redBright( 'mongodb authentication credential string missing from .env file.  Please add it and try again.' ) );
      const errAuth = new Error( 'MongoDB authentication credentials missing.' );
      errAuth.wasCaught = true;
      throw errAuth;
    }//*/
    await mongoose.connect( env.mongodb ).then( async () => {
      console.log( chalk.greenBright( 'Connected bot to MongoDB.' ) );
//      await getBotConfig();
    } ).catch( errConnect => {
      console.error( chalk.bold.red( 'Failed to connect bot to MongoDB:\n%o' ), errConnect.message );
      errConnect.wasCaught = true;
      throw errConnect;
    } );
//  }
//  catch ( errObject ) {
/*    if ( !errObject.wasCaught ) {//USED
      //const strScript = chalk.hex( '#FFA500' ).bold( client.getModPath( modData ) );// TEMPORARY --- WILL BE IN ERROR HANDLER LATER
      console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './mongodb/initialize.js' ), errObject.stack );
    }
    throw errObject;//*/
//  }
//}