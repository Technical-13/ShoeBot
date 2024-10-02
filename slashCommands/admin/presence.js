const { ApplicationCommandType, ActionRowBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } = require( 'discord.js' );

module.exports = {
  name: 'presence',
  description: 'Change activity and status for bot.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [],
  run: async ( client, interaction ) => {
//    await interaction.deferReply( { ephemeral: true } );
    
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = [];
    const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );

    if ( !isBotMod ) {
      interaction.editReply( { content: 'You are not the boss of me...', ephemeral: true } );
      return;
    }
    const bot = client.user;
    
    const ActivityTypes = { Playing: 0, Streaming: 1, Listening: 2, Watching: 3, Custom: 4, Competing: 5 };

    const modalPresence = new ModalBuilder( {
      customId: 'setPresence-' + bot.id,
      title: 'setPresence'
    } );

    const getActivityType = new StringSelectMenuBuilder( {
      customId: 'activityType',
      maxValue: 1,
      options: [ 'Playing', 'Streaming', 'Listening', 'Watching', 'Custom', 'Competing' ]
    } );
    const rowActivityType = new ActionRowBuilder().addComponents( getActivityType );

    const getActivityText = new TextInputBuilder( {
      customId: 'customText',
      label: 'Activity Text',
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
    await interaction.showModal( modalPresence );
    const inputFilter = ( inputer ) => { inputer.user.id === author.id };
    interaction.awaitModalSubmit( { inputFilter, time: 300000 } ).then( modalInteraction => {
      const activityTypeSelect = modalInteraction.fields.getStringSelectMenuValue( 'activityType' );
      const activityTextInput = modalInteraction.fields.getTextInputValue( 'customText' );
      const statusSelect = modalInteraction.fields.getStringSelectMenuValue( 'status' );
      bot.setPresence( { activities: [ { type: activityTypes[ activityTypeSelect ], name: activityTextInput } ], status: statusSelect } );
    } );
  }
};
