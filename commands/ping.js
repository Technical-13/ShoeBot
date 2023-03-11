module.exports = {
	name: "ping", // Command name
	description: "Get the bot ping", // Set the description
	cooldown: 1000, // Set a cooldown of 1 second
	async run( interaction, client ) { // Function to run on call
    const myOwner = client.users.cache.get( process.env.OWNERID );
    const author = interaction.user.id;
    const arrAuthorPermissions = ( interaction.guild.members.cache.get( author ).permissions.toArray() || [] );
    const cmdAllowed = ( arrAuthorPermissions.indexOf( 'PRIORITY_SPEAKER' ) !== -1 ? true : false );
    
		interaction.reply( { content: client.ws.ping.toString() + 'ms', ephemeral: interaction.inGuild() } );

    /* TEST SECTION */
    console.log( 'arrAuthorPermissions: %o', arrAuthorPermissions );
	}
}