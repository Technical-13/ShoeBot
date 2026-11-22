const modData = { ext: 'js', group: 'Bot', name: 'Persona', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );

const dSchema = require( './Platforms/Discord.js' );
const fbSchema = require( './Platforms/Facebook.js' );
const ghSchema = require( './Platforms/GitHub.js' );
const mwSchema = require( './Platforms/MediaWiki.js' );
const txSchema = require( './Platforms/TwitterX.js' );

const botPersonaSchema = new Schema( {
  APIs: [ {
    AccessToken: String,
    AccessTokenSecret: String,
    API_URL: String,
    BearerToken: String,
    CommonName: { required: [ true, 'CommonName is a required field.' ], type: String, },
    ConsumerKey: String,
    ConsumerSecret: String,
    Key: String,
    Password: String,
    Token: String,
    Username: String,
  } ],
  Database: {
    Database: String,
    Options: [ {
      Key: String,
      Value: String,
    } ],
    Password: String,
    Token: String,
    Username: String,
  },
  Enabled: { default: false, required: true, type: Boolean },
  Name: { required: [ true, 'Name is a required field.' ], type: String, },
  Platforms: {
    Discord: [ dSchema ],
    Facebook: [ fbSchema ],
    GitHub: [ ghSchema ],
    MediaWiki: [ mwSchema ],
    TwitterX: [ txSchema ],
  },
}, { _id: false } );

module.exports = botPersonaSchema;
