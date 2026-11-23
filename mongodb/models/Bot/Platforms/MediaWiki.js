const modData = { ext: 'js', group: [ 'Bot', 'Platforms' ], name: 'MediaWiki', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );

const mwSchema = new Schema( {
  ApiURL: { required: [ true, 'ApiURL is a required field.' ], type: String },
  Authentication: {
    Methods: {
      BotPasswords: Boolean,
      BrowserAutomation: Boolean,
      ClientLogin: Boolean,
      MainAccountLogin: Boolean,
      OAuth: {
        Version: [ {
          enum: {
            message: '{VALUE} is not a valid OAuth version.',
            values: [ '1.0a', '2.0' ],
          },
          type: String,
        } ],
      },
    },
    Password: String,
    PreferenceList: {
      type: [ {
        enum: {
          message: '{VALUE} is not a valid authentication method.',
          values: [ 'BotPasswords', 'BrowserAutomation', 'ClientLogin', 'MainAccountLogin', 'OAuth 1.0a', 'OAuth 2.0' ],
        },
        type: String,
      } ],
      validate: {
        message: 'PreferenceList cannot contain duplicate authentication methods.',
        validator: arr => arr.length === new Set( arr ).size,
      },
    },
    Session: {
      AuthenticatedAt: Date,
      Cookie: String,
    },
    Tokens: {
      CSRF: String,
      RetrievedAt: Date,
    }
  },
  Groups: [ String ],
  Owner: {
    Groups: [ String ],
    Registration: Date,
    UserID: Number,
    Username: String,
  },
  Registration: Date,
  UserID: { required: [ true, 'UserID is a required field.' ], type: Number },
  Username: String,
  WikiName: String,
}, { _id: false } );

module.exports = mwSchema;
