const client = require( '..' );
const logChans = require( '../getLogChans.js' );

module.exports = async ( objError, options = { command: 'undefined', type: 'undefined' } ) => {
  const { command, type } = options;
  if ( typeof command !== 'String' ) { command = 'undefined'; }
  if ( typeof type !== 'String' ) { type = 'undefined'; }
  const author = ( options.author ? options.author : null );
  const channel = ( options.channel ? options.channel : null );
  const chanType = ( options.chanType ? options.chanType : null );
  const doLog = ( options.doLog ? options.doLog : null );
  const guild = ( options.guild ? options.guild : null );
  const msgID = ( options.msgID ? options.msgID : null );
  const rawReaction = ( options.rawReaction ? options.rawReaction : null );
  const reaction = ( options.reaction ? options.reaction : null );

  if ( guild ? ( typeof doLog != 'boolean' ? true : options.doLog ) : false ) {
    const { chanChat, chanDefault, chanError, doLogs, strClosing } = ( doLog ? await logChans( guild ) : { chanChat: null, chanDefault: null, chanError: null, doLogs: doLog, strClosing: null } );
  }

  const botOwner = client.users.cache.get( client.ownerId );
  const strConsole = '  Please check the console for details.';
  const strNotified = '  Error has been logged and my owner, <@' + botOwner.id + '>, has been notified.';
  const strLogged = '  Error has been logged and my owner, <@' + botOwner.id + '>, couldn\'t be notified.';

  try {
    switch ( type ) {
      case 'getBotDB':
        console.error( 'Unable to find botConfig:\n%o', objError );
        break;
      case 'getGuildDB':
        console.error( 'Encountered an error attempting to find %s(ID:%s) in my database in preforming %s for %s in config.js:\n%s', guild.name, guild.id, command, author.tag, objError.stack );
        botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database in preforming ' + command + ' for <@' + author.id + '>.' + strConsole );
        break;
      case 'logLogs':
        let logChan = ( chanType === 'chat' ? chanChat : ( chanType === 'error' ? chanError : chanDefault ) );
        console.error( 'Unable to log to %s channel: %s#%s\n%o', chanType, guild.name, logChan.name, errLog );
        botOwner.send( { content: 'Unable to log to ' + chanType + ' channel <#' + logChan.id + '>.' + strConsole } )
        .then( errSent => { return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strNotified } )
        .catch( errNotSent => {
          console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
          if ( doLogs && chanType != 'error' ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strLogged + strClosing ); }
          return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strLogged } );
        } );
        break;
      case 'modifyDB':
        break;
      case 'msgSend':
        switch ( objError.code ) {
          case 50001 :
            if ( doLogs ) { chanError.send( 'Please give me permission to send to <#' + channel.id + '>.' + strClosing ); }
            return interaction.editReply( { content: 'I do not have permission to send messages in <#' + channel.id + '>.' } );
            break;
          default:
            console.error( 'Unable to send message for /' + command + ' request: %o', objError );
            botOwner.send( { content: 'Unable to send message for `/' + command + '` request.' + strConsole } )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strNotified + strClosing ); }
              return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strNotified } );
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strLogged + strClosing ); }
              return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strLogged } );
            } );
        }
        break;
      case 'noMsg':
        switch( objError.code ) {
          case 10008://Unknown Message
            return interaction.editReply( { content: 'Unable to find message to react to.' } );
            break;
          case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
            return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } );
            break;
          default:
            console.error( 'Unable to find message 🆔`' + msgID + '` for /' + command + ' request: %o', objError );
            botOwner.send( { content: 'Unable to find message 🆔`' + msgID + '` for `/' + command + '` request.' + strConsole } )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strNotified + strClosing ); }
              return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strNotified } );
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strLogged + strClosing ); }
              return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strLogged } );
            } );
        }
        break;
      case 'noReaction':
        switch ( objError.code ) {
          case 10014://Reaction invalid
            if ( doLogs ) { chanError.send( 'Failed to react to message https://discord.com/channels/' + guild.id + '/' + channel.id + '/' + msgID + ' with `' + rawReaction + '`.' + strClosing ); }
            console.error( '%s: %o', objError.code, objError.message );
            return interaction.editReply( { content: '`' + rawReaction + '` is not a valid `reaction` to react with. Please try again; the emoji picker is helpful in getting valid reactions.' } );
          default:
            console.error( '%s: Reaction to #%o with %o (%s) failed:\n\tMsg: %s\n\tErr: %o', objError.code, msgID, reaction, rawReaction, objError.message, objError );
            botOwner.send( 'Reaction to https://discord.com/channels/' + guild.id + '/' + channel.id + '/' + msgID + ' with `' + rawReaction + '` failed.' + strConsole )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strNotified + strClosing ); }
              return interaction.editReply( { content: 'Unknown Error reacting to message.' + strNotified } );
            } ).catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strLogged + strClosing ); }
              return interaction.editReply( { content: 'Unknown Error reacting to message.' + strLogged } );
            } );
        }
        break;
      case 'tryFunction':
        console.error( 'Error in %s.js: %s', command, objError.stack );
        break;
      default:
        console.error( 'Unknown type (%s) to resolve error for: %o', type, objError );
        botOwner.send( { content: 'Unknown type (' + type + ') to resolve error for.' + strConsole } )
        .then( errSent => {
          if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strNotified + strClosing ); }
          return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strNotified } );
        } )
        .catch( errNotSent => {
          console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
          if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + command + '` request.' + strLogged + strClosing ); }
          return interaction.editReply( { content: 'Encounted an error with your `/' + command + '` request.' + strLogged } );
        } );
    }
  } catch ( errHandleErrors ) { console.error( 'Error in errorHandler.js: %s', errHandleErrors.stack ); }
};