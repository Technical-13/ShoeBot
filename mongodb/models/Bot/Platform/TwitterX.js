const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'TwitterX', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );
const { Snowflake } = Schema.Types;

const txSchema = new Schema( {
  UserID: { platform: "TwitterX", type: Snowflake },
  Username: String,
  Name: String,
  Description: String,
  ProfileImageUrl: String,
  Url: String,
  Location: String,
  Protected: Boolean,
  Verified: Boolean,
  VerifiedType: String,
  AccountCreatedAt: Date,
  Metrics: {
    Followers: Number,
    Following: Number,
    Tweets: Number,
    Listed: Number
  },
  Credentials: {
    AccessToken: String,
    RefreshToken: String,
    TokenSecret: String,
    ExpiresAt: Date,
    Scopes: [ String ],
    AuthenticatedAt: Date
  },
  LastSyncedAt: Date
}, { _id: false } );

module.exports = txSchema;