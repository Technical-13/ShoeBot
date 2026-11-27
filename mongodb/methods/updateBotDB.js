const modData = { ext: 'js', name: 'updateBotDB', platform: 'methods', type: 'mongodb' };
const bot = require( process.cwd() );
const { buildPath } = bot;
const sanitize = require( buildPath( { ...modData, name: 'updateSanitizer' } ).path );

/**
 * Updates an existing BotConfig document using the current default configuration.
 *
 * @description
 * Compares the previous and current configuration snapshots to determine which existing database values should be preserved.
 *
 * Rebuilds contacts when the contacts file modification timestamp has changed, then reconciles personas and platforms against the current configuration.
 *
 * Preserves the existing Name and Verbosity when their corresponding configuration values have not changed. Other configuration-authoritative values are taken from the updated default document.
 *
 * If an error occurs, returns a diagnostic BotConfig document containing the error details.
 *
 * @param { Object } curr - The existing BotConfig document.
 * @param { Object } result - The newly built default BotConfig document.
 * @param { Array } botIDs - Existing BotConfig IDs, used to generate a unique diagnostic ID.
 *
 * @returns { Object } The updated BotConfig document, or a diagnostic document if updating fails.
 */
module.exports = ( curr, result, botIDs ) => {
  try {
    const newConfig = JSON.parse( result.Backup.Config.CachedString );
    const oldConfig = JSON.parse( curr.Backup.Config.CachedString );
//    Languages should always be updated.
    if ( newConfig.Name === oldConfig.Name ) { result.Name = curr.Name; }
    if ( result.Backup.Contacts.LastModifiedAt.getTime() !== curr.Backup.Contacts.LastModifiedAt.getTime() ) {
      result.Contacts = sanitize.contacts( curr.Contacts );
    }
    result.Personas = sanitize.personas( curr.Personas, oldConfig, newConfig );
    result.Platforms = sanitize.platforms( curr.Platforms, oldConfig, newConfig );
//    WebDash should always be updated.
    if ( newConfig.Verbosity === oldConfig.Verbosity ) { result.Verbosity = curr.Verbosity; }
//    Version should always be updated.
  }
  catch ( updaterError ) {
    console.error( 'Failed to %s: %o', buildPath( modData ).path, updaterError );
    return { _id: 'Error-' + ( botIDs.filter( id => id.startsWith( 'Error' ) ) ).length + 1, Backup: { Config: {
      CachedString: JSON.stringify( { stack: updaterError.stack, string: updaterError.toString(), } ),
      LastModifiedAt: new Date(), }, },  Name: 'Failed Default Database Build', Verbosity: 5, Version: new Date(),
    };
  }
}
