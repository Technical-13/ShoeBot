const modData = { ext: 'js', name: 'updateSanitizer', platform: 'methods', type: 'mongodb' };
const { isDeepStrictEqual } = require( 'node:util' );
const bot = require( process.cwd() );
const { buildPath, mongo, utils, z } = bot;
const { isDoc } = mongo;
const { getJSON, isPlainObject } = utils;
const { path: contactPath } = z.contacts;

/** Generates and caches a structured diff between two configuration values.
 *
 * @description
 * Recursively compares the previous and current values, identifying added, modified, and removed properties while preserving their original hierarchy.
 *
 * When corresponding values are both plain objects or both arrays, comparison continues recursively.
 * Arrays are compared by index. All other values are compared as complete values using isDeepStrictEqual().
 *
 * Added and modified values are stored in `modify` with their current values. Removed properties are stored in `remove` with `true` at each corresponding key or array index. Nested differences preserve the original object or array structure.
 *
 * The completed diff is cached in mongo.reconciled. Subsequent calls return the cached result without performing another comparison.
 *
 * @param { Object | Array } prev - The previous value to compare.
 * @param { Object | Array } curr - The current value to compare.
 *
 * @returns { Object } A diff envelope containing:
 *   - modify: An object or array containing added and modified values.
 *   - remove: An object or array identifying removed properties with `true` markers.
 */
const getDiffs = ( prev, curr ) => {
  if ( mongo.reconciled ) { return mongo.reconciled; }
  const getDiff = ( prev, curr ) => {
    const isArray = Array.isArray( prev ) && Array.isArray( curr );
    const isObject = isPlainObject( prev ) && isPlainObject( curr );
    if ( !isArray && !isObject ) { return curr; }
    const prevKeys = Object.keys( prev );
    const currKeys = Object.keys( curr );
    const diff = { modify: isArray ? [] : {}, remove: isArray ? [] : {} };
    const addKeys = currKeys.filter( key => !prevKeys.includes( key ) );
    addKeys.forEach( key => { diff.modify[ key ] = curr[ key ]; } );
    const cmnKeys = currKeys.filter( key => prevKeys.includes( key ) );
    cmnKeys.forEach( key => {
      const nested = getDiff( prev[ key ], curr[ key ] );
      if ( nested && nested.modify && Object.keys( nested.modify ).length ) { diff.modify[ key ] = nested.modify; }
      if ( nested && nested.remove && Object.keys( nested.remove ).length ) { diff.remove[ key ] = nested.remove; }
      if ( !nested || !nested.modify ) {
        if ( !isDeepStrictEqual( prev[ key ], curr[ key ] ) ) { diff.modify[ key ] = curr[ key ]; }
      }
    } );
    const remKeys = prevKeys.filter( kill => !currKeys.includes( kill ) );
    remKeys.forEach( kill => { diff.remove[ kill ] = true; } );
    return diff;
  };
  mongo.reconciled = getDiff( prev, curr );
  return mongo.reconciled;
};

/** Recursively removes properties identified by a hierarchical removal diff.
 *
 * @description
 * Converts Mongoose documents to plain objects before processing.
 *
 * Object properties marked with `true` are deleted. Array entries marked with `true` are replaced with `null` and filtered out after processing.
 *
 * Nested objects and arrays are processed recursively when the input and removal diff contain matching container types.
 * Values that do not match the diff structure are left unchanged.
 *
 * @param { Object | Array } input - The object or array to process.
 * @param { Object | Array } remove - The hierarchical removal diff.
 *
 * @returns { Object | Array } The processed object or array with the specified properties removed.
 */
const remDiffs = ( input, remove ) => {
  if ( isDoc( input ) ) { input = input.toObject(); }
  const doRemoval = ( res, rem ) => {
    if ( isDoc( res ) ) { res = res.toObject(); }
    const isArray = Array.isArray( res ) && Array.isArray( rem );
    const isObject = isPlainObject( res ) && isPlainObject( rem );
    if ( isArray || isObject ) { return remDiffs( res, rem ); }
    return res;
  };
  if ( isPlainObject( remove ) ) {
    Object.keys( remove ).forEach( key => {
      if ( remove[ key ] === true ) { delete input[ key ]; }
      else { input[ key ] = doRemoval( input[ key ], remove[ key ] ); }
    } );
  }
  else if ( Array.isArray( remove ) ) {
    remove.forEach( ( kill, index ) => {
      if ( kill === true ) { input[ index ] = null; }
      else { input[ index ] = doRemoval( input[ index ], kill ); }
    } );
    input = input.filter( k => k !== null );
  }
  return input;
};

/** Recursively merges a hierarchical modification diff into an existing value.
 *
 * @description
 * Applies added and modified values from the diff while preserving existing values that are not included in the diff.
 *
 * When corresponding values are both plain objects or both arrays, merging continues recursively.
 * All other values are replaced with the values from the modification diff.
 *
 * Arrays are merged by index. Sparse modification arrays are supported; indices not present in the diff are left unchanged.
 *
 * @param { Object | Array } result - The existing value to update.
 * @param { Object | Array } merge - The hierarchical modification diff.
 *
 * @returns { Object | Array } The updated value after applying the modifications.
 */
const mergeDiffs = ( result, merge ) => {
  const doMerge = ( res, mod ) => {
    const isArray = Array.isArray( res ) && Array.isArray( mod );
    const isObject = isPlainObject( res ) && isPlainObject( mod );
    if ( isArray || isObject ) { return mergeDiffs( res, mod ); }
    else { return mod; }
  };
  if ( isPlainObject( merge ) ) { Object.keys( merge ).forEach( key => { result[ key ] = doMerge( result[ key ], merge[ key ] ); } ); }
  else if ( Array.isArray( merge ) ) { merge.forEach( ( value, index ) => { result[ index ] = doMerge( result[ index ], merge[ index ] ); } ); }
  return result;
};

/** Reconciles an existing value with the current configuration.
 *
 * @description
 * Retrieves the cached configuration diff or generates it if one does not exist.
 *
 * Applies removals first, then merges added and modified values into the resulting structure.
 *
 * @param { Object | Array } p - The existing value to reconcile.
 * @param { Object | Array } prev - The previous configuration value.
 * @param { Object | Array } curr - The current configuration value.
 *
 * @returns { Object | Array } The reconciled value.
 */
const ps = ( p, prev, curr ) => {
  const diffs = ( mongo.reconciled || getDiffs( prev, curr ) );
  const stripped = remDiffs( p, diffs.remove );
  return mergeDiffs( stripped, diffs.modify );
}

/** Combines static and command-added contacts into a single array.
 *
 * @description
 * Retrieves the static contacts from contacts.json and sorts them by ID in ascending order.
 *
 * Contacts without an ID are treated as command-added contacts and appended after the static contacts, preserving their existing order.
 *
 * Filters out empty objects. Mongoose documents are converted to plain objects for the purpose of checking their properties; retained documents remain unchanged.
 *
 * @param { Array } arrContacts - The existing contacts to check for command-added contacts.
 *
 * @returns { Array } The sorted static contacts followed by non-empty command-added contacts.
 */
const contacts = ( arrContacts ) => {
  const jsonContacts = ( getJSON( contactPath ).Gurus || [] ).sort( ( a, b ) => a.ID - b.ID );
  const cmdContacts = arrContacts.filter( c => c.ID === undefined );
  return [ ...jsonContacts, ...cmdContacts ].filter( c => Object.keys( isDoc( c ) ? c.toObject() : ( isPlainObject( c ) ? c : {} ) ).length );
}

/** Reconciles persona or platform configuration with the current configuration.
 *
 * @description
 * Delegates reconciliation to ps(), which applies the cached or newly generated configuration diff to the existing value.
 *
 * @param { Object | Array } p - The existing persona or platform configuration.
 * @param { Object | Array } prev - The previous configuration value.
 * @param { Object | Array } curr - The current configuration value.
 *
 * @returns { Object | Array } The reconciled configuration.
 */
const personas = ( p, prev, curr ) => { return ps( p, prev, curr ); };
const platforms = ( p, prev, curr ) => { return ps( p, prev, curr ); };

module.exports = { contacts, personas, platforms };
