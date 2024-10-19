const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../models/GuildConfig.js' );
const errHandler = require( './errorHandler.js' );

module.exports = async ( guild ) => {
  try {
    const guildConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( async err => {
      await errHandler( errFindGuild, { author: user, command: 'getLogChans', guild: guild, type: 'getGuildDB' } );
      return { doLogs: false };
    } );
    
    if ( !guildConfig ) {
      await errHandler( errFindGuild, { author: user, command: 'getLogChans', guild: guild, type: 'getGuildDB' } );
      return { doLogs: false };
    }
    else {
      const doLogs = ( guildConfig.Logs.Active || true );
      const guildOwner = guild.members.get( guild.ownerId );
      const chanDefault = ( guildConfig.Logs.Default ? guild.channels.cache.get( guildConfig.Logs.Default ) : guildOwner );
      const chanError = ( guildConfig.Logs.Error ? guild.channels.cache.get( guildConfig.Logs.Error ) : chanDefault );
      const chanChat = ( guildConfig.Logs.Chat ? guild.channels.cache.get( guildConfig.Logs.Chat ) : chanDefault );
      
      const strClosing = '\n' + ( chanDefault == guildOwner ? 'Please run `/config` to have these logs go to a channel in the [' + guild.name + '](<https://discord.com/channels/' + guild.id + '>) server or deactivate them instead of your DMs.' : '----' );
    
      return {
        doLogs: doLogs,
        chanDefault: chanDefault,
        chanError: chanError,
        chanChat: chanChat,
        strClosing: strClosing
      };
    }
  } catch ( errLogChans ) { console.error( 'Error in getLogChans.js: %s', errLogChans.stack ); }
};