const buildPath = require( './Utilities/buildPath.js' );
const modData = { ext: 'js', name: 'utils', type: 'functions' };

/**
 * Loads ShoeBot's shared utility modules.
 *
 * Returns a collection of utility modules as a single object.
 *
 * The internationalization and parser modules are themselves loaders, allowing their platform-specific utilities to be grouped together.
 *
 * @returns { {
 *   asBoolean: Function,
 *   buildPath: Function,
 *   duration: Function,
 *   getJSON: Function,
 *   i18n: Function,
 *   isPlainObject: Function,
 *   parser: Function
 * } } An object containing the loaded utility modules.
 */
module.exports = () => {
  const basePath = { ...modData, group: 'Utilities' };
  const modPaths = {
    buildPath: buildPath( { ...basePath, name: 'buildPath' } ).path,
    duration: buildPath( { ...basePath, name: 'duration' } ).path,
    i18n: buildPath( { ...basePath, name: 'getInternationalizations' } ).path,
    parser: buildPath( { ...basePath, name: 'parser' } ).path,
  };
  return {
    asBoolean: value => {
      if ( typeof value === 'boolean' ) { return value; }
      if ( value === 0 || value === 1 ) { return !!value; }
      if ( typeof value === 'string' ) { value = value.trim().toLowerCase(); }
      if ( value === 'true' ) { return true; }
      if ( value === 'false' ) { return false; }
      return false;
    },
    buildPath: require( modPaths.buildPath ),
    duration: require( modPaths.duration ),
    getJSON: value => {
      try { return require( value ); }
      catch ( fileError ) {
        console.error( 'Missing or invalid %s file: %o', value, fileError );
        return {};
      }
    },
    i18n: require( modPaths.i18n ),
    isPlainObject: value => {
      if ( value === null || typeof value !== 'object' ) { return false; }
      const proto = Object.getPrototypeOf( value );
      return proto === Object.prototype || proto === null;
    },
    parser: require( modPaths.parser ),
  };
}