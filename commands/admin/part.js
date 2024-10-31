const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'part',
  description: 'Leave the current guild.',
  modOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    try {
      const { author, guild } = message;
      const { botOwner, isBotOwner, isDevGuild } = await userPerms( author, guild );

      if ( isBotOwner ) {
        let allowRejoin = ( args.length >= 1 && typeof( args[ args.length ] ) === 'boolean' ? args.pop() : true );
        const inviteUrl = ( allowRejoin ? client.generateInvite( {
          permissions: [
            PermissionFlagsBits.CreateInstantInvite,
            PermissionFlagsBits.Administrator,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.UseExternalEmojis,
            PermissionFlagsBits.ManageWebhooks,
            PermissionFlagsBits.UseApplicationCommands
          ],
          scopes: [
            OAuth2Scopes.Bot,
            OAuth2Scopes.ApplicationsCommands
          ],
        } ) : null );
        message.reply( { content: 'I\'m leaving as requested by <@' + author.id + '>.' + ( !inviteUrl ? '' : '  Please feel free to [re-add me](<' + inviteUrl + '>) if you wish!' ) } )
        .then( sentLeaving => { message.delete(); } )
        .catch( errSend => { console.error( 'Failed to alert that I\'m leaving %s (id: %s) as requested by %s (id: %s).', guild.name, guild.id, author.displayName, author.id ); } );
        var leaveGuild;
        if ( args.length === 0 ) { leaveGuild = guild; }
        if ( args.length === 1 ) {
          let guildId = args[ 0 ];
          if ( !( /[\d]{18,19}/.test( guildId ) ) ) { return interaction.editReply( { content: '`' + guildId + '` is not a valid `guild-id`. Please try again.' } ); }
          if ( !client.guilds.cache.get( guildId ) ) { return interaction.editReply( { content: 'I wasn\'t in any guild with an id of `' + guildId + '`. Please try again.' } ); }
          leaveGuild = client.guilds.cache.get( guildId );
        }
        await leaveGuild.leave()
        .then( left => { console.error( 'I left guild %s (id: %s) as requested by %s (id: %s)', guild.name, guild.id, author.displayName, author.id ); } )
        .catch( stayed => { console.error( 'I could NOT leave guild %s (id: %s) as requested by %s (id: %s):\n%o', guild.name, guild.id, author.displayName, author.id, stayed ); } );
      }
    }
    catch ( objError ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'part.js' ), errObject.stack ); }
  }
};