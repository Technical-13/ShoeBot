const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'Facebook', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );

const fbSchema = new Schema( {
  AccountCreatedAt: Date,
  Credentials: {
    AccessToken: String,
    AuthenticatedAt: Date,
    ExpiresAt: Date,
    RefreshToken: String,
    Scopes: [ String ],
    Type: {
      enum: { message: '{VALUE} is an invalid credential Type.', values: [ 'FacebookApp', 'OAuth' ] },
      type: String
    },
  },
  Description: String,
  LastSyncedAt: Date,
  Metrics: {
    Followers: Number,
    Likes: Number,
    Posts: Number,
  },
  Name: String,
  ProfileImageURL: String,
  ProfileURL: String,
  Type: {
    enum: { message: '{VALUE} is an invalid Type of Facebook account.', values: [ 'Account', 'Group', 'Page' ] },
    required: [ true, 'Type is a required field.' ],
    type: String
  },
  UserID: { required: [ true, 'UserID is a required field.' ], type: String },
  Username: String,
  Verified: Boolean,
  VerifiedType: String,
}, { _id: false } );

module.exports = fbSchema;
