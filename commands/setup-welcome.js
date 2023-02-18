const welcomeSchema = require( '../models/Welcome' );
const { model, Schema } = require( 'mongoose' );

module.exports = {
	name: 'setup-welcome',
	description: 'Set up your welcome message for this server.',
	cooldown: 1000, // Set a cooldown of 1 second
	async run( interaction, client ) {
    const { channel, options } = interaction;

    const welcomeChannel = options.getChannel( 'channel' );
    const welcomeMessage = options.getString( 'welcome-message' );
    const roleId = options.getRole( 'welcome-role' );

 /*   if ( !interaction.guild.members.me.permissions.has( PermissionFlagsBits.SendMessages ) ) {
      interaction.reply( { content: 'I don\'t have permission for this.', ephemeral: true } );
    }//*/

    welcomeSchema.findOne( { Guild: interaction.guild.id }, async ( err, data ) => {
      if ( !data ) {
        const newWelcome = await welcomeSchema.create( {
          Guild: interaction.guild.id,
          Channel: welcomeChannel.id,
          Msg: welcomeMessage,
          Role: roleId.id
        } );
        interaction.reply( { content: 'Server welcome created.', ephemeral: true } );
      } else {
        const updateWelcome = await welcomeSchema.updateOne( {
          Guild: interaction.guild.id,
          Channel: welcomeChannel.id,
          Msg: welcomeMessage,
          Role: roleId.id
        } );
        interaction.reply( { content: 'Server welcome updated.', ephemeral: true } );
      }
    } );
  }
}