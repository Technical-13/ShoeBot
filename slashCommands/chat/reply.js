const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errHandler = require( '../../functions/errorHandler.js' );

module.exports = {
  name: 'reply',
  name_localizations: {
    de: 'antwort',
    fr: 'répondre',
    fi: 'vastaa',
    pl: 'odpowiedź',
    'sv-SE': 'svar' },
  description: 'Make bot respond to message.',
  options: [ {
    name: 'message-id',
    description: 'Paste message ID here:',
    required: true,
    type: 3
  }, {
    name: 'response',
    description: 'What do you want me to say in response?',
    required: true,
    type: 3
  }  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const { botOwner, isBotMod, isBlacklisted, isGlobalWhitelisted, guildOwner, isGuildBlacklisted, isServerBooster, hasMentionEveryone, isWhitelisted } = await userPerms( author, guild );
    if ( isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      return interaction.editReply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server!' : '!' ) + '  Please contact <@' + contact + '> to resolve the situation.' } );
    }
    else if ( isBotMod && isGuildBlacklisted ) { author.send( { content:
      'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '! Use `/config remove` to remove yourself from the blacklist.'
    } ); }

    const canSpeak = ( isBotMod || isWhitelisted || isServerBooster ? true : false );    
    const msgID = options.getString( 'message-id' );
    if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
    const myResponse = options.getString( 'response' );
    const mentionsEveryone = /@(everyone|here)/g.test( myResponse );
    const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( myResponse ) ? 'everyone' : 'here' ) + '`' : null );
    const strAuthorTag = author.tag;
    
    const { chanChat, chanError, doLogs, strClosing } = await logChans( guild );

    if ( myResponse ) {
      if ( canSpeak && ( !mentionsEveryone || hasMentionEveryone ) ) {
        channel.messages.fetch( msgID ).then( async message => {
          let strClosing = ( logChan == guildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : ( message.attachments.size === 0 ? '----' : '⬇️⬇️⬇️ Attachment Below ⬇️⬇️⬇️' ) );            
          await message.reply( myResponse ).then( async responded => {
            interaction.editReply( { content: 'Responded!' } );
            logChan.send( {
              content: 'At <@' + author.id + '>\'s request, I replied to <@' + message.author.id + '>\'s message https://discord.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + '\n' + ( message.content ? '```\n' + message.content + '\n```' : '*`Attachment Only`*\n```\n' +  + '\n```' ) + '\nWith https://discord.com/channels/' + responded.guild.id + '/' + responded.channel.id + '/' + responded.id + ':\n```\n' + myResponse + '\n```\n' + strClosing,
              files: ( message.attachments.size === 0 ? null : [ message.attachments.first().attachment ] )
            } ).catch( noLogChan => { console.error( 'logChan.send error in reply.js:\n%o', noLogChan ) } );
          } ).catch( async muted => {
            switch ( muted.code ) {
              case 50001 :
                const noChan = '<#' + message.channel + '>';
                await logErrorChan.send( 'Please give me permission to send to ' + noChan + '.\n' + strClosing );
                await interaction.editReply( { content: 'I do not have permission to send messages in ' + noChan + '.' } );
                break;
              default:
                botOwner.send( 'Error attempting to speak as requested by: <@' + author.id + '>' +
                        ' from <#' + channel.id + '>:\n```\n' + muted + '\n```')
                  .then( notified => {
                  interaction.editReply( { content: 'Unknown error speaking. My owner, <@' + botOwner.id + '>, has been notified.' } );
                } ).catch( notNotified => {
                  interaction.editReply( { content: 'Unknown error speaking. Unable to notify my owner, <@' + botOwner.id + '>.' } );
                } );
                console.error( 'Unable to speak:\n\tCode: %o\n\tMsg: %o\n\tErr: %o', muted.code, muted.message, muted );
            }
          } );//*/
        } ).catch( noMessage => {
          switch( noMessage.code ) {
            case 10008://Unknown Message
              interaction.editReply( { content: 'Unable to find message to reply to.' } ); break;
            case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
              interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); break;
            default:
              botOwner.send( 'Error attempting to reply with ' + myResponse + ' to message :ID:`' + msgID +
                      '` as requested by: <@' + author.id + '>' + ' from `' + guild.name +
                      '`<#' + channel.id + '>:\n```\n' + noMessage + '\n```')
                .then( notified => { interaction.editReply( { content: 'Unknown Error replying to message. My owner, <@' + botOwner.id + '>, has been notified.' } ); } )
                .catch( notNotified => { interaction.editReply( { content: 'Unknown Error replying to message. Unable to notify owner, <@' + botOwner.id + '>.' } ); } );
              console.error( '%o requested me to reply with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
                      strAuthorTag, myResponse, msgID, noMessage.code, noMessage.message, noMessage
                     );
          }
        } );
      } else if ( mentionsEveryone && !hasMentionEveryone ) {
        logChan.send( '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to say:\n```\n' + myResponse + '\n```' + strClosing )
          .catch( noLogChan => { console.error( 'mentionsEveryone logChan.send error in reply.js:\n%o', noLogChan ) } );
        interaction.editReply( {
          content: 'You don\'t have permission to get me to ' + strEveryoneHere + ' in `' +
          guild.name + '`<#' + channel.id + '>.' } );
      } else {
        logChan.send( '<@' + author.id + '> has no permission to use my `/reply` command from <#' + channel.id + '>. They tried to get me to say:\n```\n' + myResponse + '\n```\n' + strClosing )
          .catch( noLogChan => { console.error( 'no permission logChan.send error in reply.js:\n%o', noLogChan ) } );
        interaction.editReply( { content: 'You don\'t have permission to get me to reply in `' +
                    guild.name + '`<#' + channel.id + '>.' } );
      }
    } else { interaction.editReply( { content: 'I don\'t know what to respond.' } ); }
  }
};
