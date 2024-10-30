const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );

module.exports = {
  name: 'roadmap',
  aliases: [ 'todo' ],
  description: 'Development ToDo list for me!',
  cooldown: 600000,
  run: async ( client, message, args ) => {
    const arrToDo = [
      'Test changes to guildCreate.js and guildDelete.js',
      'Finish guildCreate.js event telling guild owner how to config bot.',
      'Create guildUpdate.js to update DB entry if guild.name changes.',
      'Update `/config` and `/system` for DB changes',
      'Do whatever is defined for guildConfig.Part in guildMemberKick.js, guildMemberBan.js, and/or guildMemberDelete.js',
      'Create `/verify` command.',
      'Get the `/bot` command working again so people can get bot info and links to request features and report bugs.',
      'Move this list so I can add/modify/remove items from Discord.' +
      '\nAdd integration to make this list an issue on GitHub and be able to view/edit all issues?' +
      '\n:arrow_right: <https://docs.github.com/en/rest/quickstart?apiVersion=latest>' +
      '\n:arrow_right: <https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=latest>' +
      '\n:arrow_right: <https://docs.github.com/en/rest/issues/issues?apiVersion=latest>',
      'Get `/guilds` and `/cipher` working.'
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