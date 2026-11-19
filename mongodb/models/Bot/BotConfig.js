const modData = { ext: 'js', group: 'Bot', name: 'BotConfig', platform: 'models', type: 'mongodb' };
const { model, Schema } = require( 'mongoose' );

const botPersonaSchema = require( './Persona.js' );
const dSchema = require( './Platforms/Discord.js' );
//const fbSchema = require( './Platforms/Facebook.js' );
const ghSchema = require( './Platforms/GitHub.js' );
const mwSchema = require( './Platforms/MediaWiki.js' );
const txSchema = require( './Platforms/TwitterX.js' );

const botSchema = new Schema( {
  _id: { default: "ShoeBot-Live", type: String },
  Name: String,
  Owner: String,
  Personas: [ botPersonaSchema ],
  Platforms: {
    Discord: dSchema,
//    Facebook: fbSchema,
    GitHub: ghSchema,
    MediaWiki: mwSchema,
    TwitterX: txSchema
  },
  WebDash: {
    Port: { default: 3000, type: Number },
    SessionSecret: String
  },
  Verbosity: { default: 5, type: Number },
  Version: Number
}, { timestamps: true } );

module.exports = model( 'BotConfig', botSchema );