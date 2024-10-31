const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const errHandler = require( '../../functions/errorHandler.js' );

module.exports = {
  name: 'part',
  description: 'Leave the current guild.',
  modOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    try {
      const { author, channel, guild } = message;
      const { isBotOwner } = await userPerms( author, guild, false, true );

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

        var leaveGuild, leaveReason;
        if ( args.length === 0 ) { leaveGuild = guild; }
        if ( args.length >= 1 ) {
          let guildId = args[ 0 ];
          if ( !( /[\d]{18,19}/.test( guildId ) ) && !guildId.startsWith( '||' ) ) { return interaction.editReply( { content: '`' + guildId + '` is not a valid `guild-id`. Please try again.' } ); }
          if ( !client.guilds.cache.get( guildId ) && !guildId.startsWith( '||' ) ) { return interaction.editReply( { content: 'I wasn\'t in any guild with an id of `' + guildId + '`. Please try again.' } ); }
          leaveGuild = client.guilds.cache.get( args.shift() );
        }
        if ( args.length != 0 ) { leaveReason = args.join( ' ' ).replace( /\|{2}/g, '' ); }

        if ( leaveGuild ) {
          const leaveIn = 5;
          const leaveMsg = await message.reply( { content: 'I\'m leaving in ' + leaveIn + ' seconds' + ( !leaveReason ? '' : ' with reason `' + leaveReason + '`' ) + ' as requested by <@' + author.id + '>.' + ( !inviteUrl ? '' : '  Please feel free to [re-add me](<' + inviteUrl + '>) if you wish!' ) } )
          .then( sentLeaving => { message.delete().catch( async errDelete => { await errHandler( errDelete, { command: 'part', channel: channel, type: 'errDelete', debug: true } ); } ); } )
          .catch( errSend => { console.error( 'Failed to alert in #%s (id: %s) that I\'m leaving %s (id: %s) as requested by %s (id: %s): %s', channel.name, channel.id, guild.name, guild.id, author.displayName, author.id, errSend.stack ); } );
          for ( let i = 1; i < leaveIn; i++ ) {
            newMsg = leaveMsg.content.replace( ( leaveIn - i + 1 ), ( leaveIn - i ) );
            setTimeout( () => { leaveMsg.edit( { content: newMsg } ); }, i * 1000 );
          }

          setTimeout( () => {
            await leaveGuild.leave()
            .then( left => { console.error( 'I left guild %s (id: %s) as requested by %s (id: %s)', guild.name, guild.id, author.displayName, author.id ); } )
            .catch( stayed => { console.error( 'I could NOT leave guild %s (id: %s) as requested by %s (id: %s):\n%o', guild.name, guild.id, author.displayName, author.id, stayed ); } );
          }, leaveIn + 1000 );
        }
      }
    }
    catch ( objError ) { console.error( 'Uncaught error in %s: %s', chalk.bold.hex( '#FFA500' )( 'part.js' ), errObject.stack ); }
  }
};