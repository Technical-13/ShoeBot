const client = require( '..' );
const thisBotName = process.env.BOT_USERNAME;
const { model, Schema } = require( 'mongoose' );
const botConfigDB = require( '../models/BotConfig.js' );
const guildConfigDB = require( '../models/GuildConfig.js' );
const errHandler = require( './errorHandler.js' );

module.exports = async ( user, guild ) => {  
  try {
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
    .catch( async errFindBot => { await errorHandler( errFindBot, { command: 'getPerms', type: 'getBotDB' } ); } );
    const clientID = ( botConfig.ClientID || client.id );
    const isDevGuild = ( guild.id === botConfig.DevGuild ? true : false );
    const botUsers = client.users.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const isBotOwner = ( user.id === botOwner.id ? true : false );
    const globalBlacklist = ( botConfig.Blacklist || [] );
    const isGlobalBlacklisted = ( globalBlacklist.indexOf( user.id ) != -1 ? true : false );
    const globalWhitelist = ( botConfig.Whitelist || [] );
    const isGlobalWhitelisted = ( globalWhitelist.indexOf( user.id ) != -1 ? true : false );
    const botMods = ( botConfig.Mods || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( user.id ) != -1 ) ? true : false );

    const guildConfig = await guildConfigDB.findOne( { Guild: guild.id } )
    .catch( async errFindGuild => { await errorHandler( errFindGuild, { author: user, command: 'getPerms', guild: guild, type: 'getGuildDB' } ); } );
    const guildBlacklist = ( guildConfig ? ( guildConfig.Blacklist || [] ) : [] );
    const isGuildBlacklisted = ( guildBlacklist.indexOf( user.id ) != -1 ? true : false );
    const guildWhitelist = ( guildConfig ? ( guildConfig.Whitelist || [] ) : [] );
    const isGuildWhitelisted = ( guildWhitelist.indexOf( user.id ) != -1 ? true : false );

    const objGuildMembers = guild.members.cache;
    const guildOwner = objGuildMembers.get( guild.ownerId );
    const isGuildOwner = ( user.id === guildOwner.id ? true : false );
    const arrAuthorPermissions = ( objGuildMembers.get( user.id ).permissions.toArray() || [] );
    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const hasManageGuild = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageGuild' ) !== -1 ) ? true : false );
    const hasManageRoles = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageRoles' ) !== -1 ) ? true : false );
    const isServerBooster = ( guild.roles.premiumSubscriberRole.members.get( user.id ) ? true : false );
    const hasMentionEveryone = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'MentionEveryone' ) !== -1 ) ? true : false );

    const globalPrefix = botConfig.Prefix;
    const guildPrefix = ( guildConfig ? guildConfig.Prefix : globalPrefix ) ;
    const prefix = ( guildPrefix || globalPrefix || client.prefix );

    return {
      clientId: clientID,
      globalPrefix: globalPrefix,
      guildPrefix: guildPrefix,
      prefix: prefix,
      botOwner: botOwner,
      guildOwner: guildOwner,
      isDevGuild: isDevGuild,
      isBotOwner: isBotOwner,
      isBotMod: isBotMod,
      isBlacklisted: ( isGlobalBlacklisted || ( isGuildBlacklisted && !( isBotMod || isGlobalWhitelisted ) ) ),
      isGlobalBlacklisted: isGlobalBlacklisted,
      isGuildBlacklisted: isGuildBlacklisted,
      isWhitelisted: ( isGlobalWhitelisted || ( isGuildWhitelisted && !isGlobalBlacklisted ) ),
      isGlobalWhitelisted: isGlobalWhitelisted,
      isGuildWhitelisted: isGuildWhitelisted,
      isGuildOwner: isGuildOwner,
      hasAdministrator: hasAdministrator,
      hasManageGuild: hasManageGuild,
      hasManageRoles: hasManageRoles,
      isServerBooster: isServerBooster,
      hasMentionEveryone: hasMentionEveryone
      };
  } catch ( errPerms ) { await errorHandler( errPerms, { command: 'getPerms', type: 'tryFunction' } ); }
};