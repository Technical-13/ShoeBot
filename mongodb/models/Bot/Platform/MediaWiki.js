const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'MediaWiki', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );
const { Snowflake } = Schema.Types;

const mwSchema = new Schema( {
  ApiUrl: String,
  Groups: [ String ],
  Owner: {
    Groups: [ String ],
    Registration: Date,
    Snowflake: { platform: { default: "MediaWiki", type: String }, type: Snowflake },
    UserId: Number,
    Username: String
  },
  Registration: Date,
  UserId: Number,
  Username: String,
  WikiName: String
}, { _id: false } );

module.exports = mwSchema;