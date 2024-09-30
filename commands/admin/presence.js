const { ActionRowBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } = require( 'discord.js' );

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

        const modalPresence = new ModalBuilder( {
            customId: 'setPresence-' + bot.id,
            title: 'setPresence'
        } );

        const getActivityType = new StringSelectMenuBuilder( {
            customId: 'activityType',
            maxValue: 1,
            options: [ 'playing', 'streaming', 'listening', 'watching', 'custom', 'competing' ]
        } );
        const rowActivityType = new ActionRowBuilder().addComponents( getActivityType );

        const getActivityText = new TextInputBuilder( {
            customId: 'customText',
            label: 'Custom Text',
            style: TextInputStyle.Short
        } );
        const rowActivityText = new ActionRowBuilder().addComponents( getActivityText );

        const getStatus = new StringSelectMenuBuilder( {
            customId: 'status',
            maxValue: 1,
            options: [ 'offline', 'dnd', 'idle', 'online' ],
            placeholder: bot.presence.status
        } );
        const rowStatus = new ActionRowBuilder().addComponents( getStatus );

        modalPresence.addComponents( rowActivityType, rowActivityText, rowStatus );

        await message.showModal( modalPresence );
        const inputFilter = ( inputer ) => { inputer.user.id === author.id };
        message.awaitModalSubmit( { inputFilter, time: 300000 } ).then( modalInteraction => {
            const activityTypeSelect = modalInteraction.fields.getStringSelectMenuValue( 'activityType' );
            const activityTextInput = modalInteraction.fields.getTextInputValue( 'customText' );
            const statusSelect = modalInteraction.fields.getStringSelectMenuValue( 'status' );
            bot.setPresence( { activities: [ { type: activityTypes[ activityTypeSelect ], name: activityTextInput } ], status: statusSelect } );
        } );
    }
};
