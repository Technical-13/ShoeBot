const modData = { ext: 'js', name: 'initialize', type: 'mongodb' };
const mongoose = require( 'mongoose' );
mongoose.set( 'strictQuery', false );
const mongo = { mongoose: mongoose };
mongo.isDoc = value => value instanceof mongoose.Document;
mongo.isSubDoc = value => value instanceof mongoose.Types.Subdocument;
const bot = require( process.cwd() );
const { buildPath, chalk, env, Err } = bot;
const z = {
  models: {
    BotConfig: buildPath( { ...modData, name: 'BotConfig', platform: 'models' } )
  },
  types: {
    Snowflake: buildPath( { ...modData, name: 'Snowflake', platform: 'types' } )
  }
};
require( z.types.Snowflake );
mongo.types; mongoose.Types;
require( z.models.BotConfig );

module.exports = async () => {
  try {
    if ( !env.mongodb ) {
      console.error( chalk.bold.redBright( 'mongodb authentication credential string missing from .env file.  Please add it and try again.' ) );
      throw new Err( 'MongoDB authentication credentials missing.', { wasCaught: true } );
    }
  }
  catch ( errObject ) {
    if ( !errObject.wasCaught ) {
      console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( buildPath( modData ).path ), errObject.stack );
    }
    throw errObject;
  }
}