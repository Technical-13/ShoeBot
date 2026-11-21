const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'Discord', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );
const { Snowflake } = Schema.Types;

const list = ( defaultType ) => {
  return {
    Type: snowflakeType( defaultType ),
    UserID: { platform: 'Discord', required: [ true, 'UserID is a required field.' ], type: Snowflake },
    Username: String
  };
};

const rank = () => {
  return {
    Role: [ role() ],
    Type: snowflakeType( 'User' ),
    UserID: { platform: 'Discord', required: [ true, 'UserID is a required field.' ], type: Snowflake },
    Username: String
  };
};

const role = () => {
  return {
    enum: {
      message: '{VALUE} is not a valid Role.',
      values: [ 'Contributor', 'Linguist', 'Supporter' ],
    },
    type: String,
  };
};

const snowflakeType = ( defaultType ) => {
  const dTypes = {
    enum: {
      message: '{VALUE} is not a valid Type.',
      values: [ 'Channel', 'Guild', 'Member', 'Role', 'User' ],
    },
    required: [ true, 'Type is a required field.' ],
    type: String
  };
  if ( defaultType ) { dTypes.default = defaultType; }
  return dTypes;
};

const dSchema = new Schema( {
  Blacklist: [ list() ],
  ClientID: { platform: 'Discord', required: [ true, 'ClientID is a required field.' ], type: Snowflake },
  DevGuildID: { platform: 'Discord', required: [ true, 'DevGuildID is a required field.' ], type: Snowflake },
  Logs: {
    Default: { platform: 'Discord', type: Snowflake },
    Error: { platform: 'Discord', type: Snowflake },
    JoinPart: { platform: 'Discord', type: Snowflake }
  },
  Ranks: {
    CoOwners: [ rank() ],
    Moderators: [ rank() ],
    Owner: rank(),
    VIPs: [ rank() ],
  },
  Prefix: { default: '!', type: String },
  Username: String,
  Whitelist: [ list() ]
}, { _id: false } );

module.exports = dSchema;
