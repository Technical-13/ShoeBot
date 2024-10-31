const client = require( '..' );
const chalk = require( 'chalk' );
const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const objTimeString = require( '../time.json' );

client.on( 'guildDelete', async ( guild ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const guildOwner = guild.members.cache.get( guild.ownerId );
    const dbExpires = new Date( ( new Date() ).setMonth( ( new Date() ).getMonth() + 1 ) );
    const inviteUrl = client.generateInvite( {
      permissions: [
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ManageWebhooks,
        PermissionFlagsBits.UseApplicationCommands
      ],
      scopes: [
        OAuth2Scopes.Bot,
        OAuth2Scopes.ApplicationsCommands
      ],
    } );
    const newGuildConfig = await getGuildConfig( guild );
    newGuildConfig.Expires = dbExpires;
    await guildConfig.updateOne( { _id: guild.id }, newGuildConfig, { upsert: true } )
    .then( updateSuccess => {
      console.log( 'Set expriation of DB entry for %s (id: %s) upon leaving guild to: %o', chalk.bold.red( guild.name ), guild.id, dbExpires.toLocaleTimeString( 'en-US', objTimeString ) );
      guildOwner.send( { content: 'Hello! You or someone from https://discord.com/channels/' + guild.id + ' has removed me from your server!\nYou can get me back in your server at any time by [re-adding](<' + inviteUrl + '>) me.\nI think this might have been an error, so I\'ll save your server\'s configuration settings for a month until `' + dbExpires.toLocaleTimeString( 'en-US', objTimeString ) + '` in case you want me back.' } )
      .catch( errSendDM => {
        const chanSystem = guild.systemChannelId;
        const chanSafetyAlerts = guild.safetyAlertsChannelId;
        const chanFirst = guild.channels.cache.filter( chan => { if ( !chan.nsfw && chan.viewable ) { return chan; } } ).first().id;
        const doChanError = ( chanSystem || chanSafetyAlerts || chanFirst || null );
        if ( doChanError ) {
          doChanError.send( { content: 'Someone from https://discord.com/channels/' + guild.id + ' has removed me from your server and I was unable to DM <@' + guild.ownerId + '> about it directly!\nYou can get me back in your server at any time by [re-adding](<' + inviteUrl + '>) me.\nI think this might have been an error, so I\'ll save your server\'s configuration settings for a month until `' + dbExpires.toLocaleTimeString( 'en-US', objTimeString ) + '` in case you want me back.' } )
          .catch( errSendChan => {
            console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o\nerrSendChan: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM, errSendChan );
            botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or send a message to a channel that I left https://discord.com/channels/' + guild.id + '.' } );
          } );
        }
        else {
          console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM );
          botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or find a channel to notify them that I left https://discord.com/channels/' + guild.id + '.' } );
        }
      } );
    } )
    .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( `Error attempting to update ${guild.name} (id: ${guild.id}) to expire in DB:\n${dbExpires}\nError:\n${updateError}` ) ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildDelete.js' ), errObject.stack ); }
} );