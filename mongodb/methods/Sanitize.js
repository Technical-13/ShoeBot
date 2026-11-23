const modData = { ext: 'js', name: 'Sanitize', platform: 'methods', type: 'mongodb' };

class Sanitize {

  __pick( data, fields ) {
    if ( Array.isArray( data ) ) { return data.map( item => this.__pick( item, fields ) ); }
    if ( !data || typeof data !== 'object' ) { return data; }

    return Object.fromEntries(
      Object.entries( fields )
        .filter( ( [ key ] ) => Object.prototype.hasOwnProperty.call( data, key ) )
        .map( ( [ key, rule ] ) => [ key, rule === true ? data[ key ] : this.__pick( data[ key ], rule ), ] )
    );
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
    result.Blacklist.forEach( list => { list.Locked = true; } );
    result.Whitelist.forEach( list => { list.Locked = true; } );
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
    if ( !data || typeof data !== 'object' || Array.isArray( data ) ) { throw new TypeError( 'Persona data must be an object.' ); }
    return {
      APIs: ( data.APIs ?? [] ).map( api => { return { CommonName: api }; } ),
      Enabled: data.Enabled,
      Name: data.Name,
      Platforms: this.platforms( data.Platforms ?? {} ),
    };
  }

  platforms( data ) {
    if ( !data || typeof data !== 'object' || Array.isArray( data ) ) { throw new TypeError( 'Platforms data must be an object.' ); }
    return Object.fromEntries(
      Object.entries( data ).map( ( [ name, entries ] ) => [ name, this.platform( name, entries ), ] )
    );
  }

  platform( name, data ) {
    if ( !Array.isArray( data ) ) { throw new TypeError( name + ' platform data must be an array.' ); }
    switch ( name ) {
      case 'Discord': return this._Discord( data );
//      case 'Facebook': return this._Facebook( data );
//      case 'GitHub': return this._GitHub( data );
//      case 'IRC': return this._IRC( data );
//      case 'MediaWiki': return this._MediaWiki( data );
//      case 'TwitterX': return this._TwitterX( data );
//      case 'XenForo': return this._XenForo( data );
      default: throw new Error( 'Unsupported platform: ' + name );
    }
  }
}

module.exports = Sanitize;
