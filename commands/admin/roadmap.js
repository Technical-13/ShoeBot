const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );

module.exports = {
  name: 'roadmap',
  aliases: [ 'todo' ],
  description: 'Development ToDo list for me!',
  cooldown: 600000,
  run: async ( client, message, args ) => {
    const arrToDo = [
      'Add `Version` and `Expires` to GuildConfig.js schema.',
      'Add `Part` to GuildConfig.js to define what bot does when members leave for any reason. Add settings for this to config.js',
      'Add `Logs` to BotConfig.js schema.',
      'Check DB entries are current version in ready.js. Create anything missing and update member count as needed. If expired, delete entry.',
      'Finish guildCreate.js event. Add new guild to DB if not already there. If it is, recreate if expired or update it if not (removing expiration). Tell guild owner how to use bot.',
      'Populate guildDelete.js event. Log in system log channel guild left and add expiration to DB for guild to be removed from DB after 2 weeks.',
      'Create guildUpdate.js to update DB entry if guild.name changes.',
      'Do whatever is defined for guildConfig.Part in guildMemberKick.js, guildMemberBan.js, and/or guildMemberDelete.js',
      'Create `/verify` command.'.
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