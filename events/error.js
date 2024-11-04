const client = require( '..' );
const chalk = require( 'chalk' );

client.on( 'error', err => {
	console.error( chalk.bold.black.bgCyan( `An unhandled error has occured [${err.code}]: ${err.message}\n${err}` ) );
} );