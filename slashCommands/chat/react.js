const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errorHandler = require( '../../functions/errorHandler.js' );

module.exports = {
  name: 'react',
  name_localizations: {
    de: 'reagieren',
    fr: 'réagir',
    fi: 'reagoi',
    pl: 'reagować',
    'sv-SE': 'reagera' },
  description: 'What reaction do you want me to use on which message?',
  options: [ {
    name: 'message-id',
    description: 'Paste message ID here:',
    required: true,
    type: 3
  }, {
    name: 'reaction',
    description: 'How do you want me to react?',
    required: true,
    type: 3
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const { botOwner, isBotMod, isBlacklisted, isGlobalWhitelisted, guildOwner, isGuildBlacklisted } = await userPerms( author, guild );
    if ( isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      return interaction.editReply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server!' : '!' ) + '  Please contact <@' + contact + '> to resolve the situation.' } );
    }
    else if ( isBotMod && isGuildBlacklisted ) { author.send( { content:
      'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '! Use `/config remove` to remove yourself from the blacklist.'
    } ); }

    const msgID = options.getString( 'message-id' );
    if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
    const theReaction = options.getString( 'reaction' );
    const strAuthorTag = author.tag;
    
    const { chanChat, chanError, doLogs, strClosing } = await logChans( guild );

    var myReaction = theReaction;
    var rxp = /<:(.*)?:([\d]*)>/;
    if ( rxp.test( myReaction ) ) { myReaction = myReaction.match( rxp )[ 2 ]; }
    else { myReaction = encodeURI( myReaction ); }
    
    channel.messages.fetch( msgID ).then( async message => {
      let { author: msgAuthor, channel: msgChan, guild: msgGuild } = message;
      await message.react( myReaction ).then( reacted => {
        if ( doLogs ) {
          chanChat.send( 'I reacted to https://discord.com/channels/' + msgGuild.id + '/' + msgChan.id + '/' + message.id + ' by <@' + msgAuthor.id + '> with ' + theReaction + ' at <@' + author.id + '>\'s request' + strClosing )
          .catch( noLogChan => { await errorHandler( noLogChan, { chanType: 'chat', command: 'react', guild: guild, type: 'logLogs' } ); } );
        }
        return interaction.editReply( { content: 'Reacted!' } );
      } ).catch( noReaction => { await errorHandler( noReaction, { channel: msgChan, command: 'react', guild: msgGuild, msgID: msgID, rawReaction: theReaction, reaction: myReaction, type: 'noReaction' } ); } );
    } ).catch( noMessage => { await errorHandler( noMessage, { command: 'react', msgID: msgID, type: 'noMsg' } ); } );
  }
};