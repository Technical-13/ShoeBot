const modData = { ext: 'js', group: 'i18n', name: 'getLanguages', type: 'functions' };
const root = process.cwd();
const bot = require( root );
const { config, Err, fs, utils, z } = bot;
const { botLang, botLangs } = { botLang: config.language, botLangs: z.languages.path };
const { validateLangCode } = utils.i18n;

/**
 * Retrieves metadata for ShoeBot's available language files.
 *
 * Scans the language directory specified in `bot.z.languages` for files with `.json` extension,
 *   then returns filename, language code, last modified date, localized, and native language name metadata.
 * Expect language files to be named with `LanguageCode.json` format:
 *   - files ending anything other than lower case `.json` are ignored.
 *   - files with a filename that aren't a valid IANA language code are rejected.
 * Results are sorted alphabetically by language code.
 * Always injects metadata at index 0 of the resulting array for the configured `language` in `config.json`.
 *
 * @throws { Error } If the configured `language` in `config.json` is not a valid IANA language tag.
 *
 * @returns { {
 *   Filename: string,
 *   LanguageCode: string,
 *   LastUpdatedOn: Date,
 *   LocalName: string,
 *   NativeName: string
 * }[] } An array of language metadata objects.
 */
module.exports = () => {
  const botNativeLang = validateLangCode( botLang );
  if ( !botNativeLang ) {
    throw new Err( 'Invalid IANA `language` tag of "' + botLang + '" defined in config.json.\n\tPlease use a valid tag found on https://github.com/mattcg/language-subtag-registry/blob/master/data/json/registry.json', { bot: { config: { language: botLang } } } );
  }
  const fileSet = fs.readdirSync( botLangs, { withFileTypes: true } )
    .filter( file => {
      if ( !file.isFile() ) { return false; }
      if ( !file.name.endsWith( '.json' ) ) { return false; }
      file.langCode = file.name.slice( 0, -5 );
      file.localName = validateLangCode( file.langCode, botLang );
      file.nativeName = validateLangCode( file.langCode );
      if ( !( file.localName && file.nativeName ) ) { return false; }
      return file;
    } )
    .map( file => {
      const filePath = botLangs + '/' + file.name;
      const lastUpdatedOn = fs.statSync( filePath ).mtime;
      return {
        Filename: file.name,
        LanguageCode: file.langCode,
        LastUpdatedOn: lastUpdatedOn,
        LocalName: file.localName,
        NativeName: file.nativeName,
      };
    } );
  fileSet
    .sort( ( a, b ) => a.LanguageCode.localeCompare( b.LanguageCode ) )
    .unshift( {
      Filename: 'config.json',
      LanguageCode: botLang,
      LastUpdatedOn: fs.statSync( root + '/config.json' ).mtime,
      LocalName: botNativeLang,
      NativeName: botNativeLang,
    } );
  return fileSet;
};
