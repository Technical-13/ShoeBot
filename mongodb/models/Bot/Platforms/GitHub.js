const modData = { ext: 'js', group: [ 'Bot', 'Platform' ], name: 'GitHub', platform: 'models', type: 'mongodb' };
const { Schema } = require( 'mongoose' );

const ghSchema = new Schema( {
  Branches: [ {
    Default: Boolean,
    LastCommit: String,
    Name: String,
    Protected: Boolean,
    URL: String,
  } ],
  Credentials: {
    AccessToken: String,
    AuthenticatedAt: Date,
    ExpiresAt: Date,
    RefreshToken: String,
    Scopes: [ String ],
    Type: { enum: { message: '{VALUE} is an invalid credential Type.', values: [ 'GitHubApp', 'OAuth', 'PAT', 'SSH' ] }, type: String },
  },
  Issues: [ {
    Assignee: String,
    Author: String,
    BlockedBy: [ String ],
    Blocking: [ String ],
    ClosedAt: Date,
    ClosedReason: String,
    CreatedAt: Date,
    IssueID: Number,
    Labels: [ String ],
    Number: Number,
    MergedOn: Date,
    Milestone: String,
    PullRequest: Boolean,
    State: String,
    Status: String,
    Title: String,
    Type: String,
    UpdatedOn: Date,
    URL: String,
  } ],
UserID: { required: [ true, 'UserID is a required field.' ], type: Number },
  Username: String,
  Workflows: [ {
    LastRunAt: Date,
    LastRunStatus: String,
    Name: String,
    Path: String,
    State: String,
    URL: String,
    WorkflowID: Number,
  } ],
}, { _id: false } );

module.exports = ghSchema;
