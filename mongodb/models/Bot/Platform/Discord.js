const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'Discord', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );
const { Snowflake } = Schema.Types;

const dSchema = new Schema( {
  Blacklist: [ { platform: "Discord", type: Snowflake } ],
  ClientId: { platform: "Discord", type: Snowflake },
  DevGuild: { platform: "Discord", type: Snowflake },
  Logs: {
    Default: { platform: "Discord", type: Snowflake },
    Error: { platform: "Discord", type: Snowflake },
    JoinPart: { platform: "Discord", type: Snowflake }
  },
  Mods: [ { platform: "Discord", type: Snowflake } ],
  Prefix: { default: "!", type: String },
  Username: String,
  Whitelist: [ { platform: "Discord", type: Snowflake } ]
}, { _id: false } );

module.exports = dSchema;