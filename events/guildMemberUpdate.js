const client = require( '..' );
const config = require( '../config.json' );
const userPerms = require( '../functions/getPerms.js' );
const userConfig = require( '../models/BotUser.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const verUserDB = config.verUserDB;

client.on( 'guildMemberUpdate', async ( oldMember, newMember ) => {
  try {
    const { guild, user } = newMember;
    const { isGuildOwner } = await userPerms( guild, user );

    const currUser = await userConfig.findOne( { _id: user.id } );
    const userGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { userGuilds.push( entry._id ); } );
    const ndxUserGuild = userGuilds.indexOf( guild.id );
    const currUserGuild = currUser.Guilds[ ndxUserGuild ];
    const newName = ( oldMember.displayName != newMember.displayName ? true : false );
    const newRoles = ( oldMember.roles != newMember.roles ? true : false );
    var doUserUpdate = false;
    if ( newName ) {// Changed nickname
      currUser.UserName = newUser.displayName;
      doUserUpdate = true;
    }
    if ( newRoles ) {// Added or Removed roles
      currUserGuild.Roles = Array.from( member.roles.cache.keys() );
      doUserUpdate = true;
    }
    if ( doUserUpdate ) {
      userConfig.updateOne( { _id: user.id }, currUser, { upsert: true } )
      .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update guild %s (id: %s) for user %s (id: %s) in my database in getPerms.js:\n%o' ), guild.name, guild.id, user.displayName, user.id, updateError ); } );
    }

    if ( isGuildOwner ) {
      const currGuildConfig = await getGuildConfig( guild );
      const newOwnerName = ( newMember.displayName !== currGuildConfig.Guild.OwnerName ? true : false );
      var doGuildUpdate = false;
      if ( newOwnerName ) {
        currGuildConfig.Guild.OwnerName = newMember.displayName;
        doGuildUpdate = true;
      }
      if ( doGuildUpdate ) {
        currGuildConfig.Guild.Members = guild.members.cache.size;
        await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
        .then( updateSuccess => { console.log( 'Succesfully updated %s (id: %s) in my database.', chalk.bold.yellow( guild.name ), guild.id ); } )
        .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) in my database:\n%o' ), guild.name, guild.id, updateError ); } );
      }
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildMemberUpdate.js' ), errObject.stack ); }
} );