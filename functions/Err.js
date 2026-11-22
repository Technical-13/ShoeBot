const buildPath = require( './Utilities/buildPath.js' );
const modData = buildPath( { ext: 'js', name: 'Err', type: 'functions' } );

/**
 * Determines whether a value is an accepted metadata container.
 *
 * Accepts arrays and plain objects, excluding null, built-in object types, and instances of custom classes.
 *
 * @param {*} m - The value to evaluate.
 * @returns {boolean} Whether the value is an accepted metadata container.
 */
const isMetadata = m => Array.isArray( m ) || ( m !== null && typeof m === 'object' && ( Object.getPrototypeOf( m ) === Object.prototype ) );

/**
 * Custom Error subclass supporting additional metadata.
 *
 * Additional metadata is stored in the botErr property, keeping it separate from the standard Error properties.
 * The original message is also included in botErr.message.
 *
 * @class Err
 * @extends Error
 */
class Err extends Error {
  /**
   * Creates an instance of Err.
   *
   * @param { string | Object<string, *> } msg - The error message or metadata object.
   *   If metadata is supplied without a message, the Error message is set to 'undefined'.
   * @param { Object<string, *> } [ data = {} ] - Additional metadata to attach to the botErr property.
   *   The original message is assigned to data.message.
   *
   * @throws { Error } If neither a message nor metadata is provided.
   */
  constructor( msg, data = {} ) {
    if ( arguments.length === 0 ) { throw new Error( 'ERROR! "' + modData.path + '" requires a {string} message or {Object} metadata.' ); }
    if ( arguments.length === 1 && isMetadata( msg ) ) {
      data = msg;
      msg = 'undefined';
    }
    super( msg );
    data.message = msg;
    this.botErr = data;
  }
}

module.exports = Err;
