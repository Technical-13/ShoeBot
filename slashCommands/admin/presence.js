const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require( 'discord.js' );

module.exports = {
  name: 'presence',
  description: 'Change activity and status for bot.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  modCmd: true,
  options: [
        { type: 3, name: 'activity-type', description: 'Set the activity type.',
         choices: [
            { name: 'Playing', value: 'Playing' },
            { name: 'Streaming', value: 'Streaming' },
            { name: 'Listening', value: 'Listening' },
            { name: 'Watching', value: 'Watching' },
            { name: 'Custom', value: 'Custom' },
            { name: 'Competing', value: 'Competing' }
        ] },/*Set activity-type//*/
        { type: 3, name: 'activity', description: 'Set the activity.' },
        { type: 3, name: 'status', description: 'Set the status.',
         choices: [
            { name: 'Online', value: 'online' },
            { name: 'Idle', value: 'idle' },
            { name: 'Do Not Disturb', value: 'dnd' },
            { name: 'Offline', value: 'offline' }
        ] }/*Set status//*/
  ],
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );

    const bot = client.user;
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = [];
    const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );

    if ( !isBotMod ) {
      interaction.editReply( { content: 'You are not the boss of me...' } );
      return;
    }
    
    const ActivityTypes = { Playing: 0, Streaming: 1, Listening: 2, Watching: 3, Custom: 4, Competing: 5 };

    const embedPresence = new EmbedBuilder()
    .setTitle( 'setPresence' )
    .setDescription( 'Set my activity, description, and status.' )
    .setColor( '#FF00FF' )
    .setTimestamp()
    .setThumbnail( bot.displayAvatarURL() )
    .setFooter( { text: bot.tag } );

    const statusButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel( 'Offline' ).setCustomId( 'offline' ).setStyle( ButtonStyle.Secondary ),
      new ButtonBuilder().setLabel( 'Do Not Disturb' ).setCustomId( 'dnd' ).setStyle( ButtonStyle.Danger ),
      new ButtonBuilder().setLabel( 'Idle' ).setCustomId( 'idle' ).setStyle( ButtonStyle.Primary ),
      new ButtonBuilder().setLabel( 'Online' ).setCustomId( 'online' ).setStyle( ButtonStyle.Success ) );
    const embedInterface = await interaction.editReply( { embeds: [ embedPresence ], components: [ statusButtons ] } );
    const clickFilter = ( clicker ) => { clicker.user.id === author.id };
    const buttonClicks = embedInterface.createMessageComponentCollector( { componentType: ComponentType.Button, clickFilter, max: 1 } );
    
    buttonClicks.on( 'collect', clicked => {
      switch ( clicked.customId ) {
        case 'offline':
          bot.setPresence( { status: 'offline' } ).then( newPresence => {
            clicked.reply( 'I am now **`Offline`**!' );
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', clicked.customId, errSetPresence ); } );
          break;
        case 'dnd':
          bot.setPresence( { status: 'dnd' } ).then( newPresence => {
            clicked.reply( 'I am now **`Do Not Disturb`**!' );   
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', clicked.customId, errSetPresence ); } );       
          break;
        case 'idle':
          bot.setPresence( { status: 'idle' } ).then( newPresence => {
            clicked.reply( 'I am now **`Idle`**!' );
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', clicked.customId, errSetPresence ); } );
          break;
        case 'online': default:
          bot.setPresence( { status: 'online' } ).then( newPresence => {
            clicked.reply( 'I am now **`Online`**!' );
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', clicked.customId, errSetPresence ); } );
      }
    } );

    buttonClicks.on( 'end', () => {
      setTimeout( () => { embedInterface.delete(); }, 3000 );
    } );
  }
};
