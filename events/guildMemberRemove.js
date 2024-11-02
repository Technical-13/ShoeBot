const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const userConfig = require( '../models/BotUser.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const errHandler = require( '../functions/errorHandler.js' );
const parse = require( '../functions/parser.js' );
const verUserDB = config.verUserDB;

client.on( 'guildMemberRemove', async ( member ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const { guild, user } = member;

    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) {
      const newUser = {
        _id: user.id,
        Bot: ( user.bot ? true : false ),
        Guilds: [ {
          _id: guild.id,
          Bans: [],
          Expires: null,
          GuildName: guild.name,
          MemberName: member.displayName,
          Roles: Array.from( member.roles.cache.keys() ),
          Score: 0
        } ],
        Guildless: null,
        UserName: user.displayName,
        Score: 0,
        Version: verUserDB
      }
      await userConfig.create( newUser )
      .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add %s (id: %s) to my user database in guildMemberRemove.js:\n%o' ), user.displayName, user.id, initError ); } );
    }
    const currUser = await userConfig.findOne( { _id: user.id } );
    const userGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { userGuilds.push( entry._id ); } );
    const ndxUserGuild = userGuilds.indexOf( guild.id );
    if ( ndxUserGuild != -1 ) {
      let currUserGuild = currUser.Guilds[ ndxUserGuild ];
      const dbExpires = new Date( ( new Date() ).setMonth( ( new Date() ).getMonth() + 1 ) );
      currUserGuild.Expires = dbExpires;
      userConfig.updateOne( { _id: user.id }, currUser, { upsert: true } )
      .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update guild %s (id: %s) for user %s (id: %s) to expire %o in my database in guildMemberRemove.js:\n%o' ), guild.name, guild.id, user.displayName, user.id, dbExpires, updateError ); } );
    }

    const currGuildConfig = await getGuildConfig( guild );
    currGuildConfig.Guild.Members = guild.members.cache.size;
    await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
    .then( updateSuccess => { console.log( 'Succesfully updated %s (id: %s) in my database.', chalk.bold.yellow( guild.name ), guild.id ); } )
    .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) in my database:\n%o' ), guild.name, guild.id, updateError ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildMemberRemove.js' ), errObject.stack ); }
} );