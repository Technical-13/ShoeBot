const client = require( '..' );
const guildConfigDB = require( '../models/GuildConfig.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const errHandler = require( '../functions/errorHandler.js' );
const parse = require( '../functions/parser.js' );

client.on( 'guildMemberRemove', async ( member ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const { guild } = member;

    const currGuildConfig = await getGuildConfig( guild );
    currGuildConfig.Guild.Members = guild.members.cache.size;
    await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
    .then( updateSuccess => { console.log( 'Succesfully updated %s (id: %s) in my database.', chalk.bold.yellow( guild.name ), guild.id ); } )
    .catch( updateError => { throw new Error( chalk.bold.red.bgYellowBright( 'Error attempting to update %s (id: %s) to my database:\n%o' ), guild.name, guild.id, updateError ); } );
    console.log( '%s (id:%s) has left %s (id:%s).', member.displayName, member.id, guild.name, guild.id );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildMemberRemove.js' ), errObject.stack ); }
} );