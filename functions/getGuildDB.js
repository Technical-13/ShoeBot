const client = require( '..' );
require( 'dotenv' ).config();
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const getBotConfig = require( './getBotDB.js' );
const ENV = process.env;
const chalk = require( 'chalk' );
const currVersion = 241030;

module.exports = async ( guild ) => {
  if ( !guild ) { throw new Error( 'No guild to get.' ); }
try {
  const guildOwner = guild.members.cache.get( guild.ownerId );
  if ( !guildOwner ) {
    await guild.leave()
    .then( left => { throw new Error( 'I left guild %s (id: %s) because its owner with id: %s, is invalid.', guild.name, guild.id, guild.ownerId ); } )
    .catch( stayed => { throw new Error( 'I could NOT leave guild %s (id: %s) with invalid owner id: %s:\n%o', guild.name, guild.id, guild.ownerId, stayed ); } );
  }
  const botConfig = await getBotConfig();
  const botOwnerID = ( botConfig.Owner || config.botOwnerId || ENV.OWNER_ID || null );
  const botOwner = client.users.cache.get( botOwnerID );
  const globalPrefix = ( botConfig.Prefix || client.prefix || config.prefix || '!' );
  const guildId = guild.id;
  const logClosing = ( defaultId ) => { return '\n' + ( defaultId == null ? '\nPlease run `/config logs` to have these logs go to a channel in the [' + guild.name + '](<https://discord.com/channels/' + guild.id + '>) server or deactivate them instead of to your DMs.' : '\n----' ); }

  const newGuild = ( await guildConfig.countDocuments( { _id: guildId } ) === 0 ? true : false );
  if ( newGuild ) {
    console.log( 'Adding %s (id: %s) to database...', chalk.bold.green( guild.name ), chalk.bold.green( guildId ) );
    const newGuildConfig = {
      _id: guild.id,
      Blacklist: {
        Members: [],
        Roles: []
      },
      Commands: [],
      Expires: null,
      Guild: {
        Name: guild.name,
        Members: guild.members.cache.size
      },
      Invite: null,
      Logs: {
        Active: true,
        Chat: null,
        Default: null,
        Error: null,
        strClosing: logClosing( null )
      },
      Part: {
        Active: false,
        Channel: null,
        Message: null,
        SaveRoles: true
      },
      Prefix: globalPrefix,
      Premium: true,
      Version: currVersion,
      Welcome: {
        Active: false,
        Channel: null,
        Message: null,
        Role: null
      },
      Whitelist: {
        Members: [],
        Roles: []
      }
    };
    await guildConfig.create( newGuildConfig )
    .then( initSuccess => { console.log( chalk.bold.greenBright( 'Succesfully added %s (id: %s) to my database.' ), guild.name, guildId ); return newGuildConfig; } )
    .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add %s (id: %s) to my database:\n%o' ), guild.name, guildId, initError ); } );
  }
  else {
    const currConfig = await guildConfig.findOne( { _id: guildId } );
    const configVersion = ( !currConfig.Version ? 0 : currConfig.Version );
    const currBlacklist = ( currConfig.Blacklist || { Members: [], Roles: [] } );
    const currLogs = ( currConfig.Logs || { Active: true, Chat: null, Default: null, Error: null } );
    const currPart = ( currConfig.Part || { Active: false, Channel: null, Message: null, SaveRoles: true } );
    const currWelcome = ( currConfig.Welcome || { Active: false, Channel: null, Message: null, Role: null } );
    const currWhitelist = ( currConfig.Whitelist || { Members: [], Roles: [] } );
    const updatedGuildConfig = {
      _id: guild.id,
      Blacklist: {
        Members: ( currBlacklist.Members || [] ),
        Roles: ( currBlacklist.Roles || [] )
      },
      Commands: ( currConfig.Commands || [] ),
      Expires: ( currConfig.Expires || null ),
      Guild: {
        Name: guild.name,
        Members: guild.members.cache.size
      },
      Invite: ( currConfig.Invite || null ),
      Logs: {
        Active: ( currLogs.Active || true ),
        Chat: ( currLogs.Chat || null ),
        Default: ( currLogs.Default || null ),
        Error: ( currLogs.Error || null ),
        strClosing: logClosing( currLogs.Default || null )
      },
      Part: {
        Active: ( currPart.Active || false ),
        Channel: ( currPart.Channel || null ),
        Message: ( currPart.Message || null ),
        SaveRoles: ( currPart.SaveRoles || true )
      },
      Prefix: ( currConfig.Prefix || globalPrefix ),
      Premium: ( currConfig.Premium || true ),
      Version: currVersion,
      Welcome: {
        Active: ( currWelcome.Active || false ),
        Channel: ( currWelcome.Channel || null ),
        Message: ( currWelcome.Message || null ),
        Role: ( currWelcome.Role || null )
      },
      Whitelist: {
        Members: ( currWhitelist.Members || [] ),
        Roles: ( currWhitelist.Roles || [] )
      }
    };
    await guildConfig.updateOne( { _id: guildId }, updatedGuildConfig, { upsert: true } )
    .then( updateSuccess => { return updatedGuildConfig; } )
    .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) to my database:\n%o' ), guild.name, guildId, updateError ); } );
  }
} catch ( errGuildDB ) { console.error( 'errGuildDB: %o', errGuildDB ); }
};