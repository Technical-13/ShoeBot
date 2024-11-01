const { model, Schema } = require( 'mongoose' );

let userSchema = new Schema( {
  _id: String,
  Guilds: [ {
    _id: String,
    Bans: [ String ],
    Expires: Date,
    GuildName: String,
    MemberName: String,
    Roles: [ String ],
    Score: Number
  } ],
  UserName: String,
  Score: Number,
  Version: Number
} );

module.exports = model( 'BotUser', userSchema );