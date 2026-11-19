const path = require( 'path' );
const root = path.resolve( __dirname, '..' );
const modData = { ext: 'js', file: 'buildPath.js', name: 'buildPath', path: path.resolve( root, 'functions/buildPath.js' ), type: 'functions' };

/**
 * Loaded into bot.buildPath in index.js.
 * Resolves a structured path configuration into an absolute filesystem path.
 * Paths are resolved relative to the ShoeBot project root.
 *
 * @param { Object } objPath - The path configuration object.
 * @param { string } [ objPath.ext ] - Optional file extension, without the leading dot. An empty string is permitted.
 * @param { string | Array<string|number|Date> } [ objPath.group ] - Optional subdirectory or array of nested subdirectories.
 * @param { Array<string|number|Date> } [ objPath.groups ] - Optional array of nested subdirectories.
 *   If both group and groups are supplied, they are processed and added to the full path in that order.
 * @param { string } objPath.name - Required base filename.
 * @param { string } [ objPath.platform ] - Optional platform directory.
 * @param { string } [ objPath.type ] - Optional directory category.
 * @param { string } [ objPath.file ] - Optional filename override. If supplied and different from the calculated filename, the calculated filename is retained as bFile.
 * @param { string } [ objPath.path ] - Optional path override. If supplied and different from the validated calculated path, the validated calculated path is retained as bPath.
 *
 * @returns { Object } An object containing the original configuration properties and the calculated or overridden values:
 *   - file: The calculated filename, unless overridden by objPath.file.
 *   - path: The calculated absolute path, unless overridden by objPath.path.
 *   - bFile: The calculated filename when file is overridden.
 *   - bPath: The validated calculated absolute path when path is overridden.
 *
 * @throws { Error } If name is missing or is not a string.
 *
 * @description
 * Array elements are normalized before being added to the path:
 *   - Strings are retained.
 *   - Finite numbers are converted to strings.
 *   - Valid Date objects are converted to UTC timestamps in YYYY-MM-DDT########Z format, where ######## is an eight-digit zero-padded number of milliseconds since midnight UTC.
 *   - Unsupported elements are ignored.
 *
 * Empty array elements are removed before path resolution. Empty arrays and single-element arrays generate console warnings or informational messages, respectively.
 *
 * The calculated absolute path is validated to ensure it remains within the ShoeBot project root. If validation fails, a warning is logged and the calculated path falls back to the project root.
 *
 * Path validation checks the resolved path, not whether the resulting file or directory exists. It does not perform filesystem existence checks.
 *
 * Caller-supplied file and path overrides take precedence over the calculated values. The bFile and bPath properties preserve the corresponding calculated values when overrides are supplied.
 *
 * @example
 * // Returns a path resembling:
 * // /«root»/platforms/discord/handlers/connection/ready.js
 * buildPath( {
 *   ext: 'js', group: 'handlers/connection', name: 'ready', platform: 'discord', type: 'platforms'
 * } );
 *
 * // OR
 *
 * buildPath( {
 *   ext: 'js', group: [ 'handlers', 'connection' ], name: 'ready', platform: 'discord', type: 'platforms'
 * } );
 *
 * @example
 * // Override the calculated path while retaining it as bPath.
 * buildPath( {
 *   name: 'ready', type: 'platforms', platform: 'discord',
 *   path: './custom/ready.js'
 * } );
 */
module.exports = ( objPath = {} ) => {
  const { ext, group, groups, name, platform, type } = objPath;
  if ( !name ) { throw new Error( '"objPath.name" is required to buildPath()' ); }
  if ( typeof name !== 'string' ) { throw new Error( '"objPath.name" is required to be a "string" to buildPath()' ); }
  const pathBuilder = [];
  if ( typeof type === 'string' ) { pathBuilder.push( type ); }
  if ( typeof platform === 'string' ) { pathBuilder.push( platform ); }
  if ( typeof group === 'string' ) { pathBuilder.push( group ); }
  if ( Array.isArray( group ) || Array.isArray( groups ) ) {
    const groupW = [ ...( Array.isArray( group ) ? group : [] ), ...( Array.isArray( groups ) ? groups : [] ) ];
    if ( groupW.length === 0 ) { console.warn( 'Empty array received in %o: %o', modData, objPath ); }
    else {
      if ( groupW.length === 1 ) { console.info( 'Single item array received in %o: %o', modData, objPath ); }
      groupW.forEach( ( g, i ) => {
        if ( typeof g === 'string' ) { groupW[ i ] = g; }
        else if ( Number.isFinite( g ) ) { groupW[ i ] = String( g ); }
        else if ( Object.prototype.toString.call( g ) === '[object Date]' && !Number.isNaN( g.getTime() ) ) {
          const date = g.getUTCFullYear() + '-' + String( g.getUTCMonth() + 1 ).padStart( 2, '0' ) + '-' + String( g.getUTCDate() ).padStart( 2, '0' );
          const time = String( ( ( ( ( g.getUTCHours() * 60 ) + g.getUTCMinutes() ) * 60 + g.getUTCSeconds() ) * 1000 ) + g.getUTCMilliseconds() ).padStart( 8, '0' );
          groupW[ i ] = date + 'T' + time + 'Z';
        }
        else { groupW[ i ] = null; }
      } );
      pathBuilder.push( ...groupW );
    }
  }
  const file = name + ( typeof ext === 'string' ? '.' + ext : '' );
  pathBuilder.push( file );
  let res = path.resolve( root, pathBuilder.filter( e => !!e ).join( '/' ) );
  const relative = path.relative( root, res );
  if ( relative === '..' || relative.startsWith( '..' + path.sep ) || path.isAbsolute( relative ) ) {
    console.warn( '%s is returning the root path because parameters resulted in an invalid path: %o', modData.path, { bFile: file, bPath: res, ...objPath } );
    res = root;
  }
  if ( objPath.file && objPath.file !== file ) { objPath.bFile = file; }
  if ( objPath.path && objPath.path !== res ) { objPath.bPath = res; }
  return { file: file, path: res, ...objPath };
};
