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
/* TRON */console.log( 'guildConfig: %o', guildConfig ):/* TROFF */
  const doLog = ( !guildConfig ? false : ( !guildConfig.Logs ? false : ( guildConfig.Logs.Active || false ) ) );
/* TRON */console.log( 'doLog: %o', doLog ):/* TROFF */
  const chanDefaultLog = ( !doLog ? null : member.guild.channels.cache.get( guildConfig.Logs.Default ) );
/* TRON */console.log( 'chanDefaultLog: %o', chanDefaultLog ):/* TROFF */
  const chanErrorLog = ( !doLog ? null : member.guild.channels.cache.get( guildConfig.Logs.Error ) );
/* TRON */console.log( 'chanErrorLog: %o', chanErrorLog ):/* TROFF */
  const doWelcome = ( !guildConfig ? false : ( !guildConfig.Welcome ? false : ( guildConfig.Welcome.Active || false ) ) );
/* TRON */console.log( 'doWelcome: %o', doWelcome ):/* TROFF */
  if ( doWelcome ) {
    const welcomeChan = ( !guildConfig.Welcome.Channel ? member : member.guild.channels.cache.get( guildConfig.Welcome.Channel ) );
/* TRON */console.log( 'welcomeChan: %o', welcomeChan.name ):/* TROFF */
    const welcomeMsg = parse( guildConfig.Welcome.Msg || 'Welcome {{member.ping}}!\n**{{server.name}}** now has {{server.members}} members!\nPlease reach out to the server owner, {{server.owner.ping}} if you need any help!', { member: member } );
/* TRON */console.log( 'welcomeMsg: %o', welcomeMsg ):/* TROFF */
    const welcomeRole = ( !guildConfig.Welcome.Role ? null : member.guild.roles.cache.get( guildConfig.Welcome.Role ) );
/* TRON */console.log( 'welcomeRole: %o', welcomeRole.name ):/* TROFF */
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
} );