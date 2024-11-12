const { ApplicationCommandType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './events/guildMemberAdd.js' );

module.exports = {
  name: 'ping',
  description: 'Check bot\'s ping.',
  type: ApplicationCommandType.User,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      interaction.reply( { content: '🏓 Pong! Latency: **' + Math.round( client.ws.ping) .toString() + 'ms**', ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};