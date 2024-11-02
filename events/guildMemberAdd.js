const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const userConfig = require( '../models/BotUser.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const errHandler = require( '../functions/errorHandler.js' );
const parse = require( '../functions/parser.js' );
const verUserDB = config.verUserDB;

client.on( 'guildMemberAdd', async ( member ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const { guild, user } = member;

    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) {// Create new user in DB if not there.
      const newUser = {
        _id: user.id,
        Bot: ( user.bot ? true : false ),
        Guilds: [],
        Guildless: null,
        UserName: user.displayName,
        Score: 0,
        Version: verUserDB
      }
      await userConfig.create( newUser )
      .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add %s (id: %s) to my user database in guildMemberAdd.js:\n%o' ), user.displayName, user.id, initError ); } );
    }
    const currUser = await userConfig.findOne( { _id: user.id } );
    const userGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { userGuilds.push( entry._id ); } );
    if ( userGuilds.indexOf( guild.id ) === -1 ) {
      const addGuild = {
        _id: guild.id,
        Bans: [],
        Expires: null,
        GuildName: guild.name,
        MemberName: member.displayName,
        Roles: Array.from( member.roles.cache.keys() ),
        Score: 0
      };
      currUser.Guilds.push( addGuild );
      currUser.Guildless = null;
      userConfig.updateOne( { _id: user.id }, currUser, { upsert: true } )
      .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add guild %s (id: %s) to user %s (id: %s) in my database in guildMemberAdd.js:\n%o' ), guild.name, guild.id, user.displayName, user.id, updateError ); } );
    }

    const currGuildConfig = await getGuildConfig( guild );
    currGuildConfig.Guild.Members = guild.members.cache.size;
    await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
    .then( updateSuccess => { console.log( 'Succesfully updated %s (id: %s) in my database.', chalk.bold.yellow( guild.name ), guild.id ); } )
    .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) to my database:\n%o' ), guild.name, guild.id, updateError ); } );

    const doLog = ( !currGuildConfig ? false : ( !currGuildConfig.Logs ? false : ( currGuildConfig.Logs.Active || false ) ) );
    const chanDefaultLog = ( !doLog ? null : member.guild.channels.cache.get( currGuildConfig.Logs.Default ) );
    const chanErrorLog = ( !doLog ? null : member.guild.channels.cache.get( currGuildConfig.Logs.Error ) );
    const doWelcome = ( !currGuildConfig ? false : ( !currGuildConfig.Welcome ? false : ( currGuildConfig.Welcome.Active || false ) ) );
    if ( doWelcome ) {
      const welcomeChan = ( !currGuildConfig.Welcome.Channel ? member : member.guild.channels.cache.get( currGuildConfig.Welcome.Channel ) );
      const welcomeMsg = await parse( currGuildConfig.Welcome.Msg || 'Welcome {{member.ping}}!\n**{{server.name}}** now has {{server.members}} members!\nPlease reach out to the server owner, {{server.owner.ping}} if you need any help!', { member: member } );
      const welcomeRole = ( !currGuildConfig.Welcome.Role ? null : member.guild.roles.cache.get( currGuildConfig.Welcome.Role ) );
      welcomeChan.send( { content: welcomeMsg } )
      .then( welcomeSent => {
        if ( welcomeRole ) {
          member.roles.add( welcomeRole, 'New member! - use `/config welcome` to change.' )
          .then( roleAdded => {
            if ( doLog && chanDefaultLog ) {
              chanDefaultLog.send( { content: 'Successfully welcomed <@' + member.id + '> to the server and gave them the <@&' + welcomeRole + '> role.' } );
            }
          } )
          .catch( async errRole => {
            if ( doLog && chanErrorLog ) {
              chanErrorLog.send( await errHandler( errRole, { command: 'guildMemberAdd', type: 'errRole' } ) );
            }
          } );
        }
        if ( !welcomeRole && doLog && chanDefaultLog ) {
          chanDefaultLog.send( { content: 'Successfully welcomed <@' + member.id + '> to the server.' } );
        }
      } )
      .catch( async errSend => {
        if ( doLog && chanErrorLog ) {
          chanErrorLog.send( await errHandler( errSend, { command: 'guildMemberAdd', type: 'errSend' } ) );
        }
      } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildMemberAdd.js' ), errObject.stack ); }
} );