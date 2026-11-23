const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'TwitterX', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );
const { Snowflake } = Schema.Types;

const txSchema = new Schema( {
  AccountCreatedAt: Date,
  Credentials: {
    AccessToken: String,
    AuthenticatedAt: Date,
    ExpiresAt: Date,
    RefreshToken: String,
    Scopes: [ String ],
    TokenSecret: String,
  },
  Description: String,
  LastSyncedAt: Date,
  Location: String,
  Metrics: {
    Followers: Number,
    Following: Number,
    Listed: Number,
    Tweets: Number,
  },
  Name: String,
  ProfileImageURL: String,
  ProfileURL: String,
  Protected: Boolean,
  UserID: { platform: "TwitterX", required: [ true, 'UserID is a required field.' ], type: Snowflake },
  Username: String,
  Verified: Boolean,
  VerifiedType: String,
}, { _id: false } );

module.exports = txSchema;
