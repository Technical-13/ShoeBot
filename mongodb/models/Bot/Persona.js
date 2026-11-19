const modData = { ext: 'js', group: 'Bot', name: 'Persona', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );

const dSchema = require( './Platforms/Discord.js' );
//const fbSchema = require( './Platforms/Facebook.js' );
const ghSchema = require( './Platforms/GitHub.js' );
const mwSchema = require( './Platforms/MediaWiki.js' );
const txSchema = require( './Platforms/TwitterX.js' );

const botPersonaSchema = new Schema( {
  APIs: [ {
    accessToken: String,
    accessTokenSecret: String,
    bearerToken: String,
    consumerKey: String,
    consumerSecret: String,
    commonName: String,
    key: String,
    password: String,
    token: String,
    url: String,
    username: String
  } ],
  Database: {
    database: String,
    options: String,
    password: String,
    token: String,
    uri: String,
    username: String
  },
  Name: String,
  Platforms: {
    Discord: dSchema,
//    Facebook: fbSchema,
    GitHub: ghSchema,
    MediaWiki: mwSchema,
    TwitterX: txSchema
  },
  Verbosity: { default: 5, type: Number },
  Version: Number
}, { _id: false } );

module.exports = botPersonaSchema;