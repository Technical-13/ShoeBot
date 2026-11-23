const modData = { ext: 'js', name: 'configSanitizer', platform: 'methods', type: 'mongodb' };
const bot = require( process.cwd() );
const { buildPath, utils } = bot;
const { isPlainObject } = utils;

/** Recursively filters data using a field whitelist.
 *
 * Arrays are processed item by item, nested objects are filtered recursively, and fields marked `true` are copied without further filtering.
 *
 * @param { * } data The data to filter.
 * @param { Object<string, *> } fields The field whitelist defining the allowed structure.
 * @returns { * } The filtered data.
 */
const pick = ( data, fields ) => {
  if ( Array.isArray( data ) ) { return data.map( item => pick( item, fields ) ); }
  if ( !isPlainObject( data ) ) { return data; }
  return Object.fromEntries(
    Object.entries( fields )
      .filter( ( [ key ] ) => Object.prototype.hasOwnProperty.call( data, key ) )
      .map( ( [ key, rule ] ) => {
        if ( rule === true ) { return [ key, data[ key ] ]; }
        if ( Array.isArray( rule ) ) { return [ key, data[ key ].map( item => pick( item, rule[ 0 ] ) ) ]; }
        return [ key, pick( data[ key ], rule ) ];
      } )
  );
};

/** Logs a sanitation error with the module's path and relevant details.
 *
 * @param { string } reason The reason identifying the sanitation error.
 * @param { string } [ name ] The affected persona or platform name, when applicable.
 * @returns { void }
 */
const logError = ( reason, name ) => {
  switch ( reason ) {
    case 'notArrayAPIs' :
      console.error( 'API data in %s was not an array for Persona: %s', buildPath( modData ).path, name );
      break;
    case 'notArrayPlatform' :
      console.error( 'Platform data in %s was not an array for: %s', buildPath( modData ).path, name );
      break;
    case 'notObjectPersona' :
      console.error( 'Persona data in %s was not an object.', buildPath( modData ).path );
      break;
    case 'notObjectPlatforms' :
      console.error( 'Platforms data in %s was not an object.', buildPath( modData ).path );
      break;
    case 'unknown' :
      console.error( 'Unknown platform detected in %s: %s', buildPath( modData ).path, name );
      break;
  }
};

/** Field whitelist for Discord Blacklist and Whitelist entries.
 *
 * Defines the fields retained when sanitizing individual Discord list entries.
 * The sanitizer adds `Locked: true` to each retained entry afterward.
 *
 * @type { Object<string, boolean> }
 */
const discordList = {
  Type: true,
  UserID: true,
  Username: true,
};

/** Field whitelist for Discord rank entries.
 *
 * Defines the fields retained when sanitizing individual Discord rank entries, including the assigned Role and the associated user information.
 *
 * @type { Object<string, boolean> }
 */
const discordRank = {
  Role: true,
  Type: true,
  UserID: true,
  Username: true,
};

/** Sanitizes Discord platform configuration data.
 *
 * Filters Discord entries against the supported field definitions and marks configuration-defined Blacklist and Whitelist entries as locked.
 *
 * @param { Object[] } data The Discord configuration entries to sanitize.
 * @returns { Object[] } The sanitized Discord configuration entries.
 */
const discord = data => {
  const result = pick( data, {
    Blacklist: [ discordList ],
    ClientID: true,
    DevGuildID: true,
    Ranks: {
      CoOwners: [ discordRank ],
      Moderators: [ discordRank ],
      Owner: discordRank,
      VIPs: [ discordRank ],
    },
    Prefix: true,
    Whitelist: [ discordList ],
  } );
  result.forEach( entry => {
    entry.Blacklist?.forEach( list => { list.Locked = true; } );
    entry.Whitelist?.forEach( list => { list.Locked = true; } );
  } );
  return result;
};

/** Sanitizes Facebook platform configuration data.
 *
 * Filters Facebook account details, credentials, profile information, verification status, synchronization metadata, and account metrics.
 *
 * @param { Object[] } data The Facebook configuration entries to sanitize.
 * @returns { Object[] } The sanitized Facebook configuration entries.
 */
/*const facebook = data => {
  return pick( data, {
    AccountCreatedAt: true,
    Credentials: {
      AccessToken: true,
      AuthenticatedAt: true,
      ExpiresAt: true,
      RefreshToken: true,
      Scopes: true,
      Type: true,
    },
    Description: true,
    LastSyncedAt: true,
    Metrics: {
      Followers: true,
      Likes: true,
      Posts: true,
    },
    Name: true,
    ProfileImageURL: true,
    ProfileURL: true,
    Type: true,
    UserID: true,
    Username: true,
    Verified: true,
    VerifiedType: true,
  } );
};//*/

/** Sanitizes GitHub platform configuration data.
 *
 * Filters repository branch information, issue and pull request details, account credentials, user identifiers, and workflow information.
 *
 * @param { Object[] } data The GitHub configuration entries to sanitize.
 * @returns { Object[] } The sanitized GitHub configuration entries.
 */
/*const github = data => {
  return pick( data, {
    Branches: [ {
      Default: true,
      LastCommit: true,
      Name: true,
      Protected: true,
      URL: true,
    } ],
    Credentials: {
      AccessToken: true,
      AuthenticatedAt: true,
      ExpiresAt: true,
      RefreshToken: true,
      Scopes: true,
      Type: true,
    },
    Issues: [ {
      Assignee: true,
      Author: true,
      BlockedBy: true,
      Blocking: true,
      ClosedAt: true,
      ClosedReason: true,
      CreatedAt: true,
      IssueID: true,
      Labels: true,
      Number: true,
      MergedOn: true,
      Milestone: true,
      PullRequest: true,
      State: true,
      Status: true,
      Title: true,
      Type: true,
      UpdatedOn: true,
      URL: true,
    } ],
    UserID: true,
    Username: true,
    Workflows: [ {
      LastRunAt: true,
      LastRunStatus: true,
      Name: true,
      Path: true,
      State: true,
      URL: true,
      WorkflowID: true,
    } ],
  } );
};//*/

/** Placeholder for IRC platform configuration sanitation.
 *
 * No filtering or transformation has been implemented yet.
 *
 * @param { Object[] } data The IRC configuration entries.
 * @returns { undefined } No sanitized data is currently returned.
 */
// const irc = data => {};

/** Sanitizes MediaWiki platform configuration data.
 *
 * Filters API location, authentication methods and credentials, session and token information, group membership, and owner/account details.
 *
 * @param { Object[] } data The MediaWiki configuration entries to sanitize.
 * @returns { Object[] } The sanitized MediaWiki configuration entries.
 */
/* const mediawiki = data => {
  return pick( data, {
    ApiURL: true,
    Authentication: {
      Methods: {
        BotPasswords: true,
        BrowserAutomation: true,
        ClientLogin: true,
        MainAccountLogin: true,
        OAuth: {
          Version: true,
        },
      },
      Password: true,
      PreferenceList: true,
      Session: {
        AuthenticatedAt: true,
        Cookie: true,
      },
      Tokens: {
        CSRF: true,
        RetrievedAt: true,
      },
    },
    Groups: true,
    Owner: {
      Groups: true,
      Registration: true,
      UserID: true,
      Username: true,
    },
    Registration: true,
    UserID: true,
    Username: true,
    WikiName: true,
  } );
};//*/

/** Sanitizes Twitter/X platform configuration data.
 *
 * Filters account details, credentials, profile information, location, verification status, synchronization metadata, and account metrics.
 *
 * @param { Object[] } data The Twitter/X configuration entries to sanitize.
 * @returns { Object[] } The sanitized Twitter/X configuration entries.
 */
/* const twitterX = data => {
  return pick( data, {
    AccountCreatedAt: true,
    Credentials: {
      AccessToken: true,
      AuthenticatedAt: true,
      ExpiresAt: true,
      RefreshToken: true,
      Scopes: true,
      TokenSecret: true,
    },
    Description: true,
    LastSyncedAt: true,
    Location: true,
    Metrics: {
      Followers: true,
      Following: true,
      Listed: true,
      Tweets: true,
    },
    Name: true,
    ProfileImageURL: true,
    ProfileURL: true,
    Protected: true,
    UserID: true,
    Username: true,
    Verified: true,
    VerifiedType: true,
  } );
};//*/

/** Placeholder for XenForo platform configuration sanitation.
 *
 * No filtering or transformation has been implemented yet.
 *
 * @returns { undefined } No sanitized data is currently returned.
 */
// const xenforo = () => {};

const getCleanDefault = ( objDefault ) => {
  const defaultData = { ...objDefault };
  defaultData.Discord.forEach( d => {
    return { ...d, d.Activities = [ { 'type': 'Custom', 'name': 'It Is My First Time!!!' } ], d.ClientID = '' };
  } );
  return defaultData;
};

/** Sanitizes a persona configuration.
 *
 * Validates the persona data, converts API names into CommonName objects, and sanitizes its platform configurations.
 *
 * @param { Object } data - The persona configuration to sanitize.
 * @param { Object } [ defaults ] - The default platform configuration to use as a baseline.
 * @returns { Object } The sanitized persona configuration, or an empty object if invalid.
 */
const persona = ( data, defaults ) => {
  if ( !isPlainObject( data ) ) { logError( 'notObjectPersona' ); return {}; }
  const APIs = !Array.isArray( data.APIs ) ? [] : data.APIs;
  if ( !Array.isArray( data.APIs ) ) {
    logError( 'notArrayAPIs', data.Name );
  }
  const defaultData = getCleanDefault( isPlainObject( defaults ) ? defaults : {} );
  const definedData = isPlainObject( data.Platforms ) ? data.Platforms : {};
  const platformData = Object.assign( {}, defaultData, definedData );
  return {
    APIs: ( APIs ).map( api => { return { CommonName: api }; } ),
    Enabled: data.Enabled,
    Name: data.Name,
    Platforms: platforms( platformData ),
  };
};

/** Sanitizes the platform configurations for a persona or the bot.
 *
 * Iterates through the supplied platform entries and delegates sanitation to the appropriate platform handler.
 *
 * @param { Object<string, Object[]> } data The platform configurations to sanitize.
 * @returns { Object<string, Object[]> } The sanitized platform configurations.
 */
const platforms = data => {
  if ( !isPlainObject( data ) ) { logError( 'notObjectPlatforms' ); return {}; }
  return Object.fromEntries(
    Object.entries( data ).map( ( [ name, entries ] ) => [ name, platform( name, entries ), ] )
  );
};

/** Sanitizes configuration entries for a specific platform.
 *
 * Validates the platform data and dispatches it to the corresponding platform-specific sanitation handler.
 *
 * @param { string } name The platform name.
 * @param { Object[] } data The configuration entries for that platform.
 * @returns { Object[] } The sanitized platform configuration entries.
 */
const platform = ( name, data ) => {
  if ( !Array.isArray( data ) ) { logError( 'notArrayPlatform', name ); return []; }
  switch ( name ) {
    case 'Discord': return discord( data );
    // case 'Facebook': return facebook( data );
    // case 'GitHub': return github( data );
    // case 'IRC': return irc( data );
    // case 'MediaWiki': return mediawiki( data );
    // case 'TwitterX': return twitterX( data );
    // case 'XenForo': return xenforo( data );
    default: logError( 'unknown', name ); return [];
  }
};

module.exports = { persona, platforms, platform };
