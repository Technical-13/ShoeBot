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
    const diff = { modify: {}, remove: {} };
    const prevKeys = Object.keys( prev );
    const currKeys = Object.keys( curr );
    const addKeys = currKeys.filter( k => !prevKeys.includes( k ) );
    addKeys.forEach( k => { diff.modify[ k ] = curr[ k ]; } );
    const cmnKeys = currKeys.filter( k => prevKeys.includes( k ) );
    cmnKeys.forEach( k => {
      if ( isPlainObject( prev[ k ] ) && isPlainObject( curr[ k ] ) ) {
        const nested = getDiff( prev[ k ], curr[ k ] );
        if ( Object.keys( nested.modify ).length ) { diff.modify[ k ] = nested.modify; }
        if ( Object.keys( nested.remove ).length ) { diff.remove[ k ] = nested.remove; }
      }
      else if ( !isDeepStrictEqual( prev[ k ], curr[ k ] ) ) { diff.modify[ k ] = curr[ k ]; }
    } );
    const remKeys = prevKeys.filter( k => !currKeys.includes( k ) );
    remKeys.forEach( k => { diff.remove[ k ] = true; } );
    return diff;
  };
  mongo.reconciled = getDiff( prev, curr );
  return mongo.reconciled;
};

/** Rebuilds the contacts array using the current static contact definitions and the existing command-added contacts.
 *
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

const personas = () => {}

const platforms = () => {}

module.exports = { contacts, personas, platforms };
