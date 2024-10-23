const { model, Schema } = require( 'mongoose' );

let botSchema = new Schema( {
  BotName: String,
  Blacklist: [ String ],
  ClientID: String,
  DevGuild: String,
  Mods: [ String ],
  Owner: String,
  Prefix: String,
  StaticCmds: [ String ],
  Whitelist: [ String ]
} );

module.exports = model( 'BotConfig', botSchema );