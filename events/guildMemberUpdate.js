const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const userPerms = require( '../functions/getPerms.js' );
const userConfig = require( '../models/BotUser.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const verUserDB = config.verUserDB;

client.on( 'guildMemberUpdate', async ( oldMember, newMember ) => {
  try {
    const { guild, user } = newMember;
    const { isGuildOwner } = await userPerms( user, guild );

    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) {// Create new user in DB if not there.
      const newUser = {
        _id: user.id,
        Bot: ( user.bot ? true : false ),
        Guilds: [ {
          _id: guild.id,
          Bans: [],
          Expires: null,
          GuildName: guild.name,
          MemberName: newMember.displayName,
          Roles: Array.from( newMember.roles.cache.keys() ),
          Score: 0
        } ],
        Guildless: null,
        UserName: user.displayName,
        Score: 0,
        Version: verUserDB
      }
      await userConfig.create( newUser )
      .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add %s (id: %s) to my user database in guildCreate.js:\n%o' ), user.displayName, user.id, initError ); } );
    }
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
      currUserGuild.Roles = Array.from( newMember.roles.cache.keys() );
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
        .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) in my database:\n%o' ), guild.name, guild.id, updateError ); } );
      }
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildMemberUpdate.js' ), errObject.stack ); }
} );