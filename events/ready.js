const client = require( '..' );
const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const parse = require( '../functions/parser.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const getBotConfig = require( '../functions/getBotDB.js' );
const userConfig = require( '../models/BotUser.js' );
const verGuildDB = config.verGuildDB;
const verUserDB = config.verUserDB;

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
    const guildConfigs = await guildConfig.find();
    const guildConfigIds = [];
    guildConfigs.forEach( ( entry, i ) => { guildConfigIds.push( entry._id ); } );
    const guildIds = Array.from( client.guilds.cache.keys() );
    let updateGuildList = [];
    if ( guildIds.length > 0 ) { console.log( 'Checking %s guild%s...', chalk.blueBright( guildIds.length ), ( guildIds.length === 1 ? '' : 's' ) ); }
    await guildIds.forEach( async ( guildId ) => {// Update guilds I'm still in.
      let guild = await client.guilds.cache.get( guildId );
      let guildOwner = guild.members.cache.get( guild.ownerId );
      if ( guildConfigIds.indexOf( guildId ) != -1 ) { guildConfigIds.splice( guildConfigIds.indexOf( guildId ), 1 ) }
      let currGuildConfig = await getGuildConfig( guild );
      let newName = ( guild.name !== currGuildConfig.Guild.Name ? true : false );
      let newOwnerID = ( guild.ownerId !== currGuildConfig.Guild.OwnerID ? true : false );
      let newOwnerName = ( guildOwner.displayName !== currGuildConfig.Guild.OwnerName ? true : false );
      let newSize = ( guild.members.cache.size !== currGuildConfig.Guild.Members ? true : false );
      let newVersion = ( verGuildDB !== currGuildConfig.Version ? true : false );
      var newGuildConfig = null;
      var doGuildUpdate = false;
      if ( newName ) {// Update guild name
        currGuildConfig.Guild.Name = guild.name;
        doGuildUpdate = true;
      }
      if ( newOwnerID ) {// Update guild owner id
        currGuildConfig.Guild.OwnerID = guild.ownerId;
        doGuildUpdate = true;
      }
      if ( newOwnerName ) {// Update guild owner displayName
        currGuildConfig.Guild.OwnerName = guild.displayName;
        doGuildUpdate = true;
      }
      if ( newSize ) {// Update guild size
        currGuildConfig.Guild.Members = guild.members.cache.size;
        doGuildUpdate = true;
      }
      if ( newVersion ) {// Update everything
        const botConfig = await getBotConfig();
        const logClosing = ( defaultId ) => { return '\n' + ( defaultId == null ? '\nPlease run `/config logs` to have these logs go to a channel in the [' + guild.name + '](<https://discord.com/channels/' + guild.id + '>) server or deactivate them instead of to your DMs.' : '\n----' ); }
        let Blacklist = ( currGuildConfig.Blacklist || { Members: [], Roles: [] } );
        let Logs = ( currGuildConfig.Logs || { Active: true, Chat: null, Default: null, Error: null, strClosing: logClosing( null ) } );
        let Part = ( currGuildConfig.Part || { Active: false, Channel: null, Message: null, SaveRoles: false } );
        let Welcome = ( currGuildConfig.Welcome || { Active: false, Channel: null, Message: null, Role: null } );
        let Whitelist = ( currGuildConfig.Whitelist || { Members: [], Roles: [] } );
        newGuildConfig = {
          _id: guild.id,
          Bans: ( currGuildConfig.Bans || [] ),
          Blacklist: {
            Members: ( Blacklist.Members || [] ),
            Roles: ( Blacklist.Roles || [] )
          },
          Commands: ( currGuildConfig.Commands || [] ),
          Expires: ( currGuildConfig.Expires || null ),
          Guild: {
            Name: guild.name,
            Members: guild.members.cache.size,
            OwnerID: guild.ownerId,
            OwnerName: guildOwner.displayName
          },
          Invite: ( currGuildConfig.Invite || null ),
          Logs: {
            Active: ( Logs.Active || true ),
            Chat: ( Logs.Chat || null ),
            Default: ( Logs.Default || null ),
            Error: ( Logs.Error || null ),
            strClosing: ( Logs.strClosing || logClosing( null ) )
          },
          Part: {
            Active: ( Part.Active || false ),
            Channel: ( Part.Channel || null ),
            Message: ( Part.Message || null ),
            SaveRoles: ( Part.SaveRoles || false )
          },
          Prefix: ( currGuildConfig.Prefix || botConfig.Prefix ),
          Premium: ( currGuildConfig.Premium || true ),
          Version: verGuildDB,
          Welcome: {
            Active: ( Welcome.Active || false ),
            Channel: ( Welcome.Channel || null ),
            Message: ( Welcome.Message || null ),
            Role: ( Welcome.Role || null )
          },
          Whitelist: {
            Members: ( Whitelist.Members || [] ),
            Roles: ( Whitelist.Roles || [] )
          }
        };
        doGuildUpdate = true;
      }
      if ( doGuildUpdate ) {// Something changed offline
        updateGuildList.push( chalk.bold.cyan( guild.name) );
        await guildConfig.updateOne( { _id: guildId }, ( newGuildConfig || currGuildConfig ), { upsert: true } )
        .then( updateSuccess => { console.log( 'Succesfully updated guild id: %s (%s) in my database.', guildId, chalk.bold.green( guild.name ) ); } )
        .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( `Error attempting to update ${guild.name} (id: ${guildId}) to my database:\n${updateError}` ) ); } );
      }
    } );
    if ( updateGuildList.length === 0 ) { console.log( chalk.bold.greenBright( 'All guilds are current!' ) ); }
    else { console.log( 'Updating %i guild%s: %o', chalk.yellow( updateGuildList.length ), ( updateGuildList.length === 1 ? '' :  's' ), updateGuildList ); }
    if ( guildConfigIds.length !== 0 ) {// Update/Delete guilds I'm no longer in.
      console.log( 'Checking to see if guild data for %s guild%s has expired...', chalk.blueBright( guildConfigIds.length ), ( guildConfigIds.length === 1 ? '' : 's' ) );
      guildConfigIds.forEach( async ( guildId ) => {
        let delGuild = guildConfigs.find( entry => entry.id === guildId );
        let isExpired = ( !delGuild.Expires ? false : ( delGuild.Expires <= ( new Date() ) ? true : false ) );
        if ( isExpired ) {
          let guildOwner = ( client.users.cache.get( delGuild.Guild.OwnerID ) || null );
          let ownerName = ( guildOwner ? '<@' + guildOwner.id + '>' : '`' + delGuild.Guild.OwnerName + '`' );
          console.log( 'Deleting expired guild id: %s (%s)...', guildId, chalk.bold.red( delGuild.Guild.Name ) );
          await guildConfig.deleteOne( { _id: guildId } )
          .then( delExpired => {
            console.log( 'Succesfully deleted expired id: %s (%s) from my database.', guildId, chalk.bold.red( delGuild.Guild.Name ) );
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
        }
        else if ( !delGuild.Expires ) {
          delGuild.Expires = dbExpires;
          console.log( 'I was removed from %s while I was offline, so I have set guild to expire: %o', chalk.hex( '#FFA500' ).bold( delGuild.Guild.Name ), delGuild.Expires );
          await guildConfig.updateOne( { _id: guildId }, delGuild, { upsert: true } )
          .then( updateSuccess => { console.log( 'Succesfully updated guild id: %s (%s) in my database.', guildId, chalk.bold.green( delGuild.Guild.Name ) ); } )
          .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( `Error attempting to update ${delGuild.Guild.Name} (id: ${guildId}) to my database:\n${updateError}` ) ); } );
        }
        else { console.log( 'Guild %s expires: %o', chalk.hex( '#FFA500' ).bold( delGuild.Guild.Name ), delGuild.Expires ); }
      } );
    }

    const botUserIds = Array.from( client.users.cache.keys() );
    const storedUsers = await userConfig.find();
    const storedUserIds = [];
    storedUsers.forEach( ( entry, i ) => { storedUserIds.push( entry._id ); } );
    let addedUsers = await botUserIds.filter( a => !storedUserIds.includes( a ) );
    if ( addedUsers.length > 0 ) {
      console.log( 'Adding %s new user%s: %o', chalk.greenBright( addedUsers.length ), ( addedUsers.length === 1 ? '' : 's' ), addedUsers );
      addedUsers.forEach( ( userId ) => { botUserIds.push( userId ); } );
    }
    let removedUsers = await storedUserIds.filter( r => !botUserIds.includes( r ) );
    if ( removedUsers.length > 0 ) {
      console.log( 'Checking %s lost user%s: %o', chalk.redBright( removedUsers.length ), ( removedUsers.length === 1 ? '' : 's' ), removedUsers );
      removedUsers.forEach( async ( userId ) => { botUserIds.push( userId ); } );
    }
    let updateUserList = [].concat( addedUsers, removedUsers );
    if ( botUserIds.length > 0 ) { console.log( 'Checking %s user%s...', chalk.blueBright( botUserIds.length ), ( botUserIds.length === 1 ? '' : 's' ) ); }
    await botUserIds.forEach( async ( userId ) => {// Add new users and update all users in database.
      let user = client.users.cache.get( userId );
      if ( await userConfig.countDocuments( { _id: userId } ) === 0 ) {// Add user to DB if not there
        const newUser = {
          _id: userId,
          Guilds: [],
          Guildless: null,
          UserName: user.displayName,
          Score: 0,
          Version: verUserDB
        }
        await userConfig.create( newUser )
        .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add %s (id: %s) to my user database in guildCreate.js:\n%o' ), user.displayName, memberId, initError ); } );
      }
      let arrUserGuilds = ( Array.from( client.guilds.cache.filter( g => g.members.cache.has( userId ) ).keys() ).toSorted() || [] );
      let currUser = await userConfig.findOne( { _id: userId } );
      let userGuilds = [];
      currUser.Guilds.forEach( ( entry, i ) => { userGuilds.push( entry._id ); } );
      userGuilds.sort();
      let newName = ( user.displayName !== currUser.UserName ? true : false );
      let newGuilds = ( arrUserGuilds != userGuilds ? true : false );
      let newVersion = ( verUserDB !== currUser.Version ? true : false );
      var newUserConfig = null;
      var doUserUpdate = false;
      if ( newName ) {// Update user displayName
        currUser.UserName = user.displayName;
        doUserUpdate = true;
      }
      if ( newGuilds ) {// Update guilds
        let addedGuilds = arrUserGuilds.filter( a => !userGuilds.includes( a ) );
        if ( addedGuilds.length > 0 ) {// Added guild(s)
          await addedGuilds.forEach( async ( guildId ) => {
            let guild = await client.guilds.cache.get( guildId );
            let member = guild.members.cache.get( userId );
            const addGuild = {
              _id: guildId,
              Bans: [],
              Expires: null,
              GuildName: guild.name,
              MemberName: member.displayName,
              Roles: Array.from( member.roles.cache.keys() ),
              Score: 0
            };
            currUser.Guilds.push( addGuild );
            currUser.Guildless = null;
          } );
          doUserUpdate = true;
        }
        let removedGuilds = userGuilds.filter( r => !arrUserGuilds.includes( r ) );
        if ( removedGuilds.length > 0 ) {// Removed guild(s)
          let toExpire = 0;
          let hasExpired = 0;
          let userGuilds = [];
          currUser.Guilds.forEach( ( entry, i ) => { userGuilds.push( entry._id ); } );
          removedGuilds.forEach( async ( guildId, i ) => {
            let currUserGuild = currUser.Guilds[ i ];
            if ( Object.prototype.toString.call( currUserGuild.Expires ) != '[object Date]' ) { currUserGuild.Expires = dbExpires; toExpire++; }
            else if ( currUserGuild.Expires <= ( new Date() ) ) { currUser.Guilds.splice( i, 1 ); hasExpired++; }
            if ( currUser.Guilds.length === 0 ) { currUser.Guildless = dbExpires; }
            doUserUpdate = true;
          } );
          toExpire = ( toExpire === 0 ? null : ' updated ' + chalk.bold.red( toExpire ) + ' guild' + ( toExpire === 1 ? '' : 's' ) + ' to expire in a month' );
          hasExpired = ( hasExpired === 0 ? null : ' removed ' + chalk.bold.red( hasExpired ) + ' guild' + ( hasExpired === 1 ? '' : 's' ) + ' from the user' );
          showExpiring = ( hasExpired || toExpire ? ' and I\'ve' + ( !hasExpired ? '' : hasExpired + ( !toExpire ? '' : ' and' ) ) + ( !toExpire ? '' : toExpire ) : '' );
          console.log( 'User %s (%s) no longer shares any guild with me%s.', userId, chalk.redBright( currUser.UserName ), showExpiring );
        }
      }
      if ( newVersion ) {// Update everything
        let Guilds = null;
        newUserConfig = {
          _id: user.id,
          Bot: ( user.bot ? true : false ),
          Guilds: ( currUser.Guilds || [] ),
          UserName: ( currUser.UserName || user.displayName ),
          Score: ( currUser.Score || 0 ),
          Version: verUserDB
        };
        doUserUpdate = true;
      }
      if ( doUserUpdate ) {
        updateUserList.push( chalk.bold.cyan( user.displayName ) );
        await userConfig.updateOne( { _id: userId }, ( newUserConfig || currUser ), { upsert: true } )
        .then( updateSuccess => { console.log( 'Succesfully updated user id: %s (%s) in my database.', userId, chalk.bold.green( user.displayName ) ); } )
        .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( `Error attempting to update user ${user.displayName} (id: ${userId}) in my database:\n${updateError}` ) ); } );
      }
    } );
    if ( updateUserList.length === 0 ) { console.log( chalk.bold.greenBright( 'All users are current!' ) ); }
    else { console.log( 'Updating %s user%s: %o', chalk.yellow( updateUserList.length ), ( updateUserList.length === 1 ? '' : 's' ), updateUserList ); }

  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.hex( '#FFA500' ).bold( 'ready.js' ), errObject.stack ); }
} );