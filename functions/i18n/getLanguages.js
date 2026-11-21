const modData = { ext: 'js', group: 'i18n', name: 'getLanguages', type: 'functions' };
const bot = require( process.cwd() );
const { config, fs, z } = bot;
const { botLang, botLangs } = { botLang: config.language, botLangs: z.languages };

module.exports = () => {
  const localNames = new Intl.DisplayNames( [ botLang ], { type: 'language' } );
  return fs.readdirSync( botLangs, { withFileTypes: true } )
    .filter( file => file.isFile() && file.name.endsWith( '.json' ) )
    .map( file => {
      const fileName = file.name;
      const langCode = fileName.slice( 0, -5 );
      const filePath = botLangs + '/' + fileName;
      const lastUpdatedOn = fs.statSync( filePath ).mtime;
      const nativeNames = new Intl.DisplayNames( [ langCode ], { type: 'language' } );
      return {
        fileName: fileName,
        langCode: langCode,
        lastUpdatedOn: lastUpdatedOn,
        localName: localNames.of( langCode ),
        nativeName: nativeNames.of( langCode ),
      };
    } )
    .sort( ( a, b ) => a.langCode.localeCompare( b.langCode ) );
};
