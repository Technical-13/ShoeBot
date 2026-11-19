const buildPath = require( './buildPath.js' );
const modData = buildPath( { ext: 'js', name: 'Err', type: 'functions' } );

/**
 * Determines whether a value is an accepted metadata container.
 *
 * Accepts arrays and plain objects, excluding null, built-in object
 * types, and instances of custom classes.
 *
 * @param {*} m - The value to evaluate.
 * @returns {boolean} Whether the value is an accepted metadata container.
 */
const isMetadata = m => Array.isArray( m ) || ( m !== null && typeof m === 'object' && ( Object.getPrototypeOf( m ) === Object.prototype ) );

/**
 * Custom Error subclass supporting additional metadata.
 *
 * Metadata properties are assigned directly to the error instance,
 * making them accessible alongside standard Error properties.
 *
 * @class Err
 * @extends Error
 *
 * @example
 * // Error with a message.
 * throw new Err( 'Database connection failed' );
 *
 * @example
 * // Error with a message and metadata.
 * throw new Err( 'Database connection failed', {
 *   code: 'DB_CONNECTION',
 *   retry: true
 * } );
 *
 * @example
 * // Error with metadata only.
 * throw new Err( {
 *   code: 'DB_CONNECTION',
 *   retry: true
 * } );
 */
class Err extends Error {
  /**
   * Creates an instance of Err.
   *
   * @param {string|Object<string, *>} msg - The error message or metadata object.
   * @param {Object<string, *>} [data={}] - Additional metadata to attach to the error.
   *
   * @throws {Error} If neither a message nor metadata is provided.
   */
  constructor( msg, data = {} ) {
    if ( arguments.length === 0 ) { throw new Error( 'ERROR! "./functions/Err.js" requires a {string} message or {Object} metadata.' ); }
    if ( arguments.length === 1 && isMetadata( msg ) ) {
      data = msg;
      msg = 'undefined';
    }
    super( msg );
    Object.assign( this, data );
  }
}

module.exports = Err;