const modData = { ext: 'js', name: 'configSanitizer', platform: 'methods', type: 'mongodb' };
const bot = require( process.cwd() );
const { buildPath, utils } = bot;
const { isPlainObject } = utils;

class Sanitize {

  __pick( data, fields ) {
    if ( Array.isArray( data ) ) { return data.map( item => this.__pick( item, fields ) ); }
    if ( !isPlainObject( data ) ) { return data; }

    return Object.fromEntries(
      Object.entries( fields )
        .filter( ( [ key ] ) => Object.prototype.hasOwnProperty.call( data, key ) )
        .map( ( [ key, rule ] ) => [ key, rule === true ? data[ key ] : this.__pick( data[ key ], rule ), ] )
    );
  }

  __logError( reason, name ) {
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
  }

  _Discord( data ) {
    const rank = {
      Role: true,
      Type: true,
      UserID: true,
      Username: true,
    };
    const list = {
      Type: true,
      UserID: true,
      Username: true,
    };

    const result = this.__pick( data, {
      Blacklist: [ list ],
      ClientID: true,
      DevGuildID: true,
      Ranks: {
        CoOwners: [ rank ],
        Moderators: [ rank ],
        Owner: rank,
        VIPs: [ rank ],
      },
      Prefix: true,
      Whitelist: [ list ],
    } );
    result.forEach( Discord => {
      Discord.Blacklist?.forEach( list => { list.Locked = true; } );
      Discord.Whitelist?.forEach( list => { list.Locked = true; } );
    } );
    return result;
  }

/*  _Facebook( data ) {
    return this.__pick( data, {
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
  }//*/

/*  _GitHub( data ) {
    return this.__pick( data, {
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
  }//*/

//  _IRC( data ) {}

/*  _MediaWiki( data ) {
    return this.__pick( data, {
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
  }//*/

/*  _TwitterX( data ) {
    return this.__pick( data, {
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
  }//*/

//  _XenForo() {}

  constructor() {}

  persona( data ) {
    if ( !isPlainObject( data ) ) { this.__logError( 'notObjectPersona' ); return {}; }
    let APIs = data.APIs;
    if ( !Array.isArray( data.APIs ) ) {
      this.__logError( 'notArrayAPIs', data.Name );
      APIs = [];
    }
    return {
      APIs: ( APIs ).map( api => { return { CommonName: api }; } ),
      Enabled: data.Enabled,
      Name: data.Name,
      Platforms: this.platforms( data.Platforms ?? {} ),
    };
  }

  platforms( data ) {
    if ( !isPlainObject( data ) ) { this.__logError( 'notObjectPlatforms' ); return {}; }
    return Object.fromEntries(
      Object.entries( data ).map( ( [ name, entries ] ) => [ name, this.platform( name, entries ), ] )
    );
  }

  platform( name, data ) {
    if ( !Array.isArray( data ) ) { this.__logError( 'notArrayPlatform', name ); return []; }
    switch ( name ) {
      case 'Discord': return this._Discord( data );
//      case 'Facebook': return this._Facebook( data );
//      case 'GitHub': return this._GitHub( data );
//      case 'IRC': return this._IRC( data );
//      case 'MediaWiki': return this._MediaWiki( data );
//      case 'TwitterX': return this._TwitterX( data );
//      case 'XenForo': return this._XenForo( data );
      default: this.__logError( 'unknown', name ); return [];
    }
  }
}

module.exports = Sanitize;
