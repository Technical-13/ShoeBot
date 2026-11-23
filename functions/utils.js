const buildPath = require( './Utilities/buildPath.js' );
const modData = { ext: 'js', name: 'utils', type: 'functions' };

/**
 * Loads ShoeBot's shared utility modules.
 *
 * Resolves each utility's path relative to the project root using buildPath(),
 * then requires and returns the utility modules as a single object.
 *
 * The internationalization and parser modules are themselves loaders,
 * allowing their platform-specific utilities to be grouped together.
 *
 * @returns {{
 *   buildPath: Function,
 *   duration: Function,
 *   i18n: Function,
 *   isPlainObject: Function,
 *   parser: Function
 * }} An object containing the loaded utility modules.
 *
 * @example
 * const utils = require( './functions/utils.js' )();
 * const { buildPath, duration, i18n, parser } = utils;
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
    buildPath: require( modPaths.buildPath ),
    duration: require( modPaths.duration ),
    i18n: require( modPaths.i18n ),
    isPlainObject: value => {
      if ( value === null || typeof value !== 'object' ) { return false; }
      const proto = Object.getPrototypeOf( value );
      return proto === Object.prototype || proto === null;
    },
    parser: require( modPaths.parser ),
  };
}