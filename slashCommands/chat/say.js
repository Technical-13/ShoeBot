const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errorHandler = require( '../../functions/errorHandler.js' );

module.exports = {
  name: 'say',
  name_localizations: {
    de: 'sagen',
    fr: 'dire',
    fi: 'sano',
    pl: 'mowić',
    'sv-SE': 'säga' },
  description: 'Make bot speak.',
  options: [ {
    name: 'saying',
    description: 'What do you want me to say?',
    required: true,
    type: 3
  }, {
    name: 'channel',
    description: 'Where do you want me to say it? (default: current channel)',
    type: 7
  } ],
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
    const speakChannel = options.getChannel( 'channel' ) || channel;
    const mySaying = options.getString( 'saying' );
    const mentionsEveryone = /@(everyone|here)/g.test( mySaying );
    const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );
    
    const { chanChat, chanError, doLogs, strClosing } = await logChans( guild );

    if ( mySaying ) {
      if ( canSpeak && ( !mentionsEveryone || hasMentionEveryone ) ) {
        speakChannel.send( mySaying ).then( async spoke => {
          interaction.editReply( { content: 'I said the thing!' } );

          logChan.send( 'I spoke in https://discord.com/channels/' + spoke.guild.id + '/' + spoke.channel.id + '/' + spoke.id + ' at <@' + author.id + '>\'s request:\n```\n' + mySaying + '\n```\n' + strClosing )
            .catch( noLogChan => { console.error( 'logChan.send error in say.js:\n%o', noLogChan ) } );
        } ).catch( async muted => {
          switch ( muted.code ) {
            case 50001 :
              const noChan = '<#' + speakChannel + '>';
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
              console.error( 'Unable to speak in say.js:\n\tCode: %o\n\tMsg: %o\n\tErr: %o', muted.code, muted.message, muted );
          }
        } );
      }
      else if ( mentionsEveryone && !hasMentionEveryone ) {
        logChan.send( '<@' + interaction.user.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```' + strClosing )
          .catch( noLogChan => { console.error( 'mentionsEveryone logChan.send error in say.js:\n%o', noLogChan ) } );
        interaction.editReply( {
          content: 'You don\'t have permission to get me to ' + strEveryoneHere + ' in `' +
          guild.name + '`<#' + channel.id + '>.' } );
      }
      else {
        logChan.send( '<@' + author.id + '> has no permission to use my `/say` command from <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```\n' + strClosing )
          .catch( noLogChan => { console.error( 'no permission logChan.send error in say.js:\n%o', noLogChan ) } );
        interaction.editReply( { content: 'You don\'t have permission to get me to speak in `' +
                    guild.name + '`<#' + channel.id + '>.' } );
      }
    }
    else { interaction.editReply( { content: 'I don\'t know what to say.' } ); }
  }
};