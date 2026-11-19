const modData = { ext: 'js', name: 'Snowflake', platform: 'mongodb', type: 'types' };
const mongoose = require( 'mongoose' );
const path = require( 'path' );
const bot = require( '../..' );
const { chalk, z } = bot;
const PF = require( z.json + '/snowflakeEpochs.json' );
const isPlainObject = obj => obj !== null && typeof obj === 'object' && Object.getPrototypeOf( obj ) === Object.prototype;

class Snowflake extends mongoose.SchemaType {
  constructor( key, options = {} ) {
    options = { ...options, platform: options.platform || 'default' };
    super( key, options, 'Snowflake' );
  }
  cast( val ) {
    let platform = this.options.platform;
    if ( isPlainObject( val ) ) {
      platform = val.platform || platform;
      val = val.value;
    }
    try {
      if ( !/^\d{1,25}$/.test( val ) ) { throw new Error( 'Snowflake: "' + chalk.bold( val ) + '" is not a numeric ID string.' ); }
      const P = PF[ platform ];
      if ( !P ) { throw new Error( 'Snowflake: Unknown platform configuration "' + chalk.bold( platform ) + '".' ); }
      const max = ( ( ( BigInt( Date.now() ) - BigInt( P.epoch ) ) << 22n ) | 0x3FFFFFn );
      const min = BigInt( P.min || '0' );
      const bintSF = BigInt( val );
      if ( min <= bintSF && bintSF <= max ) { return val; }
      throw new Error( 'Snowflake: "' + val + '" is not a valid ' + chalk.bold( platform ) + ' snowflake.' );
    }
    catch ( e ) {
      throw new mongoose.Error.CastError( 'Snowflake', val, this.path, new Error( e.message ) );
    }
  }
}

mongoose.Schema.Types.Snowflake = Snowflake;