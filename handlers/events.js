const fs = require( 'fs' );
const chalk = require( 'chalk' );
var AsciiTable = require( 'ascii-table' );

module.exports = ( client ) => {
  try {
    const table = new AsciiTable().setHeading( 'Events', 'Loaded' ).setBorder( '|', '=', "0", "0" ).setAlignCenter( 1 );
    fs.readdirSync( './events/' ).filter( ( file ) => file.endsWith( '.js' ) ).forEach( ( event ) => {
        require( `../events/${event}` );
        table.addRow( event.split( '.js' )[ 0 ], '✅' );
    } );
    console.log( chalk.greenBright( table.toString() ) );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.hex( '#FFA500' ).bold( 'events.js' ), errObject.stack ); }
};