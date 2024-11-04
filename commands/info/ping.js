module.exports = {
	name: 'ping',
	description: 'Check bot\'s ping.',
	cooldown: 3000,
	run: async ( client, message, args ) => {
    try {
      const msg = await message.reply( 'Pinging...' )
      await msg.edit( `Pong! **${client.ws.ping} ms**` )
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.hex( '#FFA500' ).bold( 'commands/info/ping.js' ), errObject.stack ); }
	}
};