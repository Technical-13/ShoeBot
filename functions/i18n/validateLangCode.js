const modData = { ext: 'js', group: 'i18n', name: 'validateLangCode', type: 'functions' };

/**
 * Validates an IANA language tag and retrieves its display name.
 *
 * Uses Intl.DisplayNames to return the supplied language tag's display name in the requested locale if it is recognized and valid.
 *   - If no display locale is supplied, the language tag's own locale is used.
 *
 * @param { string } langCode - The IANA language tag to validate.
 * @param { string } [ ofLang = langCode ] - The language tag specifying the display locale.
 *
 * @returns { string | false } The localized language name or false if the tag is invalid or unrecognized.
 */
module.exports = ( langCode, ofLang ) => {
  if ( typeof langCode !== 'string' ) { return false; }
  if ( !ofLang ) { ofLang = langCode }
  try {
    const getName = new Intl.DisplayNames( [ ofLang ], { type: 'language' } );
    const resName = getName.of( langCode );
    return resName === langCode ? false : resName;
  } catch ( objError ) { return false; }
};
