const { SlashCommandBuilder } = require('discord.js');
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/admin/config.js' );

module.exports = {
  name: 'reload',
  group: 'admin',
  description: 'Reloads a command.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild, InteractionContextType.BotDM ],
  options: [ { type: 3, name: 'command', description: 'The command to reload.', required: true } ]
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
		try {
      const { botOwner, isBotOwner, isBotMod } = await userPerms( author, guild );
      if ( isBotMod && !isBotOwner ) { return interaction.editReply( 'This is currently an **owner only** command.  Please talk to <@' + botOwner.id + '> if you need assistance.' ); }
      else if ( !isBotOwner ) { return interaction.editReply( 'This is an **owner only** command.  Please talk to <@' + botOwner.id + '> if you need assistance.' ); }
      else {
        const commandName = interaction.options.getString( 'command', true ).toLowerCase();
        const command = client.commands.get( commandName );

        if ( !command ) { return interaction.editReply( 'I have no command named `' + commandName + '`!' ); }

        delete require.cache[ require.resolve( '../slashCommands/' + command.group + '/' + command.name + '.js' ) ];

        const newCommand = require( '../slashCommands/' + command.group + '/' + command.name + '.js' );
        client.commands.set( newCommand.name, newCommand );
        await interaction.editReply( 'Command `' + newCommand.name + '` was reloaded!' );
      }
		}
    catch ( errObject ) {
      console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack );
      await interaction.editReply( 'There was an error while reloading command `' + command.name + '`:\n`' + errObject.message + '`' );
		}
	},
};