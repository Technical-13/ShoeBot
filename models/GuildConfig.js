const { model, Schema } = require( 'mongoose' );

let guildSchema = new Schema( {
  Blacklist: { Members: [ String ], Roles: [ String ] },
  Commands: [ String ],
  Guild: { ID: String, Name: String, Members: Number },
  Invite: String,
  Logs: {
    Active: Boolean,
    Chat: String,
    Default: String,
    Error: String
  },
  Prefix: String,
  Premium: Boolean,
  Welcome: {
    Active: Boolean,
    Channel: String,
    Msg: String,
    Role: String
  },
  Whitelist: { Members: [ String ], Roles: [ String ] }
} );

module.exports = model( 'GuildConfig', guildSchema );