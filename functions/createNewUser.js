const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const userConfig = require( '../models/BotUser.js' );
const addUserGuild = require( '../functions/addUserGuild.js' );
const verUserDB = config.verUserDB;

module.exports = async ( user ) => {
  try {
    if ( !user ) { throw new Error( chalk.bold.red( `No user: ${user}` ) ); }
    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) {
      const newBotUser = {
        _id: user.id,
        Guilds: [],
        Guildless: null,
        UserName: user.displayName,
        Score: 0,
        Version: verUserDB
      }
      return await userConfig.create( newBotUser )
      .then( updatedUser => {
        const botGuilds = client.guilds.cache;
        let newUserGuilds = ( Array.from( botGuilds.filter( g => g.members.cache.has( user.id ) ).keys() ).toSorted() || [] );
        for ( let guildId of newUserGuilds ) {// addUserGuild
          let guild = await botGuilds.get( guildId );
          if ( botVerbosity >= 1 ) { console.log( '\t\tAdding G:%s to U:%s.', chalk.bold.green( guild.name ), chalk.bold.green( addUser.displayName ) ); }
          newUser = await addUserGuild( user.id, guild );
        }
        return newBotUser;
      } )
      .catch( initError => { throw new Error( chalk.bold.black.bgCyan( `Error attempting to add ${user.displayName} (id: ${user.id}) to my user database in createNewUser.js:\n` ) + initError ); } );
    }
    else { console.error( 'User %s (%s) already exists in my database.', user.id, user.displayName ); }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( 'createNewUser.js' ), errObject.stack ); }
};