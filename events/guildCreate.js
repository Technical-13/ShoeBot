const client = require( '..' );
const chalk = require( 'chalk' );
const errHandler = require( '../functions/errorHandler.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const guildConfig = require( '../models/GuildConfig.js' );

client.on( 'guildCreate', async ( guild ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const guildOwner = guild.members.cache.get( guild.ownerId );
    const newGuildConfig = await getGuildConfig( guild )
    .then( async gotGuild => {
      if ( !gotGuild.Expires ) {
      console.log( 'I\'ve added %s (id: %s) to my guildDB.', chalk.bold.green( guild.name ), guild.id ); }
      else {
        gotGuild.Expires = null;
        await guildConfig.updateOne( { _id: guild.id }, gotGuild, { upsert: true } )
        .then( updateSuccess => { console.log( 'Cleared expriation of DB entry for %s (id: %s) upon re-joining guild.', chalk.bold.green( guild.name ), guild.id ); } )
        .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) to clear expiration in DB:\n%o' ), guild.name, guild.id, updateError ); } );
      }
      const roleEveryone = guild.roles.cache.find( role => role.name === '@everyone' );
      const chanWidget = ( guild.widgetEnabled ? guild.widgetChannelId : null );
      const chanRules = guild.rulesChannelId;
      const chanPublicUpdates = guild.publicUpdatesChannelId;
      const chanSafetyAlerts = guild.safetyAlertsChannelId;
      const chanSystem = guild.systemChannelId;
      const chanFirst = Array.from( guild.channels.cache.filter( chan => !chan.nsfw && chan.permissionsFor( roleEveryone ).has( 'ViewChannel' ) ).keys() )[ 0 ];
      const definedInvite = gotGuild.Invite;
      const chanInvite = ( definedInvite || chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
      const doChanError = ( !( chanSystem || chanSafetyAlerts || chanFirst || null ) ? null : guild.channels.cache.get( chanSystem || chanSafetyAlerts || chanFirst ) );
      guildOwner.send( { content: 'Hello! You or someone from https://discord.com/channels/' + guild.id + '/' + chanInvite + ' with `ADMINISTRATOR` or `MANAGE_SERVER` permissions has added me to your server!' } )
      .catch( errSendDM => {
        const chanSystem = guild.systemChannelId;
        const chanSafetyAlerts = guild.safetyAlertsChannelId;
        const chanFirst = guild.channels.cache.filter( chan => { if ( !chan.nsfw && chan.viewable ) { return chan; } } ).first().id;
        if ( doChanError ) {
          doChanError.send( { content: 'Someone from https://discord.com/channels/' + guild.id + '/' + chanInvite + ' with `ADMINISTRATOR` or `MANAGE_SERVER` permissions has added me to your server and I was unable to DM <@' + guild.ownerId + '> about it directly!' } )
          .catch( errSendChan => {
            console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o\nerrSendChan: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM, errSendChan );
            botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or send a message to a channel that I joined https://discord.com/channels/' + guild.id + '/' + chanInvite + '.' } );
          } );
        }
        else {
          console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM );
          botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or find a channel to notify them that I joined https://discord.com/channels/' + guild.id + '/' + chanInvite + '.' } );
        }
      } )
    } )
    .catch( errGetGuild => {
      console.error( 'Failed to create %s (id: %s) in guildDB on join.', guild.name, guild.id );
      botOwner.send( { content: 'Error adding https://discord.com/channels/' + guild.id + ' to the database.' } );
    } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildCreate.js' ), errObject.stack ); }
} );