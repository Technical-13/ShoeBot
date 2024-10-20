const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );

module.exports = {
  name: 'roadmap',
  aliases: [ 'todo' ],
  description: 'Development ToDo list for me!',
  cooldown: 600000,
  run: async ( client, message, args ) => {
    const arrToDo = [
      'Add logging for geocaching commands directed to another server member.',
      'Create something for event logging.',
      'Add `guild*` and `guildMember*` event listeners.',
      'Finish `/guilds` command as a paginated embed.',
      'Create function script to get log channels in commands.',
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