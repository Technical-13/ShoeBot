const client = require( '..' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../models/GuildConfig.js' );

module.exports = async ( guild ) => {
  const botOwner = client.users.cache.get( client.ownerId );
  const strConsole = '  Please check the console for details.';
  
  try {
    const guildConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( async objError => {
      console.error( 'Encountered an error attempting to find %s(ID:%s) in my database in getLogChans.js:\n%s', guild.name, guild.id, objError.stack );
      botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database in getLogChans.' + strConsole )
      .catch( errNotSent => { console.error( 'Error attempting to DM you about the above error: %o', errNotSent ); } );
      return { doLogs: false, chanDefault: null, chanError: null, chanChat: null, strClosing: null };
    } );
    
    if ( !guildConfig ) {
      let objError = { stack: 'guildConfigDB.findOne( { Guild: guild.id } ) in getLogChans.js returned:\n' + guildConfig };
      console.error( 'Encountered an error attempting to find %s(ID:%s) in my database in getLogChans.js:\n%s', guild.name, guild.id, objError.stack );
      botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database in getLogChans.' + strConsole )
      .catch( errNotSent => { console.error( 'Error attempting to DM you about the above error: %o', errNotSent ); } );
      return { doLogs: false, chanDefault: null, chanError: null, chanChat: null, strClosing: null };
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