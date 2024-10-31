const client = require( '..' );
const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const parse = require( '../functions/parser.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );

client.on( 'ready', async rdy => {
  try {
    const activityTypes = { 'Playing': 0, 'Streaming': 1, 'Listening': 2, 'Watching': 3, 'Custom': 4, 'Competing': 5 };
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
    await client.user.setPresence( { activities: [ { type: activityTypes.Custom, name: '🥱 Just waking up...' } ], status: 'dnd' } );

    const today = ( new Date() );
    const objTimeString = {"hour":"2-digit","hourCycle":"h24","minute":"2-digit","second":"2-digit","timeZone":"America/New_York","timeZoneName":"short"};
    const botTime = today.toLocaleTimeString( 'en-US', objTimeString );
    console.log( chalk.bold( `The bot owner's local time is ${botTime}.` ) );
    const hour = parseInt( botTime.split( ':' )[ 0 ] );
    const myTime = ( hour >= 5 && hour < 12 ? 'morning' : ( hour >= 12 && hour < 18 ? 'afternoon' : ( hour >= 18 && hour < 23 ? 'evening' : 'nighttime' ) ) );
    const myCup = ( hour >= 5 && hour < 12 ? 'my ' : ( hour >= 12 && hour < 18 ? 'an ' : 'a ' ) ) + myTime;
    setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes.Watching, name: 'my ' + myTime + ' coffee brew...' } ], status: 'dnd' } ); }, 15000 );
    setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes.Custom, name: 'Drinking ' + myCup + ' cup of ☕' } ], status: 'idle' } ); }, 60000 );
    const firstActivity = config.activities[ 0 ];
    setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes[ firstActivity.type ], name: firstActivity.name } ], status: 'online' } ); }, 180000 );

    const servingGuilds = [ { type: 'Custom', name: 'Watching {{bot.servers}} servers.' } ];
    const servingUsers = [ { type: 'Custom', name: 'Listening to {{bot.users}} members.' } ];
    const botUptime = [ { type: 'Custom', name: 'Uptime: {{bot.uptime}}' } ];
    const cycleActivities = [].concat( config.activities, servingGuilds, servingUsers, botUptime );
    const intActivities = cycleActivities.length;
    var iAct = 1;
    setInterval( async () => {
      let activityIndex = ( iAct++ % intActivities );
      let thisActivity = cycleActivities[ activityIndex ];
      let actType = activityTypes[ thisActivity.type ];
      let actName = await parse( thisActivity.name, { uptime: { getWeeks: true } } );
      await client.user.setPresence( { activities: [ { type: actType, name: actName } ], status: 'online' } );
    }, 300000 );

    console.log( chalk.bold.magentaBright( `Successfully logged in as: ${client.user.tag}` ) );
    const guildConfigs = await guildConfig.find();
    const guildConfigIds = [];
    guildConfigs.forEach( ( entry, i ) => { guildConfigIds.push( entry._id ); } );
    const guildIds = Array.from( client.guilds.cache.keys() );
    guildIds.forEach( async ( guildId ) => {
      const guild = client.guilds.cache.get( guildId );
      const guildOwner = guild.members.cache.get( guild.ownerId );
      if ( guildConfigIds.indexOf( guildId ) != -1 ) { guildConfigIds.splice( guildConfigIds.indexOf( guildId ), 1 ) }
      console.log( 'Checking guild %s (id: %s)...', chalk.bold.cyan( guild.name), guildId );
      const currGuildConfig = await getGuildConfig( guild );
      var doUpdate = false;
      const newName = ( guild.name !== currGuildConfig.Guild.Name ? true : false );
      const newOwnerID = ( guild.ownerId !== currGuildConfig.Guild.OwnerID ? true : false );
      const newOwnerName = ( guildOwner.displayName !== currGuildConfig.Guild.OwnerName ? true : false );
      const newSize = ( guild.members.cache.size !== currGuildConfig.Guild.Members ? true : false );
      if ( newName ) {// Update guild name
        currGuildConfig.Guild.Name = guild.name;
        doUpdate = true;
      }
      if ( newOwnerID ) {// Update guild owner id
        currGuildConfig.Guild.OwnerID = guild.ownerId;
        doUpdate = true;
      }
      if ( newOwnerName ) {// Update guild owner displayName
        currGuildConfig.Guild.OwnerName = guild.displayName;
        doUpdate = true;
      }
      if ( newSize ) {// Update guild size
        currGuildConfig.Guild.Members = guild.members.cache.size;
        doUpdate = true;
      }
      if ( doUpdate ) {// Something changed offline
        await guildConfig.updateOne( { _id: guildId }, currGuildConfig, { upsert: true } )
        .then( updateSuccess => { console.log( 'Succesfully updated %s (id: %s) in my database.', chalk.bold.yellow( guild.name ), guildId ); } )
        .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) to my database:\n%o' ), guild.name, guildId, updateError ); } );
      }
    } );
    if ( guildConfigIds.length !== 0 ) {
      guildConfigIds.forEach( async ( guildId ) => {
        const delGuild = guildConfigs.find( entry => entry.id === guildId );
        const guildOwner = ( client.users.cache.get( delGuild.Guild.OwnerID ) || null );
        const ownerName = ( guildOwner ? '<@' + guildOwner.id + '>' : '`' + delGuild.Guild.OwnerName + '`' )
        await guildConfig.deleteOne( { _id: guildId } )
        .then( delExpired => {
          console.log( 'Succesfully deleted expired %s (id: %s) from my database.', chalk.bold.red( delGuild.Guild.Name ), guildId );
          if ( guildOwner ) {
            guildOwner.send( { content: 'Hello! It has been a month since someone has removed me from [' + delGuild.Guild.Name + '](<https://discord.com/channels/' + guildId + '>), and I\'ve cleaned out your configuration settings!\n\nYou can still get me back in your server at any time by [re-adding](<' + inviteUrl + '>) me.' } )
            .catch( errSendDM => {
              console.error( 'errSendDM: %s', errSendDM.stack );
              botOwner.send( { content: 'Failed to DM ' + ownerName + ' to notify them that I cleaned the guild, [' + delGuild.Guild.Name + '](<https://discord.com/channels/' + guildId + '>), from my database.' } );
            } );
          }
          else {
            botOwner.send( { content: 'Unable to find ' + ownerName + ' to notify them that I cleaned the guild, [' + delGuild.Guild.Name + '](<https://discord.com/channels/' + guildId + '>), from my database.' } );
          }
        } )
        .catch( errDelete => { throw new Error( chalk.bold.red.bgYellowBright( `Error attempting to delete ${delGuild.Guild.Name} (id: ${guildId}) from my database:\n${errDelete.stack}` ) ); } );
      } );
    }
  }
  catch ( objError ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'ready.js' ), errObject.stack ); }
} );