module.exports = {
	name: "react",
	description: "What reaction do you want me to use on which message?",
	cooldown: 1000,
	async run( interaction, client ) {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, options } = interaction;
    const msgID = interaction.options.getString( 'message-id' );
/* Should be checking if bot is blocked by the user */
    var myReaction = interaction.options.getString( 'reaction' );
    const strAuthorTag = interaction.user.tag;
    var rxp = /<:(.*)?:([\d]*)>/;
		if ( rxp.test( myReaction ) ) { myReaction = myReaction.match( rxp )[ 2 ]; }
    else { myReaction = encodeURI( myReaction );  }

    channel.messages.fetch( msgID ).then( async message => {
      await message.react( myReaction ).then( reacted => {
        interaction.editReply( { content: 'Reacted!' } );
        console.log( '%o requested me to reacted to %o in %o#%o:\n\t%o',
          strAuthorTag, message.author.tag, message.guild.name, message.channel.name, myReaction
        );
      } ).catch( noReaction => {
        if ( noReaction.code == 10014 ) {
          interaction.editReply( { content: '`' + myReaction + '` is not a valid emoji to react with.' } );
        } else {
          interaction.editReply( { content: 'Unable to find reaction for message.' } );
          console.error( '%o requested me to react to a message, and I couldn\'t (#%o) with:\n\t%o',
            strAuthorTag, msgID, noReaction
          );
        }
      } );
    } ).catch( noMessage => {
      interaction.editReply( { content: 'Unable to find message to react to.' } );
      console.error( '%o requested me to react to a message I couldn\'t find (#%o) with:\n\t%o',
        strAuthorTag, msgID, myReaction
      );
    } );
	}
}