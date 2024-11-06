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
const botVerbosity = ( config.verbosity || 1 );
const verGuildDB = config.verGuildDB;
const verUserDB = config.verUserDB;
Array.prototype.getDiff = function( arrOld ) { return this.filter( o => !arrOld.includes( o ) ) };
Array.prototype.getDistinct = function() { return this.filter( ( val, i, arr ) => i == arr.indexOf( val ) ) }
Object.prototype.valMatch = function( that ) { return this == that }

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
    if ( botVerbosity >= 1 ) { console.log( chalk.bold( `The bot owner's local time is ${botTime}.` ) ); }
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
    if ( botVerbosity >= 1 ) { console.log( chalk.bold.magentaBright( `Successfully logged in as: ${client.user.tag}` ) ); }

    const dbExpires = new Date( ( new Date() ).setMonth( ( new Date() ).getMonth() + 1 ) );
    const botGuilds = client.guilds.cache;
    const botUsers = client.users.cache
    new Promise( async ( resolve, reject ) => {
      const botGuildIds = Array.from( botGuilds.keys() );
      if ( !Array.isArray( botGuildIds ) ) { reject( { message: 'Unable to retrieve guilds bot is in.' } ); }
      const storedGuilds = await guildConfig.find();
      const storedGuildIds = Array.from( storedGuilds.map( val => val._id ) );
      if ( !Array.isArray( storedGuildIds ) ) { reject( { message: 'Unable to retrieve bot\'s guilds from database.' } ); }
      const allGuildIds = [].concat( botGuildIds, storedGuildIds ).getDistinct().sort();
      const addedGuildIds = botGuildIds.getDiff( storedGuildIds );
      const removedGuildIds = storedGuildIds.getDiff( botGuildIds );
      const ioGuildIds = [].concat( addedGuildIds, removedGuildIds ).sort();
      let updateGuildIds = allGuildIds.getDiff( ioGuildIds ).getDistinct();
      const unchangedGuildIds = [];
      for ( let guildId of updateGuildIds ) {
        let ndxGuild = updateGuildIds.indexOf( guildId );
        let botGuild = client.guilds.cache.get( guildId );
        let guildOwner = botGuild.members.cache.get( botGuild.ownerId );
        let actualEntry = storedGuilds.filter( g => g._id === guildId );
        let expectedEntry = actualEntry;
        expectedEntry._id = botGuild.id;
        expectedEntry.Guild = {
          Name: botGuild.name,
          Members: botGuild.members.cache.size,
          OwnerID: botGuild.ownerId,
          OwnerName: guildOwner.displayName
        };
        expectedEntry.Version = verGuildDB;
        actualEntry = JSON.stringify( actualEntry );
        expectedEntry = JSON.stringify( expectedEntry );
        if ( expectedEntry.valMatch( actualEntry ) ) {// push to unchangedGuildIds
          if ( botVerbosity >= 4 ) { console.log( 'G:%s: %s %s %s', chalk.bold.greenBright( botGuild.name ), actualEntry, chalk.bold.greenBright( '===' ), expectedEntry ); }
          unchangedGuildIds.push( guildId );
        }
        else if ( botVerbosity >= 4 ) { console.log( 'G:%s: %s %s %s', chalk.bold.red( botGuild.name ), actualEntry, chalk.bold.red( '!=' ), expectedEntry ); }
      }
      updateGuildIds = updateGuildIds.getDiff( unchangedGuildIds );
      if ( removedGuildIds.length != 0 ) {
        for ( let guildId of removedGuildIds ) {
          let storedGuild = storedGuilds.filter( g => g._id === guildId );
          let isExpired = ( !storedGuild.Expires ? false : ( storedGuild.Expires <= ( new Date() ) ? true : false ) );
          if ( !isExpired && !storedGuild.Expires ) {// add Expires Date, push id to update, take id out of removedGuildIds
            if ( botVerbosity >= 4 ) { console.log( 'G:%s now Expires: %s', chalk.bold.greenBright( botGuild.name ), dbExpires ); }
            storedGuild.Expires = dbExpires;
            updateGuildIds.push( guildId );
            removedGuildIds.splice( removedGuildIds.indexOf( guildId ), 1 );
          }
          else if ( !isExpired ) {// unchanged++ and take id out of removedGuildIds
            unchangedGuildIds.push( guildId );
            removedGuildIds.splice( removedGuildIds.indexOf( guildId ), 1 );
          }
        }
      }
      if ( botVerbosity >= 4 ) { console.log( 'botGuildIds: %o', botGuildIds ); }
      if ( botVerbosity >= 4 ) { console.log( 'storedGuildIds: %o', storedGuildIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'addedGuildIds: %o', addedGuildIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'removedGuildIds: %o', removedGuildIds ); }
      if ( botVerbosity >= 4 ) { console.log( 'unchangedGuildIds: %o', unchangedGuildIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'updateGuildIds: %o', updateGuildIds ); }

      const botUserIds = Array.from( botUsers.keys() );
      if ( !Array.isArray( botUserIds ) ) { reject( { message: 'Unable to retrieve bot\'s mutual users.' } ); }
      const storedUsers = await userConfig.find();
      const storedUserIds = Array.from( storedUsers.map( val => val._id ) );
      if ( !Array.isArray( storedUserIds ) ) { reject( { message: 'Unable to retrieve userlist from database.' } ); }
      const allUserIds = [].concat( botUserIds, storedUserIds ).getDistinct().sort();
      const addedUserIds = botUserIds.getDiff( storedUserIds );
      const removedUserIds = storedUserIds.getDiff( botUserIds );/* TRON */console.log( 'removedUserIds: %s', removedUserIds );/* TROFF */
      const ioUserIds = [].concat( addedUserIds, removedUserIds ).sort();
      let updateUserIds = allUserIds.getDiff( ioUserIds ).getDistinct();
      const unchangedUserIds = [];
      for ( let userId of updateUserIds ) {
        let ndxUser = updateUserIds.indexOf( userId );
        let botUser = client.users.cache.get( userId );
        let actualEntry = storedUsers.filter( u => u._id === userId );
        let expectedEntry = actualEntry;
        expectedEntry._id = botUser.id;
        expectedEntry.Bot = botUser.bot;
        expectedEntry.UserName = botUser.displayName;
        expectedEntry.Version = verUserDB;
        actualEntry = JSON.stringify( actualEntry );
        expectedEntry = JSON.stringify( expectedEntry );
        if ( expectedEntry.valMatch( actualEntry ) ) {
          if ( botVerbosity >= 4 ) { console.log( 'U:%s: %s %s %s', chalk.bold.greenBright( botUser.displayName ), actualEntry, chalk.bold.greenBright( '===' ), expectedEntry ); }
          unchangedUserIds.push( userId );
        }
        else if ( botVerbosity >= 4 ) { console.log( 'U:%s: %s %s %s', chalk.bold.red( botUser.displayName ), actualEntry, chalk.bold.red( '!=' ), expectedEntry ); }
      }
      updateUserIds = updateUserIds.getDiff( unchangedUserIds );
      if ( removedUserIds.length != 0 ) {
        for ( let userId of removedUserIds ) {
          let storedUser = storedUsers.filter( g => g._id === userId );/* TRON */console.log( 'storedUser: %o', storedUser );/* TROFF */
          let userGuilds = storedUser.Guilds;/* TRON */console.log( 'userGuilds: %o', userGuilds );/* TROFF */
          let userGuildIds = Array.from( userGuilds.map( val => val._id ) );/* TRON */console.log( 'userGuildIds: %o', userGuildIds );/* TROFF */
          for ( let userGuild of userGuilds ) {
            if ( Object.prototype.toString.call( userGuild.Expires ) != '[object Date]' ) {// If no .Expires Date, add one
              userGuild.Expires = dbExpires;
              updateUserIds.push( userId );
            }
            else if ( userGuild.Expires <= ( new Date() ) ) {// If past .Expires Date, remove the guild from the Guilds array
              userGuilds.splice( userGuildIds.indexOf( guildId ), 1 );
              updateUserIds.push( userId );
            }
          }
          if ( userGuilds.length === 0 ) {// If the user has no more guilds, add Guildless Date
            storedUser.Guildless = dbExpires;
            updateUserIds.push( userId );
          }
          removedUserIds.splice( removedUserIds.indexOf( userId ), 1 );
        }
      }
      if ( botVerbosity >= 4 ) { console.log( 'botUserIds: %o', botUserIds ); }
      if ( botVerbosity >= 4 ) { console.log( 'storedUserIds: %o', storedUserIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'addedUserIds: %o', addedUserIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'removedUserIds: %o', removedUserIds ); }//Should always be empty by this point -- until I add purging function
      if ( botVerbosity >= 4 ) { console.log( 'unchangedUserIds: %o', unchangedUserIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'updateUserIds: %o', updateUserIds ); }

      resolve( {
        guilds: {
          db: storedGuilds,
          add: addedGuildIds,
          remove: removedGuildIds,
          update: updateGuildIds,
          unchanged: unchangedGuildIds.length
        },
        users: {
          db: storedUsers,
          add: addedUserIds,
          remove: removedUserIds,
          update: updateUserIds,
          unchanged: unchangedUserIds.length
          }
      } );
    } )
    .then( async ( data ) => {
      let { guilds } = data;
      let { db, add, remove, update, unchanged } = guilds;
      if ( add.length != 0 ) {
        if ( botVerbosity >= 1 ) { console.log( 'Adding %s guilds to my database...', add.length ); }
        for ( let guildId of add ) {// createNewGuild
          if ( botVerbosity >= 1 ) { console.log( '\tAdding guild %s to my database...', add.length ); }
          await createNewGuild( await botGuilds.get( guildId ) );
        }
      }
      return data;
    } )
    /*.then( async ( data ) => {
      let { users } = data;
      let { db, add, remove, update, unchanged } = users;
      if ( add.length != 0 ) {
        if ( botVerbosity >= 1 ) { console.log( 'Adding %s users to my database...', add.length ); }
        for ( let userId of add ) {// createNewUser
          if ( botVerbosity >= 1 ) { console.log( '\tAdding user %s to my database...', add.length ); }
          await createNewUser( await botUsers.get( userId ) );
        }
      }
      return data;
    } )//*/
    .then( ( data ) => { console.log( 'Done...' ); } ).catch( ( rejected ) => { console.error( rejected.message ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( 'ready.js' ), errObject.stack ); }
} );