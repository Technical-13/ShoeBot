const { EmbedBuilder } = require( '@discordjs/builders' );
const { GuildMember, Embed, InteractionCollector } = require( 'discord.js' );
const Schema = require( '../models/Welcome' );

module.exports = {
	name: 'guildMemberAdd',
	once: false,
	run( member ) {
    Schema.findOne( { Guild: member.guild.id }, async ( err, data ) => {
      if ( err ) return console.error( 'Error in guildMemberAdd.js: %o', err );
      if ( !data ) return;
      let channel = data.Channel;
      let Msg = data.Msg || ' ';
      let Role = data.Role;
      
      const { user, guild } = member;
      const welcomeChannel = member.guild.channels.cache.get( channel );

      welcomeChannel.send( '<@' + member.user.id + '>, ' + Msg );
      if ( Role ) member.roles.add( Role );
    } );
  }
}