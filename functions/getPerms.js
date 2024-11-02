const client = require( '..' );
require( 'dotenv' ).config();
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const getBotConfig = require( './getBotDB.js' );
const getGuildConfig = require( './getGuildDB.js' );
const userConfig = require( '../models/BotUser.js' );
const verUserDB = config.verUserDB;

module.exports = async ( user, guild, doBlacklist = true, debug = false ) => {
  try {
    if ( debug ) {
      const preUser = ( user ? '{ id: ' + user.id + ', displayName: ' + user.displayName + ' }' : user );
      const preGuild = ( guild ? '{ id: ' + guild.id + ', name: ' + guild.name + ' }' : guild );
      const preProcessed = { user: preUser, guild: preGuild, doBlacklist: doBlacklist };
      console.log( 'getPerms received inputs:%o', preProcessed );
    }
    if ( !user ) { throw new Error( 'No user to get permissions for.' ); }
    if ( !guild ) { throw new Error( 'No guild to get user permissions for.' ); }

    const member = guild.members.cache.get( user.id );
    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) {// Create new user in DB if not there.
      const newUser = {
        _id: user.id,
        Guilds: [],
        Guildless: null,
        UserName: user.displayName,
        Score: 0,
        Version: verUserDB
      }
      await userConfig.create( newUser )
      .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add %s (id: %s) to my user database in getPerms.js:\n%o' ), user.displayName, user.id, initError ); } );
    }
    const currUser = await userConfig.findOne( { _id: user.id } );
    const userGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { userGuilds.push( entry._id ); } );
    if ( userGuilds.indexOf( guild.id ) === -1 ) {
      const addGuild = {
        _id: guild.id,
        Bans: [],
        Expires: null,
        GuildName: guild.name,
        MemberName: member.displayName,
        Roles: Array.from( member.roles.cache.keys() ),
        Score: 0
      };
      currUser.Guilds.push( addGuild );
      currUser.Guildless = null;
      userConfig.updateOne( { _id: user.id }, currUser, { upsert: true } )
      .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add guild %s (id: %s) to user %s (id: %s) in my database in getPerms.js:\n%o' ), guild.name, guild.id, user.displayName, user.id, updateError ); } );
    }

    const botConfig = await getBotConfig();
    const clientID = ( botConfig.ClientID || config.clientId || client.id );
    const botUsers = client.users.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const isBotOwner = ( user.id === botOwner.id ? true : false );
    const globalBlacklist = ( botConfig.Blacklist || [] );
    const isGlobalBlacklisted = ( globalBlacklist.indexOf( user.id ) != -1 ? true : false );
    const globalWhitelist = ( botConfig.Whitelist || [] );
    const isGlobalWhitelisted = ( globalWhitelist.indexOf( user.id ) != -1 ? true : false );
    const botMods = ( botConfig.Mods || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( user.id ) != -1 ) ? true : false );
    const globalPrefix = ( botConfig.Prefix || config.prefix || '!' );

    const guildConfig = await getGuildConfig( guild );
    const isDevGuild = ( guild.id === botConfig.DevGuild ? true : false );
    const objGuildMembers = guild.members.cache;
    const guildOwner = objGuildMembers.get( guild.ownerId );
    const isGuildOwner = ( user.id === guildOwner.id ? true : false );
    const guildAllowsPremium = guildConfig.Premium;
    const roleServerBooster = ( guild.roles.premiumSubscriberRole || null );
    const isServerBooster = ( !roleServerBooster ? false : ( roleServerBooster.members.get( user.id ) ? true : false ) );
    const arrAuthorPermissions = ( objGuildMembers.get( user.id ).permissions.toArray() || [] );

    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const checkPermission = ( permission ) => { return ( ( hasAdministrator || arrAuthorPermissions.indexOf( permission ) !== -1 ) ? true : false ); };

    const guildBlacklist = ( guildConfig.Blacklist ? ( guildConfig.Blacklist.Roles || [] ) : [] );
    const arrBlackMembers = ( guildConfig.Blacklist ? ( guildConfig.Blacklist.Members || [] ) : [] );
    var arrBlackGuild = [];
    if ( guildBlacklist.length > 0 ) {
      for ( const role of guildBlacklist ) {
        let roleMembers = Array.from( await guild.roles.cache.get( role ).members.keys() );
        arrBlackGuild = arrBlackGuild.concat( roleMembers );
      }
    }
    if ( arrBlackMembers.length > 0 ) { arrBlackGuild = arrBlackGuild.concat( arrBlackMembers ); }
    const isGuildBlacklisted = ( arrBlackGuild.indexOf( user.id ) != -1 ? true : false );

    const guildWhitelist = ( guildConfig.Whitelist ? ( guildConfig.Whitelist.Roles || [] ) : [] );
    const arrWhiteMembers = ( guildConfig.Whitelist ? ( guildConfig.Whitelist.Members || [] ) : [] );
    var arrWhiteGuild = [];
    if ( guildWhitelist.length > 0 ) {
      for ( const role of guildWhitelist ) {
        let roleMembers = Array.from( await guild.roles.cache.get( role ).members.keys() );
        arrWhiteGuild = arrWhiteGuild.concat( roleMembers );
      }
    }
    if ( arrWhiteMembers.length > 0 ) { arrWhiteGuild = arrWhiteGuild.concat( arrWhiteMembers ); }
    const isGuildWhitelisted = ( arrWhiteGuild.indexOf( user.id ) != -1 ? true : false );

    const guildPrefix = ( guildConfig.Prefix || globalPrefix );
    const prefix = ( guildPrefix || globalPrefix || client.prefix );
    const isBlacklisted = ( isGlobalBlacklisted || ( isGuildBlacklisted && !( isBotMod || isGlobalWhitelisted ) ) );
    const isWhitelisted = ( isGlobalWhitelisted || ( isGuildWhitelisted && !isGlobalBlacklisted ) );

    const results = {
      clientId: clientID,
      globalPrefix: globalPrefix,
      guildPrefix: guildPrefix,
      prefix: prefix,
      botOwner: botOwner,
      guildOwner: guildOwner,
      isDevGuild: isDevGuild,
      isBotOwner: isBotOwner,
      isBotMod: isBotMod,
      isGuildOwner: isGuildOwner,
      hasAdministrator: hasAdministrator,
      checkPermission: checkPermission,
      guildAllowsPremium: guildAllowsPremium,
      roleServerBooster: roleServerBooster,
      isServerBooster: isServerBooster,
      isGuildBlacklisted: isGuildBlacklisted,
      isGlobalBlacklisted: isGlobalBlacklisted,
      isBlacklisted: isBlacklisted,
      isGuildWhitelisted: isGuildWhitelisted,
      isGlobalWhitelisted: isGlobalWhitelisted,
      isWhitelisted: isWhitelisted,
      content: false
    }

    if ( debug ) {
      let resultKeys = Object.keys( results );
      let debugResults = {};
      for ( const key of resultKeys ) {
        if ( typeof( results[ key ] ) != 'object' ) { debugResults[ key ] = results[ key ]; }
        else {
          let resultObj = results[ key ];
          let objType = ( resultObj ? 'object-' + resultObj.constructor.name : typeof( results[ key ] ) );
          let objId = ( resultObj ? resultObj.id : 'no.id' );
          let objName = ( resultObj ? ( resultObj.displayName || resultObj.globalName || resultObj.name ) : 'no.name' );
          debugResults[ key ] = '{ ' + objType + ': { id: ' + objId + ', name: ' + objName + ' } }';
        }
      }
      console.log( 'getPerms is returning: %o', debugResults );
    }

    if ( doBlacklist && isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      results.content = 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server!' : '!' ) + '  Please contact <@' + contact + '> to resolve the situation.';
    }
    else if ( doBlacklist && isBotMod && isGuildBlacklisted ) {
      user.send( { content: 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '! Use `/config remove` to remove yourself from the blacklist.' } );
    }

    return results;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'getPerms.js' ), errObject.stack ); }
};