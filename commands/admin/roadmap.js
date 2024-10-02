const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );

module.exports = {
    name: 'roadmap',
    aliases: [ 'todo' ],
    description: 'Development ToDo list for me!',
    cooldown: 600000,
    run: async ( client, message, args ) => {
        const arrToDo = [
            'Add logging for geocaching commands directed to another server member.',
            'Finish messageDelete.js event logging.',
            'Add `guild` and `guildMember` events.',
            'Create global `botmod` commands and DB.',
            '`Botmod` command `&inspectdb` needs to DM the botmod the information instead of logging to console.',
            'Turn `&inspectDB` into something more people can use and maybe make it a slash command.',
            'Add some more stuff to this array of stuff todo...'
        ];
		const embedToDo = new EmbedBuilder()
            .setTitle( 'Development Roadmap for bot:' )
            .setColor( '#FF00FF' )
            .setTimestamp()
            .setFooter( { text: client.user.tag } );
        
        arrToDo.forEach( item => {
	            embedToDo.addFields( { name: '\u200B', value: item, inline: false } );
        } );
        message.reply( { embeds: [ embedToDo ] } );
    }
};
