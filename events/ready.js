const client = require( '..' );
const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const userConfig = require( '../models/BotUser.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const createNewGuild = require( '../functions/createNewGuild.js' );
const createNewUser = require( '../functions/createNewUser.js' );
const addUserGuild = require( '../functions/addUserGuild.js' );
const getBotConfig = require( '../functions/getBotDB.js' );
const duration = require( '../functions/duration.js' );
const parse = require( '../functions/parser.js' );
const verGuildDB = config.verGuildDB;
const verUserDB = config.verUserDB;
Array.prototype.getDiff = function( arrOld ) { return this.filter( a => !arrOld.includes( a ) ); };
Array.prototype.getDistinct = function() { return this.filter( ( val, i, arr ) => i == arr.indexOf( val ) ); }
Object.prototype.valMatch = function( that ) { return JSON.stringify( this ) == JSON.stringify( that ) }

client.on( 'ready', async rdy => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
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

    const dbExpires = new Date( ( new Date() ).setMonth( ( new Date() ).getMonth() + 1 ) );
    new Promise( async ( resolve, reject ) => {
      const botGuildIds = Array.from( client.guilds.cache.keys() );
      if ( !Array.isArray( botGuildIds ) ) { reject( { message: 'Unable to retrieve guilds bot is in.' } ); }
      const storedGuilds = await guildConfig.find();
      const storedGuildIds = Array.from( storedGuilds.keys() );
      if ( !Array.isArray( storedGuildIds ) ) { reject( { message: 'Unable to retrieve bot\'s guilds from database.' } ); }
      const allGuildIds = [].concat( botGuildIds, storedGuildIds ).getDistinct().sort();
      const addedGuildIds = botGuildIds.getDiff( storedGuildIds );
      const removedGuildIds = storedGuildIds.getDiff( botGuildIds );
      const ioGuildIds = [].concat( addedGuildIds, removedGuildIds ).sort();
      const updateGuildIds = allGuildIds.getDiff( ioGuildIds ).getDistinct();
      for ( let guildId of updateGuildIds ) {
        let ndxGuild = updateGuildIds.indexOf( guildId );
        let botGuild = client.guilds.cache.get( guildId );
        let actualEntry = storedGuilds.filter( g => g._id === guildId );
        let Blacklist = ( actualEntry.Blacklist || { Members: [], Roles: [] } );
        let Logs = ( actualEntry.Logs || { Active: true, Chat: null, Default: null, Error: null, strClosing: logClosing( null ) } );
        let Part = ( actualEntry.Part || { Active: false, Channel: null, Message: null, SaveRoles: false } );
        let Welcome = ( actualEntry.Welcome || { Active: false, Channel: null, Message: null, Role: null } );
        let Whitelist = ( actualEntry.Whitelist || { Members: [], Roles: [] } );
        let expectedEntry = {
          _id: botGuild.id,
          Bans: actualEntry.Bans,
          Blacklist: {
            Members: Blacklist.Members,
            Roles: Blacklist.Roles
          },
          Commands: actualEntry.Commands,
          Expires: actualEntry.Expires,
          Guild: {
            Name: botGuild.name,
            Members: botGuild.members.cache.size,
            OwnerID: botGuild.ownerId,
            OwnerName: guildOwner.displayName
          },
          Invite: actualEntry.Invite,
          Logs: {
            Active: Logs.Active,
            Chat: Logs.Chat,
            Default: Logs.Default,
            Error: Logs.Error,
            strClosing: Logs.strClosing
          },
          Part: {
            Active: Part.Active,
            Channel: Part.Channel,
            Message: Part.Message,
            SaveRoles: Part.SaveRoles
          },
          Prefix: actualEntry.Prefix,
          Premium: actualEntry.Premium,
          Version: verGuildDB,
          Welcome: {
            Active: Welcome.Active,
            Channel: Welcome.Channel,
            Message: Welcome.Message,
            Role: Welcome.Role
          },
          Whitelist: {
            Members: Whitelist.Members,
            Roles: Whitelist.Roles
          }
        };
        if ( expectedEntry.valMatch( actualEntry ) ) { updateGuildIds.splice( ndxGuild, 1 ) }
      }

      const botUserIds = Array.from( client.users.cache.keys() );
      if ( !Array.isArray( botUserIds ) ) { reject( { message: 'Unable to retrieve bot\'s mutual users.' } ); }
      const storedUsers = await userConfig.find();
      const storedUserIds = Array.from( storedUsers.keys() );
      if ( !Array.isArray( storedUserIds ) ) { reject( { message: 'Unable to retrieve userlist from database.' } ); }
      const allUserIds = [].concat( botUserIds, storedUserIds ).getDistinct().sort();
      const addedUserIds = botUserIds.getDiff( storedUserIds );
      const removedUserIds = storedUserIds.getDiff( botUserIds );
      const ioUserIds = [].concat( addedUserIds, removedUserIds ).sort();
      const updateUserIds = allUserIds.getDiff( ioUserIds ).getDistinct();
      for ( let userId of updateUserIds ) {
        let ndxUser = updateUserIds.indexOf( userId );
        let botUser = client.users.cache.get( userId );
        let actualEntry = storedUsers.filter( u => u._id === userId );
        let expectedEntry = {
          _id: botUser.id,
          Bot: botUser.bot,
          Guilds: actualEntry.Guilds,
          Guildless: actualEntry.Guildless,
          UserName: botUser.displayName,
          Score: actualEntry.Score,
          Version: verUserDB
        };
        if ( expectedEntry.valMatch( actualEntry ) ) { updateUserIds.splice( ndxUser, 1 ) }
      }

      resolve( {
        guilds: {
          db: storedGuilds,
          add: addedGuildIds,
          remove: removedGuildIds,
          update: updateGuildIds
        },
        users: {
          db: storedUsers,
          add: addedUserIds,
          remove: removedUserIds,
          update: updateUserIds
          }
      } );
    } )
    .then( async ( data ) => {
      console.log( 'data: %o', data );
    } )
    .catch( ( rejected ) => { console.error( rejected.message ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( 'ready.js' ), errObject.stack ); }
} );