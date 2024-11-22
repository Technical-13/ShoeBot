const client = require( '..' );
require( 'dotenv' ).config();
const ENV = process.env;
const mongoose = require( 'mongoose' );
const chalk = require( 'chalk' );

client.on( 'error', async err => {
  ENV.clientStatus = 'crashed';
  await mongoose.disconnect()
  .then( dbDisconnected => console.log( chalk.yellow( 'MongoDB closed.' ) ) )
  .catch( disconnectError => console.log( chalk.red( 'Failed to close MongoDB on unhandled error: %o', disconnectError ) ) );
	console.error( '%s%s%s%s%s\n%o', chalk.bold.cyan.inverse( 'An unhandled error has occured [' ), err.code, chalk.bold.cyan.inverse( '] ' ), err.message, chalk.bold.cyan.inverse( ':' ), err );
} );