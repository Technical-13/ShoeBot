const chalk = require( 'chalk' );
const config = require( '../config.json' );
const userConfig = require( '../models/BotUser.js' );
const verUserDB = config.verUserDB;

module.exports = async ( user ) => {
  try {
    const newBotUser = {
      _id: user.id,
      Guilds: [],
      Guildless: null,
      UserName: user.displayName,
      Score: 0,
      Version: verUserDB
    }
    return await userConfig.create( newBotUser )
    .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( `Error attempting to add ${user.displayName} (id: ${user.id}) to my user database in createNewUser.js:\n${initError}` ) ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.hex( '#FFA500' ).bold( 'createNewUser.js' ), errObject.stack ); }
};