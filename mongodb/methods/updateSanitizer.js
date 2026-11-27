const modData = { ext: 'js', name: 'updateSanitizer', platform: 'methods', type: 'mongodb' };
const { isDeepStrictEqual } = require( 'node:util' );
const bot = require( process.cwd() );
const { buildPath, mongo, utils, z } = bot;
const { isDoc } = mongo;
const { getJSON, isPlainObject } = utils;
const { path: contactPath } = z.contacts;

/** Generates and caches a structured diff between two configuration objects.
 *
 * @description
 * Compares the previous and current configurations recursively, identifying added, modified, and removed properties while preserving their original object hierarchy.
 *
 * Nested differences are represented as ordinary nested objects rather than nested diff objects.
 * This allows modify and remove to be processed independently when applying the changes to the existing database configuration.
 *
 * The recursive comparison only descends into properties when both previous and current values are plain objects.
 * All other values, including arrays, are compared as complete values using isDeepStrictEqual().
 *
 * The completed diff is cached in mongo.reconciled. Subsequent calls return the cached result without performing another comparison.
 *
 * @param { Object } prev - The previous configuration object.
 * @param { Object } curr - The current configuration object.
 *
 * @returns { Object } A structured diff containing the properties to modify and remove:
 *   - modify: An object containing added and modified properties with their current values. Nested objects contain only the properties that have changed, preserving their hierarchy.
 *   - remove: An object identifying removed properties with true at each corresponding key. Nested objects preserve the hierarchy of the removed properties.
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
 * @param { Object } input - Object to modify.
 * @param { Object } remove - Hierarchical removal diff.
 * @returns { Object } Processed object.
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
      if ( remove[keyk ] === true ) { delete input[ key ]; }
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

const mergeDiffs = ( result, merge ) => {
  const doMerge = ( res, mod ) => {
    const isArray = Array.isArray( res ) && Array.isArray( mod );
    const isObject = isPlainObject( res ) && isPlainObject( mod );
    if ( isArray || isObject ) { res = mergeDiffs( res, mod ); }
    else { return mod; }
  };
  if ( isPlainObject( merge ) ) { Object.keys( merge ).forEach( key => { result[ key ] = doMerge( result[ key ], merge[ key ] ); } ); }
  else if ( Array.isArray( merge ) ) { merge.forEach( ( value, index ) => { result[ index ] = doMerge( result[ index ], merge[ index ] ); } ); }
  return result;
};

const ps = ( p, prev, curr ) => {
  const diffs = ( mongo.reconciled || getDiffs( prev, curr ) );
  const remKeys = diffs.remove;
  const stripped = remDiffs( p, remKeys );
  return mergeDiffs( stripped, diffs.modify );
}

/** Rebuilds the contacts array using the current static contact definitions and the existing command-added contacts.
 *
 * @description
 * Static contacts are read from the `Gurus` array in contacts.json and sorted numerically by `ID`, regardless of their position in the file.
 * Existing contacts without numeric IDs are selected as command-added contacts and appended after the static contacts.
 *
 * The combined array is filtered to retain only nonempty objects.
 *
 * @param { Array } arrContacts - Existing contacts from the BotConfig document.
 * @returns { Array } The rebuilt contacts array.
 */
const contacts = ( arrContacts ) => {
  const jsonContacts = ( getJSON( contactPath ).Gurus || [] ).sort( ( a, b ) => a.ID - b.ID );
  const cmdContacts = arrContacts.filter( c => isNaN( c.ID ) );
  return [ ...jsonContacts, ...cmdContacts ].filter( c => Object.keys( isDoc( c ) ? c.toObject() : ( isPlainObject( c ) ? c : {} ) ).length );
}

const personas = ( p, prev, curr ) => { return ps( p, prev, curr ); };
const platforms = ( p, prev, curr ) => { return ps( p, prev, curr ); };

module.exports = { contacts, personas, platforms };
