module.exports = {
	name: "foo", // Command name
	description: "Foo Bar Baz - Testing command", // Set the description
	cooldown: 0, // No cooldown
	async run( interaction, client ) {
    const myOwner = client.users.cache.get( process.env.OWNERID );

    console.log( 'Bot Mods: %o', process.env.BOT_MODS.split( ';' )[ 0 ] );

    interaction.reply( { content: 'Done!  See console.', ephemeral: true } );
  }
}