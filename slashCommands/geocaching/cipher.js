const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'decode',
  description: 'Cipher (de|en)coder.',
  type: ApplicationCommandType.ChatInput,
  options: [
    { type: 3, name: 'string', description: 'string to (de|en)code.', required: true },
    { type: 3, name: 'use-type', description: '' },
    { type: 10, name: 'numeric', description: 'Characters in the Latin alphabet. (default 5)', minValue: 1, maxValue: 10 },
    { type: 10, name: 'alphabetic', description: 'Characters in the Latin alphabet. (default 13)', minValue: 1, maxValue: 26 },
    { type: 10, name: 'alphanumberic', description: 'Characters in the Latin alphabet. (default 18)', minValue: 1, maxValue: 36 }
  ],
  modCmd: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const { botOwner, isBotMod, isBlacklisted, isGlobalWhitelisted, guildOwner, isGuildBlacklisted } = await userPerms( client, author, guild );
    if ( isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      return interaction.editReply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server!' : '!' ) + '  Please contact <@' + contact + '> to resolve the situation.' } );
    }
    else if ( isBotMod && isGuildBlacklisted ) {
      author.send( 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '/' + channel.id + '! Use `/config remove` to remove yourself from the blacklist.' );
    }
    return interaction.editReply( { content: 'Comming soon:tm:' } );
  }
};