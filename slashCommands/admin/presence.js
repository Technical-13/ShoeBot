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

    const botPresence = bot.presence.toJSON();
console.log( 'botPresence: %o', botPresence );
    
    const selectActivityType = ( options.getString( 'activity-type' ) || bot.presence.activities.type || 'Playing' );
    const selectActivityName = ( options.getString( 'activity' ) || bot.presence.activities.name || '' );
    const setPresenceActivity = [ { type: ActivityTypes[ selectActivityType ], name: selectActivityName } ];
    const selectStatus = ( options.getString( 'status' ) || bot.presence.status );
    
    bot.setPresence( { activities: setPresenceActivity, status: selectStatus } );
  }
};
