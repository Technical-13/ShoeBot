const modData = { ext: 'js', name: 'buildDefaultDB', platform: 'methods', type: 'mongodb' };
const bot = require( process.cwd() );
const { buildPath, config, z } = bot;
const { contacts, i18n } = z;
const getLangs = require( buildPath( { ...i18n, ext: 'js', name: 'getLanguages' } ).path );
const botLangs = getLangs();
const { load, ver } = config.dbData;

const cleanPersonas = ( config.Personas ?? [] ).map( persona => ( {
  APIs: persona.APIs.map( CommonName => ( { CommonName } ) ),
  Enabled: persona.Enabled,
  Name: persona.Name,
  Platforms: cleanPlatforms( persona.Platforms ),
} ) );

module.exports = () => {
  return {
    _id: load,
    Config: {
      CachedString: JSON.stringify( config ),
      LastModifiedAt: botLangs[ 0 ].LastUpdatedOn,
    },
    Languages: botLangs,
    Name: ( config.Name ),
    Contacts: require( contacts.path ),
    Personas: cleanPersonas,
    Platforms: ( config.Platforms ?? {} ),
    WebDash: ( config.WebDash ?? { Enabled: false } ),
    Verbosity: ( config.Verbosity ?? -1 ),
    Version: ver.BotConfig,
  };
}
