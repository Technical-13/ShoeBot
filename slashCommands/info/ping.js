const { ApplicationCommandType } = require( 'discord.js' );

module.exports = {
  name: 'ping',
  description: "Check bot's ping.",
  type: ApplicationCommandType.ChatInput,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      interaction.reply( { content: `🏓 Pong! Latency: **` + Math.round( client.ws.ping) .toString() + 'ms**', ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s: %s', chalk.hex( '#FFA500' ).bold( 'ping.js' ), errObject.stack ); }
  }
};