const modData = { ext: 'js', group: 'Bot', name: 'BotConfig', platform: 'models', type: 'mongodb' };
const { model, Schema } = require( 'mongoose' );

const botContactSchema = require( './Contact.js' );
const botPersonaSchema = require( './Persona.js' );
const dSchema = require( './Platforms/Discord.js' );
const fbSchema = require( './Platforms/Facebook.js' );
const ghSchema = require( './Platforms/GitHub.js' );
const mwSchema = require( './Platforms/MediaWiki.js' );
const txSchema = require( './Platforms/TwitterX.js' );

const botSchema = new Schema( {
  _id: { default: 'LiveBot', type: String },
  Config: {
    CachedString: { required: [ true, 'Config.CachedString is a required field.', ], type: String },
    LastModifiedAt: { required: [ true, 'Config.LastModifiedAt is a required field.', ], type: Date },
  },
  Languages: [ {
    Filename: String,
    LanguageCode: String,
    LastUpdatedOn: Date,
    LocalName: String,
    NativeName: String,
  } ],
  Name: String,
  Contacts: [ botContactSchema ],
  Personas: [ botPersonaSchema ],
  Platforms: {
    Discord: [ dSchema ],
    Facebook: [ fbSchema ],
    GitHub: [ ghSchema ],
    MediaWiki: [ mwSchema ],
    TwitterX: [ txSchema ],
  },
  WebDash: {
    Enabled: { default: false, type: Boolean },
    Endpoints: {
      Hosting: {
        Domain: String,
        Instance: String,
        Port: Number,
        Server: String,
        SubDomain: String,
      },
      Public: {
        Domain: String,
        SubDomain: String,
      },
    },
    Port: { default: 3000, type: Number },
    SessionSecret: String,
  },
  Verbosity: { default: 5, max: 5, min: 0, required: [ true, 'Verbosity (values: 0-5) is a required field.' ], type: Number, },
  Version: { required: [ true, 'Version is a required field.' ], type: Date, },
}, { timestamps: true } );

module.exports = model( 'BotConfig', botSchema );
