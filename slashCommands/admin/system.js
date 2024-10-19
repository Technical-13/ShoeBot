const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const config = require( '../../config.json' );
const chalk = require( 'chalk' );
const { model, Schema } = require( 'mongoose' );
const botConfigDB = require( '../../models/BotConfig.js' );const thisBotName = process.env.BOT_USERNAME;
const botOwnerID = process.env.OWNER_ID;


module.exports = {
  name: 'system',
  description: 'Change bot configs.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  options: [/* add, clear, get, remove, reset, set //*/
    { type: 1, name: 'add', description: 'Add a user to one of my lists.', options: [
      { type: 6, name: 'blacklist', description: 'User to block from using all commands.' },
      { type: 6, name: 'moderator', description: 'User to add as a moderator.' },
      { type: 6, name: 'whitelist', description: 'User to permit to use all non-mod commands.' }
    ] }/* add //*/,
    { type: 1, name: 'clear', description: 'Clear guild\'s black, white. and/or moderator lists.', options: [
      { type: 5, name: 'blacklist', description: 'Clear guild\'s blacklist.' },
      { type: 5, name: 'moderators', description: 'Clear guild\'s moderator list.' },
      { type: 5, name: 'whitelist', description: 'Clear guild\'s whitelist.' }
    ] }/* clear //*/,
    { type: 1, name: 'get', description: 'Get my current configuration.', options: [
      { type: 5, name: 'share', description: 'Share result to current channel instead of making it ephemeral.' }
    ] },
    { type: 1, name: 'remove', description: 'Remove a user from one of my lists.', options: [
      { type: 6, name: 'blacklist', description: 'User to remove from blacklist.' },
      { type: 6, name: 'moderator', description: 'User to remove from moderator.' },
      { type: 6, name: 'whitelist', description: 'User to remove from whitelist.' }
    ] }/* remove //*/,
    { type: 1, name: 'reset', description: 'Watch me rise from the ashes like a phoenix.' },
    { type: 1, name: 'set', description: 'Set settings for the bot.', options: [
      { type: 3, name: 'name', description: 'What\'s my name!?' },
      { type: 3, name: 'prefix', description: 'What character do I look for!?' },
      { type: 6, name: 'owner', description: 'Who is my master!?' },
      { type: 3, name: 'dev-guild', description: 'Where am I from!?' }
    ] }/* set //*/
  ]/* add, get, remove, reset, set //*/,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const strAuthorTag = author.tag;
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
      .catch( errFindBot => { console.error( 'Unable to find botConfig:\n%o', errFindBot ); } );
    const botUsers = client.users.cache;
    const botGuilds = client.guilds.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const arrBlackList = ( botConfig.Blacklist || [] );
    const botMods = ( botConfig.Mods || [] );
    const arrWhiteList = ( botConfig.Whitelist || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const myTask = options.getSubcommand();

    if ( !isBotMod ) { return interaction.editReply( { content: 'You are not the boss of me...' } ); }
    else if ( isBotMod && myTask === 'get' ) {
      let strBlackList = '**' + ( arrBlackList.length === 0 ? 'No one is blacklisted!' : '[ **<@' + arrBlackList.join( '>**, **<@' ) + '>** ]' ) + '**';
      let strModList = '**' + ( botMods.length === 0 ? 'No bot moderators!' : '[ **<@' + botMods.join( '>**, **<@' ) + '>** ]' ) + '**';
      let strWhiteList =  '**' + ( arrWhiteList.length === 0 ? 'No one is whitelisted!' : '[ **<@' + arrWhiteList.join( '>**, **<@' ) + '>** ]' ) + '**';
      const showConfigs = 'My configuration:\n\t' +
        'Name: `' + botConfig.BotName + '` (:id:`' + botConfig.ClientID + '`)\n\t' +
        'Owner: <@' + botConfig.Owner + '>\n\t' +
        'Command Prefix: `' + botConfig.Prefix + '`\n\t' +
        'Development Guild: `' + botGuilds.get( botConfig.DevGuild ).name + '`\n\t' +
        'Blacklist: ' + strBlackList + '\n\t' +
        'Whitelist: ' + strWhiteList + '\n\t' +
        'Moderators: ' + strModList;
      if ( !options.getBoolean( 'share' ) ) {
        return interaction.editReply( { content: showConfigs } );
      } else {
        channel.send( { content: showConfigs } )
        .then( sent => { return interaction.editReply( { content: 'I shared the settings in the channel.' } ); } )
        .catch( errSend => { return interaction.editReply( { content: 'Error sharing the settings in the channel.' } ); } );        
      }
    }
    else if ( isBotMod && !isBotOwner ) { return interaction.editReply( { content: 'You may only get my configuration.  Please try again.' } ); }
    else if ( isBotOwner ) {
      switch ( myTask ) {
        case 'add':
          let addBlack = ( options.getUser( 'blacklist' ) ? options.getUser( 'blacklist' ).id : null );
          let addMod = ( options.getUser( 'moderator' ) ? options.getUser( 'moderator' ).id : null );
          let addWhite = ( options.getUser( 'whitelist' ) ? options.getUser( 'whitelist' ).id : null );
          if ( addBlack ) {
            if ( arrBlackList.indexOf( addBlack ) != -1 ) { return interaction.editReply( { content: '<@' + addBlack + '> is already on the blacklist!' } ) }
            else {
              arrBlackList.push( addBlack );
              if ( botMods.indexOf( addBlack ) != -1 ) {
                botMods.splice( botMods.indexOf( addBlack ), 1 );
                console.log( chalk.bold.greenBright( `Removed ${addBlack} (${botUsers.get( addBlack ).displayName}) from Mods in the database.` ) );
              }
              if ( arrWhiteList.indexOf( addBlack ) != -1 ) {
                arrWhiteList.splice( arrWhiteList.indexOf( addBlack ), 1 );
                console.log( chalk.bold.greenBright( `Removed ${addBlack} (${botUsers.get( addBlack ).displayName}) from Whitelist in the database.` ) );
              }
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: botConfig.BotName,
                ClientID: botConfig.ClientID,
                Owner: botConfig.Owner,
                Prefix: botConfig.Prefix,
                Blacklist: arrBlackList,
                Whitelist: arrWhiteList,
                Mods: botMods,
                DevGuild: botConfig.DevGuild
              }, { upsert: true } )
              .then( addSuccess => {
                console.log( chalk.bold.greenBright( `Blacklisted ${addBlack} (${botUsers.get( addBlack ).displayName}) in the database.` ) );
                return interaction.editReply( { content: 'Blacklisted <@' + addBlack + '> in the database.' } );
              } )
              .catch( addError => {
                console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to blacklist ${addBlack} (${botUsers.get( addBlack ).displayName}) in database:\n${addError}` ) );
                return interaction.editReply( { content: 'Encountered an error attempting to blacklist <@' + addBlack + '> in the database. Please check the console.' } );
              } );
            }
          }
          if ( addMod ) {
            if ( botMods.indexOf( addMod ) != -1 ) { return interaction.editReply( { content: '<@' + addMod + '> is already a moderator of me!' } ) }
            else {
              botMods.push( addMod );
              if ( arrBlackList.indexOf( addMod ) != -1 ) {
                arrBlackList.splice( arrBlackList.indexOf( addMod ), 1 );
                console.log( chalk.bold.greenBright( `Removed ${addMod} (${botUsers.get( addMod ).displayName}) from Blacklist in the database.` ) );
              }
              if ( arrWhiteList.indexOf( addMod ) != -1 ) {
                arrWhiteList.splice( arrWhiteList.indexOf( addMod ), 1 );
                console.log( chalk.bold.greenBright( `Removed ${addMod} (${botUsers.get( addMod ).displayName}) from Whitelist in the database.` ) );
              }
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: botConfig.BotName,
                ClientID: botConfig.ClientID,
                Owner: botConfig.Owner,
                Prefix: botConfig.Prefix,
                Blacklist: arrBlackList,
                Whitelist: arrWhiteList,
                Mods: botMods,
                DevGuild: botConfig.DevGuild
              }, { upsert: true } )
              .then( addSuccess => {
                console.log( chalk.bold.greenBright( `Added moderator, ${addMod} (${botUsers.get( addMod ).displayName}), to database.` ) );
                return interaction.editReply( { content: 'Added moderator, <@' + addMod + '>, to database.' } );
              } )
              .catch( addError => {
                console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to add moderator, ${addMod} (${botUsers.get( addMod ).displayName}), to database:\n${addError}` ) );
                return interaction.editReply( { content: 'Encountered an error attempting to add moderator, <@' + addMod + '>, to database. Please check the console.' } );
              } );
            }
          }
          if ( addWhite ) {
            if ( arrWhiteList.indexOf( addWhite ) != -1 ) { return interaction.editReply( { content: '<@' + addWhite + '> is already on the whitelist!' } ) }
            else {
              arrWhiteList.push( addWhite );
              if ( arrBlackList.indexOf( addWhite ) != -1 ) {
                arrBlackList.splice( arrBlackList.indexOf( addWhite ), 1 );
                console.log( chalk.bold.greenBright( `Removed ${addWhite} (${botUsers.get( addWhite ).displayName}) from Blacklist in the database.` ) );
              }
              if ( botMods.indexOf( addWhite ) != -1 ) {
                botMods.splice( botMods.indexOf( addWhite ), 1 );
                console.log( chalk.bold.greenBright( `Removed ${addWhite} (${botUsers.get( addWhite ).displayName}) from Mods in the database.` ) );
              }
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: botConfig.BotName,
                ClientID: botConfig.ClientID,
                Owner: botConfig.Owner,
                Prefix: botConfig.Prefix,
                Blacklist: arrBlackList,
                Whitelist: arrWhiteList,
                Mods: botMods,
                DevGuild: botConfig.DevGuild
              }, { upsert: true } )
              .then( addSuccess => {
                console.log( chalk.bold.greenBright( `Whitelisted ${addWhite} (${botUsers.get( addWhite ).displayName}) in the database.` ) );
                return interaction.editReply( { content: 'Whitelisted <@' + addWhite + '> in the database.' } );
              } )
              .catch( addError => {
                console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to whitelist ${addWhite} (${botUsers.get( addWhite ).displayName}) in database:\n${addError}` ) );
                return interaction.editReply( { content: 'Encountered an error attempting to whitelist <@' + addWhite + '> in the database. Please check the console.' } );
              } );
            }
          }
          break;
        case 'clear':
          let arrClearLists = [];
          let clearBlack = options.getBoolean( 'blacklist' );
          if ( clearBlack ) { arrClearLists.push( 'black' ); }
          let clearWhite = options.getBoolean( 'whitelist' );
          if ( clearWhite ) { arrClearLists.push( 'white' ); }
          let clearMods = options.getBoolean( 'moderators' );
          if ( clearMods ) { arrClearLists.push( 'moderator' ); }
          let intListsClear = arrClearLists.length;
          if ( intListsClear > 0 ) { arrClearLists[ 0 ] = arrClearLists[ 0 ].charAt( 0 ).toUpperCase() + arrClearLists[ 0 ].slice( 1 ); }
          let haveHas = ( intListsClear === 1 ? 'has' : 'have' );
          let clearLists = '';
          switch ( intListsClear ) {
            case 0: break;
            case 1:
              clearLists = arrClearLists[ 0 ] + ' list';
              break;
            case 2:
              clearLists = arrClearLists.join( ' and ' ) + ' lists';
              break;
            case 3: default:
              let lastList = arrClearLists.pop();
              clearLists = arrClearLists.join( ', ' ) + ', and ' + lastList + ' lists';
          }
          
          await botConfigDB.updateOne( { BotName: thisBotName }, {
            BotName: botConfig.BotName,
            ClientID: botConfig.ClientID,
            Owner: botConfig.Owner,
            Prefix: botConfig.Prefix,
            Blacklist: ( clearBlack ? [] : arrBlackList ),
            Whitelist: ( clearWhite ? [] : arrWhiteList ),
            Mods: ( clearMods ? [] : botMods ),
            DevGuild: botConfig.DevGuild
          }, { upsert: true } )
          .then( clearSuccess => {
            interaction.deleteReply();
            return channel.send( { content: 'My ' + clearLists + haveHas + ' been cleared.' } );
          } )
          .catch( clearError => {
            console.error( 'Error attempting to clear my %s for %s: %o', clearLists, author.displayName, guild.name, clearError );
            botOwner.send( 'Error attempting to clear my ' + clearLists + ' with `/system clear`.  Please check the console.' )
            .then( sentOwner => {
              return interaction.editReply( { content: 'Error attempting to clear my ' + clearLists + ' for this server! My owner has been notified.' } );
            } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              return interaction.editReply( { content: 'Error attempting to clear my ' + clearLists + ' for this server!' } );
            } );
          } );
          break;
        case 'remove':
          let remBlack = ( options.getUser( 'blacklist' ) ? options.getUser( 'blacklist' ).id : null );
          let remMod = ( options.getUser( 'moderator' ) ? options.getUser( 'moderator' ).id : null );
          let remWhite = ( options.getUser( 'whitelist' ) ? options.getUser( 'whitelist' ).id : null );
          if ( remBlack ) {
            if ( arrBlackList.indexOf( remBlack ) === -1 ) { return interaction.editReply( { content: '<@' + remBlack + '> wasn\'t on the blacklist!' } ) }
            else {
              arrBlackList.splice( arrBlackList.indexOf( remBlack ), 1 );
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: botConfig.BotName,
                ClientID: botConfig.ClientID,
                Owner: botConfig.Owner,
                Prefix: botConfig.Prefix,
                Blacklist: arrBlackList,
                Whitelist: arrWhiteList,
                Mods: botMods,
                DevGuild: botConfig.DevGuild
              }, { upsert: true } )
              .then( remSuccess => {
                console.log( chalk.bold.greenBright( `Removed ${remBlack} (${botUsers.get( remBlack ).displayName}) from Blacklist in the database.` ) );
                return interaction.editReply( { content: 'Removed <@' + remBlack + '> from Blacklist in the database.' } );
              } )
              .catch( remError => {
                console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to remove ${remBlack} (${botUsers.get( remBlack ).displayName}) from Blacklist in the database:\n${remError}` ) );
                return interaction.editReply( { content: 'Encountered an error attempting to remove <@' + remBlack + '> from Blacklist in the database. Please check the console.' } );
              } );
            }
          }
          if ( remMod ) {
            if ( botMods.indexOf( remMod ) === -1 ) { return interaction.editReply( { content: '<@' + remMod + '> wasn\'t a moderator of me!' } ) }
            else {
              botMods.splice( botMods.indexOf( remMod ), 1 );
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: botConfig.BotName,
                ClientID: botConfig.ClientID,
                Owner: botConfig.Owner,
                Prefix: botConfig.Prefix,
                Blacklist: arrBlackList,
                Whitelist: arrWhiteList,
                Mods: botMods,
                DevGuild: botConfig.DevGuild
              }, { upsert: true } )
              .then( remSuccess => {
                console.log( chalk.bold.greenBright( `Removed moderator, ${remMod} (${botUsers.get( remMod ).displayName}), from database.` ) );
                return interaction.editReply( { content: 'Removed moderator, <@' + remMod + '>, from database.' } );
              } )
              .catch( remError => {
                console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to remove moderator from database:\n${remError}` ) );
                return interaction.editReply( { content: 'Encountered an error attempting to remove moderator, <@' + remMod + '>, from database. Please check the console.' } );
              } );
            }
          }
          if ( remWhite ) {
            if ( arrWhiteList.indexOf( remWhite ) === -1 ) { return interaction.editReply( { content: '<@' + remWhite + '> wasn\'t on the whitelist!' } ) }
            else {
              arrWhiteList.splice( arrWhiteList.indexOf( remWhite ), 1 );
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: botConfig.BotName,
                ClientID: botConfig.ClientID,
                Owner: botConfig.Owner,
                Prefix: botConfig.Prefix,
                Blacklist: arrBlackList,
                Whitelist: arrWhiteList,
                Mods: botMods,
                DevGuild: botConfig.DevGuild
              }, { upsert: true } )
              .then( remSuccess => {
                console.log( chalk.bold.greenBright( `Removed ${remWhite} (${botUsers.get( remWhite ).displayName}) from Whitelist in the database.` ) );
                return interaction.editReply( { content: 'Removed <@' + remWhite + '> from Whitelist in the database.' } );
              } )
              .catch( remError => {
                console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to remove ${remWhite} (${botUsers.get( remWhite ).displayName}) from Whitelist in the database:\n${remError}` ) );
                return interaction.editReply( { content: 'Encountered an error attempting to remove <@' + remWhite + '> from Whitelist in the database. Please check the console.' } );
              } );
            }
          }
          break;
        case 'reset':
          const thisBotName = ( config.botName || process.env.BOT_USERNAME || null );
          const botOwnerID = ( config.botOwnerId || process.env.OWNER_ID || null );
          const clientId = ( config.clientID || process.env.CLIENT_ID || client.id || null );
          const devGuildId = ( config.devGuildId || process.env.DEV_GUILD_ID || null );
          if ( thisBotName && botOwnerID && clientId && devGuildId ) {
            await botConfigDB.updateOne( { BotName: thisBotName }, {
              BotName: thisBotName,
              ClientID: clientId,
              Owner: botOwnerID,
              Prefix: ( config.prefix || '!' ),
              Blacklist: [],
              Whitelist: [],
              Mods: ( config.moderatorIds || [] ),
              DevGuild: devGuildId
            }, { upsert: true } )
            .then( resetSuccess => {
              console.log( chalk.bold.greenBright( 'Bot configuration reset in my database.' ) );
              return interaction.editReply( { content: 'Bot configuration reset in my database.' } );
            } )
            .catch( resetError => {
              console.error( chalk.bold.red.bgYellowBright( 'Encountered an error attempting to reset configuration with `/system reset`:\n%o' ), resetError );
              return interaction.editReply( { content: 'Encountered an error attempting to reset configuration with `/system reset`. Please check the console.' } );
            } );
          }
          else {
            if ( !thisBotName ) { console.error( chalk.bold.redBright( 'BotName missing attempting to reset configuration with `/system reset`.' ) ); }
            if ( !botOwnerID ) { console.error( chalk.bold.redBright( 'ClientID missing attempting to reset configuration with `/system reset`.' ) ); }
            if ( !clientId ) { console.error( chalk.bold.redBright( 'Owner missing attempting to reset configuration with `/system reset`.' ) ); }
            if ( !devGuildId ) { console.error( chalk.bold.redBright( 'DevGuild missing attempting to reset configuration with `/system reset`.' ) ); }
          }
          break;
        case 'set':
          let newName = ( options.getString( 'name' ) || botConfig.BotName || config.botName );
          let newOwner = options.getUser( 'owner' );
          let newOwnerId = ( newOwner ? newOwner.id : ( botConfig.Owner || config.botOwnerId || botOwnerID ) );
          let newPrefix = ( options.getString( 'prefix' ) || botConfig.Prefix || config.prefix );
          let newDevGuild = ( options.getString( 'dev-guild' ) || botConfig.DevGuild || config.devGuildId );
          await botConfigDB.updateOne( { BotName: thisBotName }, {
              BotName: newName,
              ClientID: botConfig.ClientID,
              Owner: newOwnerId,
              Prefix: newPrefix,
              Blacklist: arrBlackList,
              Whitelist: arrWhiteList,
              Mods: botMods,
              DevGuild: newDevGuild
          }, { upsert: true } )
          .then( setSuccess => {
            console.log( chalk.bold.greenBright( 'Bot configuration modified in my database.' ) );
            let strBlackList = '**' + ( arrBlackList.length === 0 ? 'No one is blacklisted!' : '[ **<@' + arrBlackList.join( '>**, **<@' ) + '>** ]' ) + '**';
            let strModList = '**' + ( botMods.length === 0 ? 'No bot moderators!' : '[ **<@' + botMods.join( '>**, **<@' ) + '>** ]' ) + '**';
            let strWhiteList =  '**' + ( arrWhiteList.length === 0 ? 'No one is whitelisted!' : '[ **<@' + arrWhiteList.join( '>**, **<@' ) + '>** ]' ) + '**';
            return interaction.editReply( {
              content: 'New configuration:\n\t' +
              'Name: `' + newName + '` (:id:`' + botConfig.ClientID + '`)\n\t' +
              'Owner: <@' + newOwnerId + '>\n\t' +
              'Command Prefix: `' + newPrefix + '`\n\t' +
              'Development Guild: `' + botGuilds.get( newDevGuild ).name + '`\n\t' +
              'Blacklist: ' + strBlackList + '\n\t' +
              'Whitelist: ' + strWhiteList + '\n\t' +
              'Moderators: ' + strModList
            } );
          } )
          .catch( setError => {
            console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to modify bot configuration in my database:\n${setError}` ) );
            return interaction.editReply( { content: 'Encountered an error attempting to modify bot configuration in my database. Please check the console.' } );
          } );
          break;
      }
    }
  }
};