const client = require( '..' );
const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
require( 'dotenv' ).config();
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const getBotConfig = require( './getBotDB.js' );
const ENV = process.env;
const chalk = require( 'chalk' );
const currVersion = 241031.2;

module.exports = async ( guild ) => {
  try {
    if ( !guild ) { throw new Error( 'No guild to get.' ); }
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

    if ( await guildConfig.countDocuments( { _id: guildId } ) != 0 ) {
      const currConfig = await guildConfig.findOne( { _id: guildId } );
      currConfig.strClosing = await logClosing( currConfig.Logs.Default );
      return currConfig;
    }
    else {
      console.log( 'Adding %s (id: %s) to database...', chalk.bold.green( guild.name ), guildId );
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
          Members: guild.members.cache.size,
          OwnerID: guild.ownerId,
          OwnerName: guildOwner.displayName
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
      return await guildConfig.create( newGuildConfig )
      .then( initSuccess => { console.log( chalk.bold.greenBright( 'Succesfully added %s (id: %s) to my database.' ), guild.name, guildId ); return newGuildConfig; } )
      .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to add %s (id: %s) to my database:\n%o' ), guild.name, guildId, initError ); } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'getGuildDB.js' ), errObject.stack ); }
};