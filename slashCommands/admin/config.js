const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'config',
  description: 'Configure bot for this server.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  options: [/* add, clear, remove, get, reset, set //*/
    { type: 1, name: 'add', description: 'Add a user to the guild blacklist or whitelist.', options: [
      { type: 6, name: 'blacklist', description: 'User to block from using all commands.' },
      { type: 6, name: 'whitelist', description: 'User to permit to use all commands.' }
    ] }/* add //*/,
    { type: 1, name: 'clear', description: 'Clear guild\'s blacklist and/or whitelist.', options: [
      { type: 5, name: 'blacklist', description: 'Clear guild\'s blacklist.' },
      { type: 5, name: 'whitelist', description: 'Clear guild\'s whitelist.' }
    ] }/* clear //*/,
    { type: 1, name: 'remove', description: 'Remove a user from the guild blacklist or whitelist.', options: [
      { type: 6, name: 'blacklist', description: 'User to remove from blacklist.' },
      { type: 6, name: 'whitelist', description: 'User to remove from whitelist.' }
    ] }/* remove //*/,
    { type: 1, name: 'get', description: 'Get all settings for the server.', options: [
      { type: 5, name: 'share', description: 'Share result to current channel instead of making it ephemeral.' }
    ] },
    { type: 1, name: 'reset', description: 'Reset all settings for the server to default.' },
    { type: 1, name: 'set', description: 'Set settings for the server.',/*Set options//*/
      options: [/* invite, logs, log-chat, log-default, log-error, welcome, welcome-message, welcome-dm, welcome-channel, welcome-role-give, welcome-role //*/
        { type: 7, name: 'invite', description: 'Channel to make invites to. Will try to guess if not set.' }/*invite channel//*/,
        { type: 5, name: 'logs', description: 'Send logs for uses of commands that may be devious in nature' }/*disable all logs//*/,
        { type: 7, name: 'log-chat', description: 'Channel to log chat command (`/edit`, `/react`, `/reply`, and `/say`) requests.' }/*chat channel//*/,
        { type: 7, name: 'log-default', description: 'Channel to log all requests not otherwise specified.' }/*default channel//*/,
        { type: 7, name: 'log-error', description: 'Channel to log errors.' }/*error channel//*/,
        { type: 3, name: 'prefix', description: 'Guild specific prefix for bot commands' }/*guild prefix//*/,
        { type: 5, name: 'welcome', description: 'Send a message to welcome new members to the server?' }/*welcomer on/off//*/,
        { type: 3, name: 'welcome-message', description: 'Message to send new members to the server?' }/*welcome message//*/,
        { type: 5, name: 'welcome-dm', description: 'Send the welcome message to DM?  (default: TRUE)' }/*welcome dm//*/,
        { type: 7, name: 'welcome-channel', description: 'Which channel would you like to send the message?' }/*welcome channel//*/,
        { type: 5, name: 'welcome-role-give', description: 'Give new members a role on join?' }/*give welcome role//*/,
        { type: 8, name: 'welcome-role', description: 'Which role, if any, would you like to give new members on join?' }/*welcome role//*/
      ]
    }/*Set options//*/ ],
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const { botOwner, globalPrefix, guildOwner, hasAdministrator, hasManageGuild, hasManageRoles, content } = await userPerms( author, guild );
    if ( content ) { return interaction.editReply( { content: content } ); }

    const strAuthorTag = author.tag;
    const oldConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( err => {
      console.error( 'Encountered an error attempting to find %s(ID:%s) in my database in preforming %s for %s in config.js:\n%s', guild.name, guild.id, myTask, strAuthorTag, err.stack );
      botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database in preforming ' + myTask + ' for <@' + author.id + '>.  Please check console for details.' );
    } );
    const arrBlackGuild = ( !oldConfig ? [] : ( oldConfig.Blacklist || [] ) );
    const arrWhiteGuild = ( !oldConfig ? [] : ( oldConfig.Whitelist || [] ) );
    const chanDefaultLog = ( oldConfig ? ( oldConfig.Logs ? ( oldConfig.Logs.Default ? guild.channels.cache.get( oldConfig.Logs.Default ) : guildOwner ) : guildOwner ) : guildOwner );
    const chanErrorLog = ( oldConfig ? ( oldConfig.Logs ? ( oldConfig.Logs.Error ? guild.channels.cache.get( oldConfig.Logs.Error ) : guildOwner ) : guildOwner ) : guildOwner );

    const myTask = options.getSubcommand();

    if ( ( !hasAdministrator && ( myTask === 'add' || myTask === 'clear' || myTask === 'remove' ) ) ||
      ( !hasManageGuild && ( myTask === 'reset' || myTask === 'set' ) ) ||
      ( !hasManageRoles && myTask === 'get' ) ) {
      guildOwner.send( '<@' + author.id + '> attempted to ' + ( myTask === 'get' ? 'view' : 'modify' ) + ' the configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR`, `MANAGE_GUILD`, or `MANAGE_ROLES` permission, and my bot mods can do that.' );
      return interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + guildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
    }
    else {
      if ( hasAdministrator && myTask === 'add' ) {
        let addBlack = ( options.getUser( 'blacklist' ) ? options.getUser( 'blacklist' ).id : null );
        let addWhite = ( options.getUser( 'whitelist' ) ? options.getUser( 'whitelist' ).id : null );
        if ( !addBlack && !addWhite ) { return interaction.editReply( { content: 'You forgot to tell me who to add.' } ); }
        if ( addBlack ) {
          if ( arrBlackGuild.indexOf( addBlack ) != -1 ) { return interaction.editReply( { content: '<@' + addBlack + '> is already on the blacklist!' } ) }
          else {
            arrBlackGuild.push( addBlack );
            if ( arrWhiteGuild.indexOf( addBlack ) != -1 ) { arrWhiteGuild.splice( arrWhiteGuild.indexOf( addBlack ), 1 ); }
          }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Active: oldConfig.Logs.Active,
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Channel: oldConfig.Welcome.Channel,
              Msg: oldConfig.Welcome.Msg,
              Role: oldConfig.Welcome.Role
            }
          }, { upsert: true } )
          .then( addSuccess => {
            interaction.deleteReply();
            chanDefaultLog.send( { content: '<@' + addBlack + '> has been blacklisted from using my commands in this server.' } );
            return channel.send( { content: '<@' + addBlack + '> has been blacklisted from using my commands in this server.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to add %s (%s) to the blacklist for %s: %o', addBlack, client.users.cache.get( addBlack ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to blacklist <@' + addBlack + '> with `/config add` in https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => {
              chanErrorLog.send( { content: 'Error attempting to blacklist <@' + addBlack + '>! My owner has been notified.' } );
              return interaction.editReply( { content: 'Error attempting to blacklist <@' + addBlack + '>! My owner has been notified.' } );
            } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              chanErrorLog.send( { content: 'Error attempting to blacklist <@' + addBlack + '>!' } );
              return interaction.editReply( { content: 'Error attempting to blacklist <@' + addBlack + '>!' } );
            } );
          } );
        }
        if ( addWhite ) {
          if ( arrWhiteGuild.indexOf( addWhite ) != -1 ) { return interaction.editReply( { content: '<@' + addWhite + '> is already on the whitelist!' } ) }
          else {
            arrWhiteGuild.push( addWhite );
            if ( arrBlackGuild.indexOf( addWhite ) != -1 ) { arrBlackGuild.splice( arrBlackGuild.indexOf( addWhite ), 1 ); }
          }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Active: oldConfig.Logs.Active,
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Channel: oldConfig.Welcome.Channel,
              Msg: oldConfig.Welcome.Msg,
              Role: oldConfig.Welcome.Role
            }
          }, { upsert: true } )
          .then( addSuccess => {
            interaction.deleteReply();
            chanDefaultLog.send( { content: '<@' + addWhite + '> has been whitelisted to use my commands in this server.' } );
            return channel.send( { content: '<@' + addWhite + '> has been whitelisted to use my commands in this server.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to add %s (%s) to the whitelist for %s: %o', addWhite, client.users.cache.get( addWhite ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to whitelist <@' + addWhite + '> with `/config add` in https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => {
              chanErrorLog.send( { content: 'Error attempting to whitelist <@' + addWhite + '>! My owner has been notified.' } );
              return interaction.editReply( { content: 'Error attempting to whitelist <@' + addWhite + '>! My owner has been notified.' } );
            } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              chanErrorLog.send( { content: 'Error attempting to whitelist <@' + addWhite + '>!' } );
              return interaction.editReply( { content: 'Error attempting to whitelist <@' + addWhite + '>!' } );
            } );
          } );
        }
      }
      else if ( hasAdministrator && myTask === 'clear' ) {
        let clearBlack = options.getBoolean( 'blacklist' );
        let clearWhite = options.getBoolean( 'whitelist' );
        if ( !clearBlack && !clearWhite ) { return interaction.editReply( { content: 'You forgot to tell me which list to clear.' } ); }
        await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
          Guild: oldConfig.Guild,
          Blacklist: ( clearBlack ? [] : arrBlackGuild ),
          Whitelist: ( clearWhite ? [] : arrWhiteGuild ),
          Invite: oldConfig.Invite,
          Logs: {
            Active: oldConfig.Logs.Active,
            Default: oldConfig.Logs.Default,
            Error: oldConfig.Logs.Error,
            Chat: oldConfig.Logs.Chat
          },
          Prefix: oldConfig.Prefix,
          Welcome: {
            Active: oldConfig.Welcome.Active,
            Channel: oldConfig.Welcome.Channel,
            Msg: oldConfig.Welcome.Msg,
            Role: oldConfig.Welcome.Role
          }
        }, { upsert: true } )
        .then( clearSuccess => {
          interaction.deleteReply();
          let clearedLists = ( clearWhite && clearBlack ? 'white and black lists' : ( clearWhite ? 'whitelist' : 'blacklist' ) );
          let haveHas = ( clearWhite && clearBlack ? 'have' : 'has' );
          chanDefaultLog.send( { content: 'My ' + clearedLists + ' for this server ' + haveHas + ' been cleared.' } );
          return channel.send( { content: 'My ' + clearedLists + ' for this server ' + haveHas + ' been cleared.' } );
        } )
        .catch( clearError => {
          let unclearedLists = ( clearWhite && clearBlack ? 'white and black lists' : ( clearWhite ? 'whitelist' : 'blacklist' ) );
          console.error( 'Error attempting to clear my %s for %s: %o', unclearedLists, author.displayName, guild.name, clearError );
          botOwner.send( 'Error attempting to clear my ' + unclearedLists + ' with `/config clear` in https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
          .then( sentOwner => {
            chanErrorLog.send( { content: 'Error attempting to clear my ' + unclearedLists + ' for this server! My owner has been notified.' } );
            return interaction.editReply( { content: 'Error attempting to clear my ' + unclearedLists + ' for this server! My owner has been notified.' } );
          } )
          .catch( errSend => {
            console.error( 'Error attempting to DM you about above error: %o', errSend );
            chanErrorLog.send( { content: 'Error attempting to clear my ' + unclearedLists + ' for this server!' } );
            return interaction.editReply( { content: 'Error attempting to clear my ' + unclearedLists + ' for this server!' } );
          } );
        } );
      }
      else if ( hasAdministrator && myTask === 'remove' ) {
        let remBlack = ( options.getUser( 'blacklist' ) ? options.getUser( 'blacklist' ).id : null );
        let remWhite = ( options.getUser( 'whitelist' ) ? options.getUser( 'whitelist' ).id : null );
        if ( !remBlack && !remWhite ) { return interaction.editReply( { content: 'You forgot to tell me who to remove.' } ); }
        if ( remBlack ) {
          if ( arrBlackGuild.indexOf( remBlack ) === -1 ) { return interaction.editReply( { content: '<@' + remBlack + '> wasn\'t on the blacklist!' } ) }
          else { arrBlackGuild.splice( arrBlackGuild.indexOf( remBlack ), 1 ); }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Active: oldConfig.Logs.Active,
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Channel: oldConfig.Welcome.Channel,
              Msg: oldConfig.Welcome.Msg,
              Role: oldConfig.Welcome.Role
            }
          }, { upsert: true } )
          .then( addSuccess => {
            interaction.deleteReply();
            chanDefaultLog.send( { content: '<@' + remBlack + '> is no longer blacklisted from using my commands in this server.' } );
            return channel.send( { content: '<@' + remBlack + '> is no longer blacklisted from using my commands in this server.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to de-blacklist %s (%s) from %s: %o', remBlack, client.users.cache.get( remBlack ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to de-blacklist <@' + remBlack + '> with `/config remove` from https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => {
              chanErrorLog.send( { content: 'Error attempting to de-blacklist <@' + remBlack + '>! My owner has been notified.' } );
              return interaction.editReply( { content: 'Error attempting to de-blacklist <@' + remBlack + '>! My owner has been notified.' } );
              } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              chanErrorLog.send( { content: 'Error attempting to de-blacklist <@' + remBlack + '>!' } );
              return interaction.editReply( { content: 'Error attempting to de-blacklist <@' + remBlack + '>!' } );
            } );
          } );
        }
        if ( remWhite ) {
          if ( arrWhiteGuild.indexOf( remWhite ) === -1 ) { return interaction.editReply( { content: '<@' + remWhite + '> wasn\'t on the whitelist!' } ) }
          else { arrWhiteGuild.splice( arrWhiteGuild.indexOf( remWhite ), 1 ); }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Active: oldConfig.Logs.Active,
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Channel: oldConfig.Welcome.Channel,
              Msg: oldConfig.Welcome.Msg,
              Role: oldConfig.Welcome.Role
            }
          }, { upsert: true } )
          .then( addSuccess => {
            interaction.deleteReply();
            chanDefaultLog.send( { content: '<@' + remWhite + '> is no longer whitelisted to use my commands in this server.' } );
            return channel.send( { content: '<@' + remWhite + '> is no longer whitelisted to use my commands in this server.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to de-whitelist %s (%s) from %s: %o', remWhite, client.users.cache.get( remWhite ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to de-whitelist <@' + remWhite + '> with `/config remove` in https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => {
              chanErrorLog.send( { content: 'Error attempting to de-whitelist <@' + remWhite + '>! My owner has been notified.' } );
              return interaction.editReply( { content: 'Error attempting to de-whitelist <@' + remWhite + '>! My owner has been notified.' } );
            } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              chanErrorLog.send( { content: 'Error attempting to de-whitelist <@' + remWhite + '>!' } );
              return interaction.editReply( { content: 'Error attempting to de-whitelist <@' + remWhite + '>!' } );
            } );
          } );
        }
      }
      else if ( hasManageRoles && myTask === 'get' ) {
        let showConfigs = 'Guild configuration:\n\t' +
          'Invite channel is not configured for this server\n\t' +
          'Log channels are not configured for this server.\n\t' +
          '\tAll logs will go to the server owner, <@' + guildOwner.id + '>\n\t' +
          'Global prefix being used.\n\t' +
          'No members are blacklisted or whitelisted.\n\t' +
          'On join welcomes are **DISABLED**.';
        if ( oldConfig ) {
          let showInvite = ( oldConfig.Invite ? '<#' + oldConfig.Invite + '>' : '**My best guess** ¯\_(ツ)_/¯' );
          let showChat = ( oldConfig.Logs.Chat ? '<#' + oldConfig.Logs.Chat + '>' : 'DM to <@' + guild.ownerId + '>' );
          let showDefault = ( oldConfig.Logs.Default ? '<#' + oldConfig.Logs.Default + '>' : 'DM to <@' + guild.ownerId + '>' );
          let showError = ( oldConfig.Logs.Error ? '<#' + oldConfig.Logs.Error + '>' : 'DM to <@' + guild.ownerId + '>' );
          let showPrefix = '**`' + ( oldConfig.Prefix || globalPrefix ) + '`**';
          let showWelcomeRole = ( oldConfig.Welcome.Role ? 'assigned <@' + oldConfig.Welcome.Role + '> and ' : '' );
          let showWelcomeChan = 'sent to ' + ( '<#' + oldConfig.Welcome.Channel + '>' || 'DM' );
          let showWelcomeMsg = ' with the following message:\n```\n' + oldConfig.Welcome.Msg + '\n```\n';
          let showWelcome = ( oldConfig.Welcome.Active ? showWelcomeRole + showWelcomeChan + showWelcomeMsg : '**`DISABLED`**.' );
          let showBlackList = '**' + ( arrBlackGuild.length === 0 ? 'No one is blacklisted!' : '[ **<@' + arrBlackGuild.join( '>**, **<@' ) + '>** ]' ) + '**';
          let showWhiteList = '**' + ( arrWhiteGuild.length === 0 ? 'No one is whitelisted!' : '[ **<@' + arrWhiteGuild.join( '>**, **<@' ) + '>** ]' ) + '**';

          showConfigs = 'Guild configuration:\n\t' +
            'Invite channel is: ' + showInvite + '\n\t' +
            'Default log channel is: ' + showDefault + '\n\t' +
            'Error message logs go to: ' + showError + '\n\t' +
            'Chat command requests log to: ' + showChat + '\n\t' +
            'Command prefix is set to: ' + showPrefix + '\n\t' +
            'On join welcomes are ' + showWelcome + '\n\t' +
            'Blacklist: ' + showBlackList + '\n\t' +
            'Whitelist: ' + showWhiteList;
        }
        if ( !options.getBoolean( 'share' ) ) {
          return interaction.editReply( { content: showConfigs } );
        } else {
          channel.send( showConfigs )
          .then( sent => { return interaction.editReply( { content: 'I shared the settings in the channel.' } ); } )
          .catch( errSend => { return interaction.editReply( { content: 'Error sharing the settings in the channel.' } ); } );
        }
      }
      else if ( hasManageGuild && myTask === 'reset' ) {
        await guildConfigDB.updateOne(
          { Guild: guild.id },
          {
            Guild: guild.id,
            Blacklist: [],
            Whitelist: [],
            Invite: null,
            Logs: { Active: true, Chat: null, Default: null, Error: null },
            Prefix: globalPrefix,
            Welcome: { Active: false, Channel: null, Msg: null, Role: null }
          },
          { upsert: true } )
        .then( resetSuccess => {
          chanDefaultLog.send( { content: 'Guild settings reset by <@' + author.id + '>.' } );
          return interaction.editReply( { content: 'Guild settings reset.' } );
        } )
        .catch( resetError => {
          console.error( 'Encountered an error attempting to reset %s(ID:%s) in my database for %s in config.js:\n%o', guild.name, guild.id, strAuthorTag, resetError );
          botOwner.send( 'Encountered an error attempting to reset `' + guild.name + '`(:id:' + guild.id + ') in my database for <@' + author.id + '>.  Please check console for details.' )
          .then( sentOwner => {
            chanErrorLog.send( { content: 'Error resetting guild configuration for <@' + author.id + '>. My owner has been notified.' } );
            return interaction.editReply( { content: 'Error resetting guild configuration. My owner has been notified.' } );
          } )
          .catch( errSend => {
            console.error( 'Encountered an error attempting to DM you about the above error: %o', errSend );
            chanErrorLog.send( { content: 'Error resetting guild configuration for <@' + author.id + '>.' } );
            return interaction.editReply( { content: 'Error resetting guild configuration.' } );
          } );
        } );
      }
      else if ( hasManageGuild && myTask === 'set' ) {
        var setInvite = ( options.getChannel( 'invite' ) ? options.getChannel( 'invite' ).id : null );
        var boolLogs = ( options.getBoolean( 'logs' ) ? options.getBoolean( 'logs' ) : true );
        var setChat = ( options.getChannel( 'log-chat' ) ? options.getChannel( 'log-chat' ).id : null );
        var setDefault = ( options.getChannel( 'log-default' ) ? options.getChannel( 'log-default' ).id : null );
        var setError = ( options.getChannel( 'log-error' ) ? options.getChannel( 'log-error' ).id : null );
        var setPrefix = ( options.getString( 'prefix' ) ? options.getString( 'prefix' ) : globalPrefix );
        var boolWelcome = ( options.getBoolean( 'welcome' ) ? options.getBoolean( 'welcome' ) : false );
        var strWelcome = ( options.getString( 'welcome-message' ) ? options.getString( 'welcome-message' ) : null );
        var setWelcome = ( options.getChannel( 'welcome-channel' ) ? options.getChannel( 'welcome-channel' ).id : null );
        var sendDM = ( options.getBoolean( 'welcome-dm' ) ? options.getBoolean( 'welcome-dm' ) : ( setWelcome ? false : true ) );
        var joinWelcome = ( options.getRole( 'welcome-role' ) ? options.getRole( 'welcome-role' ).id : null );
        var giveRole = ( options.getBoolean( 'welcome-role-give' ) ? options.getBoolean( 'welcome-role-give' ) : ( joinWelcome ? true : false ) );

        if ( !oldConfig ) {
          if ( setDefault ) {
            if ( !setChat ) { setChat = setDefault; }
            if ( !setError ) { setError = setDefault; }
          }
          await guildConfigDB.create( {
            Guild: guild.id,
            Blacklist: [],
            Whitelist: [],
            Invite: setInvite,
            Logs: { Active: boolLogs, Default: setDefault, Error: setError, Chat: setChat },
            Prefix: setPrefix,
            Welcome: { Active: boolWelcome, Channel: ( !sendDM ? setWelcome : null ), Msg: strWelcome, Role: giveRole }
          } )
          .then( createSuccess => { interaction.editReply( { content: 'Guild configuration set.' } ); } )
          .catch( setError => {
            interaction.editReply( { content: 'Error setting guild configuration.' } );
            console.error( 'Encountered an error attempting to create %s(ID:%s) guild configuration in my database for %s in config.js:\n%o', guild.name, guild.id, strAuthorTag, setError );
            botOwner.send( 'Encountered an error attempting to create `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database for <@' + author.id + '>.  Please check console for details.' );
          } );
        }
        else {
          let oldInvite = oldConfig.Invite;
          let oldLogs = oldConfig.Logs.Active;
          let oldDefault = oldConfig.Logs.Default;
          let oldError = oldConfig.Logs.Error;
          let oldChat = oldConfig.Logs.Chat;
          let oldPrefix = oldConfig.Prefix;
          let oldWelcome = oldConfig.Welcome.Active;
          let oldWelcomeChan = oldConfig.Welcome.Channel;
          let oldWelcomeMsg = oldConfig.Welcome.Msg;
          let oldWelcomeRole = oldConfig.Welcome.Role
          await guildConfigDB.updateOne( { Guild: guild.id }, {
            Guild: guild.id,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: setInvite || oldInvite,
            Logs: {
              Active: boolLogs || oldLogs,
              Default: setDefault || oldDefault,
              Error: setError || oldError,
              Chat: setChat || oldChat
            },
            Prefix: setPrefix || oldPrefix,
            Welcome: {
              Active: boolWelcome || oldWelcome,
              Channel: setWelcome || oldWelcomeChan,
              Msg: strWelcome || oldWelcomeMsg,
              Role: joinWelcome || oldWelcomeRole
            }
          } )
          .then( updateSuccess => {
            let showInvite = ( ( setInvite || oldInvite ) ? '<#' + ( setInvite || oldInvite ) + '>' : '**My best guess** ¯\_(ツ)_/¯' );
            let showChat = ( ( setChat || oldChat ) ? '<#' + ( setChat || oldChat ) + '>' : 'DM to <@' + guild.ownerId + '>' );
            let showDefault = ( ( setDefault || oldDefault ) ? '<#' + ( setDefault || oldDefault ) + '>' : 'DM to <@' + guild.ownerId + '>' );
            let showError = ( ( setError || oldError ) ? '<#' + ( setError || oldError ) + '>' : 'DM to <@' + guild.ownerId + '>' );
            let showPrefix = '**`' + ( setPrefix || oldPrefix ) + '`**';
            let showWelcomeRole = ( oldConfig.Welcome.Role ? 'assigned <@' + oldConfig.Welcome.Role + '> and ' : '' );
            let showWelcomeChan = 'sent to ' + ( '<#' + oldConfig.Welcome.Channel + '>' || 'DM' );
            let showWelcomeMsg = ' with the following message:\n```\n' + ( strWelcome || oldWelcomeMsg ) + '\n```\n';
            let showWelcome = ( ( boolWelcome || oldWelcome ) ? showWelcomeRole + showWelcomeChan + showWelcomeMsg : '**`DISABLED`**.' );
            let showBlackList = '**' + ( arrBlackGuild.length === 0 ? 'No one is blacklisted!' : '[ **<@' + arrBlackGuild.join( '>**, **<@' ) + '>** ]' ) + '**';
            let showWhiteList = '**' + ( arrWhiteGuild.length === 0 ? 'No one is whitelisted!' : '[ **<@' + arrWhiteGuild.join( '>**, **<@' ) + '>** ]' ) + '**';

            let showConfigs = 'Guild configuration updated:\n\t' +
              'Invite channel is: ' + showInvite + '\n\t' +
              'Default log channel is: ' + showDefault + '\n\t' +
              'Error message logs go to: ' + showError + '\n\t' +
              'Chat command requests log to: ' + showChat + '\n\t' +
              'Command prefix is set to: ' + showPrefix + '\n\t' +
              'On join welcomes are ' + showWelcome + '\n\t' +
              'Blacklist: ' + showBlackList + '\n\t' +
              'Whitelist: ' + showWhiteList
            chanDefaultLog.send( { content: showConfigs } );
            return interaction.editReply( { content: showConfigs } );
          } )
          .catch( setError => {
            console.error( 'Encountered an error attempting to update %s(ID:%s) guild configuration in my database for %s in config.js:\n%o', guild.name, guild.id, strAuthorTag, setError );
            botOwner.send( 'Encountered an error attempting to update `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database for <@' + author.id + '>.  Please check console for details.' )
            .then( sentOwner => {
              chanErrorLog.send( { content: 'Error setting guild configuration for <@' + author.id + '>. My owner has been notified.' } );
              return interaction.editReply( { content: 'Error setting guild configuration. My owner has been notified.' } );
            } )
            .catch( errSend => {
              console.error( 'Encountered an error attempting to DM you about the above error: %o', errSend );
              chanErrorLog.send( { content: 'Error setting guild configuration for <@' + author.id + '>.' } );
              return interaction.editReply( { content: 'Error setting guild configuration.' } );
            } );
          } );
        }
      }
    }
  }
};