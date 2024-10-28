const client = require( '..' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../models/GuildConfig.js' );
const errHandler = require( '../functions/errorHandler.js' );
const parse = require( '../functions/parser.js' );

client.on( 'guildMemberAdd', async ( member ) => {
  const botOwner = client.users.cache.get( client.ownerId );
  const { guild } = member;

  const guildConfig = await guildConfigDB.findOne( { Guild: guild.id } )
  .catch( async errFind => {
    console.error( 'Error attempting to find %s (ID:%s) in my database in config.js:\n%s', guild.name, guild.id, errFind.stack );
  } );
  const doLog = ( !guildConfig ? false : ( !guildConfig.Logs ? false : ( guildConfig.Logs.Active || false ) ) );
  const chanDefaultLog = ( !doLog ? null : member.guild.channels.cache.get( guildConfig.Logs.Default ) );
  const chanErrorLog = ( !doLog ? null : member.guild.channels.cache.get( guildConfig.Logs.Error ) );
  const doWelcome = ( !guildConfig ? false : ( !guildConfig.Welcome ? false : ( guildConfig.Welcome.Active || false ) ) );
  if ( doWelcome ) {
    const welcomeChan = ( !guildConfig.Welcome.Channel ? member : member.guild.channels.cache.get( guildConfig.Welcome.Channel ) );
    const welcomeMsg = parse( guildConfig.Welcome.Msg || 'Welcome {{member.ping}}!\n**{{server.name}}** now has {{server.members}} members!\nPlease reach out to the server owner, {{server.owner.ping}} if you need any help!', { member: member } );
    const welcomeRole = ( !guildConfig.Welcome.Role ? null : member.guild.roles.cache.get( guildConfig.Welcome.Role ) );
    welcomeChan.send( { content: welcomeMsg } )
    .then( welcomeSent => {
      if ( welcomeRole ) {
        member.addRole( welcomeRole )
        .then( roleAdded => {
          if ( doLog && chanDefaultLog ) {
            chanDefaultLog.send( { content: 'Successfully welcomed <@' + member.id + '> to the server and gave them the <@&' + welcomeRole + '> role.' } );
          }
        } )
        .catch( async errRole => {
          if ( doLog && chanErrorLog ) {
            chanErrorLog.send( { content: await errHandler( errRole, { command: 'guildMemberAdd', type: 'errRole' } ) } );
          }
        } );
      }
      if ( !welcomeRole && doLog && chanDefaultLog ) {
        chanDefaultLog.send( { content: 'Successfully welcomed <@' + member.id + '> to the server.' } );
      }
    } )
    .catch( async errSend => {
      if ( doLog && chanErrorLog ) {
        chanErrorLog.send( { content: await errHandler( errSend, { command: 'guildMemberAdd', type: 'errSend' } ) } );
      }
    } );
  }
} );