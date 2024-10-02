const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require( 'discord.js' );

module.exports = {
    name: 'presence',
    description: 'Change the bot\s presence',
    ownerOnly: true,
    cooldown: 1000,
    run: async ( client, message, args ) => {
        const { author, channel, guild } = message;
        const bot = client.user;

        message.delete();

        const activityTypes = { 'playing': 0, 'streaming': 1, 'listening': 2, 'watching': 3, 'custom': 4, 'competing': 5 };
        const embedPresence = new EmbedBuilder()
        .setTitle( 'setPresence' )
        .setDescription( 'Set my activity, description, and status.' )
        .setColor( '#FF00FF' )
        .setTimestamp()
        .setThumbnail( bot.displayAvatarURL() )
        .setFooter( { text: bot.tag } )

        const statusButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel( 'Offline' ).setCustomId( 'offline' ).setStyle( ButtonStyle.Secondary ),
            new ButtonBuilder().setLabel( 'Do Not Disturb' ).setCustomId( 'dnd' ).setStyle( ButtonStyle.Danger ),
            new ButtonBuilder().setLabel( 'Idle' ).setCustomId( 'idle' ).setStyle( ButtonStyle.Primary ),
            new ButtonBuilder().setLabel( 'Online' ).setCustomId( 'online' ).setStyle( ButtonStyle.Success ) );
        const embedInterface = await message.reply( { embeds: [ embedPresence ], components: [ statusButtons ] } );
        const clickFilter = ( clicker ) => { clicker.user.id === author.id };
        const buttonClicks = embedInterface.createMessageComponentCollector( { componentType: ComponentType.Button, clickFilter, maxProcessed: 1 } );

        buttonClicks.on( 'collect', interaction => {
            switch ( interaction.customId ) {
                case 'offline':
                    bot.setPresence( { status: 'offline' } );break;
                case 'dnd':
                    bot.setPresence( { status: 'dnd' } );break;
                case 'idle':
                    bot.setPresence( { status: 'idle' } );break;
                case 'online': default:
                    bot.setPresence( { status: 'online' } );
            }
        } );

        buttonClicks.on( 'end', () => {
            setTimeout( () => { embedInterface.delete(); }, 3000 );
        } );
    }
};
