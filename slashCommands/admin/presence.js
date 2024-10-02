module.exports = {
    name: 'presence',  
    description: 'Change activity and status for bot.',
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [],
    disable: true,
    run: async ( client, interaction ) => {
        await interaction.deferReply( { ephemeral: true } );
    }
}
