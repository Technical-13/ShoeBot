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
      const botUserIds = Array.from( botUsers.keys() );
      if ( !Array.isArray( botUserIds ) ) { reject( { message: 'Unable to retrieve bot\'s mutual users.' } ); }
      const storedUsers = await userConfig.find();
      const storedUserIds = Array.from( storedUsers.map( val => val._id ) );
      if ( !Array.isArray( storedUserIds ) ) { reject( { message: 'Unable to retrieve userlist from database.' } ); }
      const allUserIds = [].concat( botUserIds, storedUserIds ).getDistinct().sort();
      let addedUserIds = botUserIds.getDiff( storedUserIds );
      let removedUserIds = storedUserIds.getDiff( botUserIds );
      let ioUserIds = [].concat( addedUserIds, removedUserIds ).sort();
      let updateUserIds = allUserIds.getDiff( ioUserIds ).getDistinct();
      let unchangedUserIds = [];
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
      let cleanedUserIds = [];
      if ( removedUserIds.length != 0 ) {
        for ( let userId of removedUserIds ) {
          let storedUser = storedUsers.filter( g => g._id === userId )[ 0 ];
          let userGuilds = storedUser.Guilds;
          let userGuildIds = Array.from( userGuilds.map( val => val._id ) );
          for ( let userGuild of userGuilds ) {
            if ( Object.prototype.toString.call( userGuild.Expires ) != '[object Date]' ) {// If no .Expires Date, add one
              if ( botVerbosity >= 4 ) { console.log( 'U:%s G:%s Expires: %s', chalk.bold.redBright( storedUser.UserName ), chalk.bold.redBright( userGuild.GuildName ), dbExpires ); }
              userGuild.Expires = dbExpires;
              updateUserIds.push( userId );
            }
            else if ( userGuild.Expires <= ( new Date() ) ) {// If past .Expires Date, remove the guild from the Guilds array
              if ( botVerbosity >= 4 ) { console.log( 'U:%s G:%s removed.', chalk.bold.redBright( storedUser.UserName ), chalk.bold.redBright( userGuild.GuildName ) ); }
              userGuilds.splice( userGuildIds.indexOf( guildId ), 1 );
              updateUserIds.push( userId );
            }
          }
          if ( userGuilds.length === 0 ) {// If the user has no more guilds, add Guildless Date
            if ( botVerbosity >= 4 ) { console.log( 'U:%s Guildless: %s', chalk.bold.redBright( storedUser.UserName ), dbExpires ); }
            storedUser.Guildless = dbExpires;
            updateUserIds.push( userId );
          }
          if ( updateUserIds.indexOf( userId ) === -1 ) { unchangedUserIds.push( userId ) }
          cleanedUserIds.push( userId );
        }
        removedUserIds = removedUserIds.getDiff( cleanedUserIds );
      }

      const botGuildIds = Array.from( botGuilds.keys() );
      if ( !Array.isArray( botGuildIds ) ) { reject( { message: 'Unable to retrieve guilds bot is in.' } ); }
      const storedGuilds = await guildConfig.find();
      const storedGuildIds = Array.from( storedGuilds.map( val => val._id ) );
      if ( !Array.isArray( storedGuildIds ) ) { reject( { message: 'Unable to retrieve bot\'s guilds from database.' } ); }
      const allGuildIds = [].concat( botGuildIds, storedGuildIds ).getDistinct().sort();
      let addedGuildIds = botGuildIds.getDiff( storedGuildIds );
      let removedGuildIds = storedGuildIds.getDiff( botGuildIds );
      let ioGuildIds = [].concat( addedGuildIds, removedGuildIds ).sort();
      let updateGuildIds = allGuildIds.getDiff( ioGuildIds ).getDistinct();
      let unchangedGuildIds = [];
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
          let storedGuild = storedGuilds.filter( g => g._id === guildId )[ 0 ];
          let isExpired = ( !storedGuild.Expires ? false : ( storedGuild.Expires <= ( new Date() ) ? true : false ) );
          if ( !isExpired && !storedGuild.Expires ) {// add Expires Date, push id to update, take id out of removedGuildIds
            if ( botVerbosity >= 4 ) { console.log( 'G:%s now Expires: %s', chalk.bold.redBright( storedGuild.Name ), dbExpires ); }
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

      if ( botVerbosity >= 4 ) { console.log( 'botUserIds: %o', botUserIds ); }
      if ( botVerbosity >= 4 ) { console.log( 'storedUserIds: %o', storedUserIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'addedUserIds: %o', addedUserIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'removedUserIds: %o', removedUserIds ); }//Should always be empty by this point -- until I add purging function
      if ( botVerbosity >= 4 ) { console.log( 'unchangedUserIds: %o', unchangedUserIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'updateUserIds: %o', updateUserIds ); }
      if ( botVerbosity >= 4 ) { console.log( 'botGuildIds: %o', botGuildIds ); }
      if ( botVerbosity >= 4 ) { console.log( 'storedGuildIds: %o', storedGuildIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'addedGuildIds: %o', addedGuildIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'removedGuildIds: %o', removedGuildIds ); }
      if ( botVerbosity >= 4 ) { console.log( 'unchangedGuildIds: %o', unchangedGuildIds ); }
      if ( botVerbosity >= 3 ) { console.log( 'updateGuildIds: %o', updateGuildIds ); }

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
    .then( async ( data ) => {// update users that changed while offline
      let { users } = data;
      let { db, update } = users;
      if ( update.length != 0 ) {
        for ( let userId of update ) {
          let updatedUsers = [];
          let updatedUser = db.filter( g => g._id === userId )[ 0 ];
          await userConfig.updateOne( { _id:  userId }, updatedUser, { upsert: true } )
          .then( updateSuccess => {
            console.log( 'Succesfully updated U:%s in my database.', chalk.bold.green( updatedUser.UserName ) );
            updatedUsers.push( userId );
          } )
          .catch( updateError => { throw new Error( chalk.bold.black.bgCyan( `Error attempting to update user ${updatedUser.UserName} in my database:\n${updateError}` ) ); } );
        }
        users.update = update.length;
        users.updated = updatedUsers.length;
      }

      return data;
    } )
    .then( async ( data ) => {// add users missing from db
      let { users } = data;
      let { db, add } = users;
      if ( add.length != 0 ) {
        let addedUsers = [];
        if ( botVerbosity >= 1 ) { console.log( 'Adding %s users to my database...', chalk.bold.green( add.length ) ); }
        for ( let userId of add ) {// createNewUser
          let addUser = await botUsers.get( userId );
          if ( botVerbosity >= 1 ) { console.log( '\tAdding U:%s to my database...', chalk.bold.green( addUser.displayName ) ); }
          let newUser = await createNewUser( addUser );
          let addUserGuilds = ( Array.from( botGuilds.filter( g => g.members.cache.has( userId ) ).keys() ).toSorted() || [] );
          for ( let guildId of addUserGuilds ) {// addUserGuild
            let guild = await botGuilds.get( guildId );
            if ( botVerbosity >= 1 ) { console.log( '\t\tAdding G:%s to U:%s...', chalk.bold.green( guild.name ), chalk.bold.green( addUser.displayName ) ); }
            newUser = await addUserGuild( userId, guild );
          }
          db.push( newUser );
          addedUsers.push( userId );
        }
        users.add = add.length;
        users.added = addedUsers.length;
      }

      return data;
    } )
    .then( async ( data ) => {// update guilds that changed while offline
      let { guilds } = data;
      let { db, update } = guilds;
      if ( update.length != 0 ) {
        for ( let guildId of update ) {
          let updatedGuilds = [];
          let updatedGuild = db.filter( g => g._id === guildId )[ 0 ];
          await userConfig.updateOne( { _id:  guildId }, updatedGuild, { upsert: true } )
          .then( updateSuccess => {
            console.log( 'Succesfully updated G:%s in my database.', chalk.bold.green( updatedGuild.Name ) );
            updatedGuilds.push( guildId );
          } )
          .catch( updateError => { throw new Error( chalk.bold.black.bgCyan( `Error attempting to update guild ${updatedGuild.Name} in my database:\n${updateError}` ) ); } );
        }
        guilds.update = update.length;
        guilds.updated = updatedGuilds.length;
      }

      return data;
    } )
    .then( async ( data ) => {// add guilds missing from db
      let { guilds } = data;
      let { db, add } = guilds;
      if ( add.length != 0 ) {
        let addedGuilds = [];
        if ( botVerbosity >= 1 ) { console.log( 'Adding %s guilds to my database...', chalk.bold.green( add.length ) ); }
        for ( let guildId of add ) {// createNewGuild
          let addGuild = await botGuilds.get( guildId );
          if ( botVerbosity >= 1 ) { console.log( '\tAdding G:%s to my database...', chalk.bold.green( addGuild.name ) ); }
          let newGuild = await createNewGuild( addGuild );
          db.push( newGuild );
          addedGuilds.push( guildId );
        }
        guilds.add = add.length;
        guilds.added = addedGuilds.length;
      }

      return data;
    } )
    .then( async ( data ) => {// remove guilds from db that have expired
      let { guilds } = data;
      let { db, remove } = guilds;
      if ( remove.length != 0 ) {
        let removedGuilds = [];
        for ( let guildId of remove ) {
          let delGuild = db.find( entry => entry.id === guildId );
          let guildName = delGuild.Guild.Name;
          let guildLink = '[' + guildName + '](<https://discord.com/channels/' + guildId + '>)';
          let guildOwner = ( botUsers.get( delGuild.Guild.OwnerID ) || null );
          let ownerName = ( guildOwner ? '<@' + guildOwner.id + '>' : '`' + delGuild.Guild.OwnerName + '`' );
          await guildConfig.deleteOne( { _id: guildId } )
          .then( delExpired => {
            if ( botVerbosity >= 1 ) { console.log( 'Succesfully removed expired G:%s from my database.', chalk.bold.red( guildName ) ); }
            if ( guildOwner ) {
              guildOwner.send( { content: 'Hello! It has been a month since someone has removed me from ' + guildLink + ', and I\'ve cleaned out your configuration settings!\n\nYou can still get me back in your server at any time by [re-adding](<' + inviteUrl + '>) me.' } )
              .catch( errSendDM => {
                console.error( 'errSendDM: %s', errSendDM.stack );
                botOwner.send( { content: 'Failed to DM ' + ownerName + ' to notify them that I cleaned the guild, ' + guildLink + ', from my database.' } );
              } );
            }
            else {
              botOwner.send( { content: 'Unable to find ' + ownerName + ' to notify them that I cleaned the guild, ' + guildLink + ', from my database.' } );
            }
            removedGuilds.push( guildId );
          } )
          .catch( errDelete => { throw new Error( chalk.bold.black.bgCyan( `Error attempting to delete ${guildName} (id: ${guildId}) from my database:\n${errDelete.stack}` ) ); } );
        }
        guilds.remove = remove.length;
        guilds.removed = removedGuilds.length;
      }

      return data;
    } )
    .then( ( data ) => {
      let { guilds, users } = data;
      console.log( 'Updated users: %s/%s', users.updated, users.update );
      console.log( 'Added users: %s/%s', users.added, users.add );
      console.log( 'Updated guilds: %s/%s', guilds.updated, guilds.update );
      console.log( 'Added guilds: %s/%s', guilds.added, guilds.add );
      console.log( 'Removed guilds: %s/%s', guilds.remove, guilds.remove );
    } )
    .catch( ( rejected ) => { console.error( rejected.message ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( 'ready.js' ), errObject.stack ); }
} );