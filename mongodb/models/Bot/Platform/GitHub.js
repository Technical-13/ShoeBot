const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'GitHub', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );

const ghSchema = new Schema( {
  Branch: String,
  IssueRepo: String,
  Username: String
}, { _id: false } );

module.exports = ghSchema;