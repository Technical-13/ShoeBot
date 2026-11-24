const modData = { ext: 'js', name: 'buildDefaultDB', platform: 'methods', type: 'mongodb' };
const root = process.cwd();
const bot = require( root );
const { buildPath, config, fs, utils, z } = bot;
const { getJSON } = utils;
const { contacts, i18n } = z;
const botLangs = require( buildPath( { ...i18n, ext: 'js', name: 'getLanguages' } ).path )();
const { load, ver } = config.dbData;
const sanitize = require( buildPath( { ...modData, name: 'configSanitizer' } ).path );

/**
 * Builds the default BotConfig document from the current `config.json` file.
 *
 * Loads language and contact data, sanitizes persona and platform configurations, and assembles the complete object used to create or update the BotConfig document.
 *
 * Missing or invalid contact data is logged and replaced with an empty object.
 *
 * @returns { Object<string, *> } The completed default BotConfig document, or a diagnostic document if building fails.
 */
module.exports = () => {
  try {
    const platformDefaults = sanitize.platforms( config.Platforms );
    const contactData = getJSON( contacts.path );
    return {
      _id: load,
      Backup: {
        Config: {
          CachedString: JSON.stringify( config ),
          LastModifiedAt: fs.statSync( root + '/config.json' ).mtime,
        },
        Contacts: {
          CachedString: JSON.stringify( contactData ),
          LastModifiedAt: fs.statSync( contacts.path ).mtime,
        },
      },
      Contacts: contactData,
      Languages: botLangs,
      Name: config.Name,
      Personas: config.Personas.map( persona => sanitize.persona( persona, platformDefaults ) ),
      Platforms: platformDefaults,
      WebDash: ( config.WebDash ?? { Enabled: false } ),
      Verbosity: ( config.Verbosity ?? 5 ),
      Version: ver.BotConfig,
    };
  }
  catch ( builderError ) {
    console.error( 'Failed to %s: %o', buildPath( modData ).path, builderError );
    return {
      _id: 'Error',
      Backup: {
        Config: {
          CachedString: JSON.stringify( {
            stack: builderError.stack,
            string: builderError.toString(),
          } ),
          LastModifiedAt: new Date(),
        },
      },
      Name: 'Failed Default Database Build',
      Verbosity: 5,
      Version: new Date(),
    };
  }
}
