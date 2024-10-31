const client = require( '..' );

client.on( 'guildMemberRemove', async ( member ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const { guild } = member;
    console.log( '%s (id:%s) has left %s (id:%s).', member.displayName, member.id, guild.name, guild.id );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'guildMemberRemove.js' ), objError.stack ); }
} );