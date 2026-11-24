const modData = { ext: 'js', group: 'Bot', name: 'Contact', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );

const botContactSchema = new Schema( {
  ID: Number,
  Languages: [ String ],
  Name: String,
  Platforms: [ {
    DisplayName: String,
    Platform: String,
    ProfileURL: String,
    Provider: String,
    UserID: String,
    UserName: String,
  } ],
  Pronouns: String,
  Timezone: String,
  Title: String,
}, { _id: false } );

module.exports = botContactSchema;
