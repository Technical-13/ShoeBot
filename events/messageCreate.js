const client = require( '..' );
const { EmbedBuilder, Collection, PermissionsBitField } = require( 'discord.js' );
const ms = require( 'ms' );
const prefix = client.prefix;
const cooldown = new Collection();
const CLIENT_ID = process.env.CLIENT_ID;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

client.on( 'messageCreate', async message => {
  const { author, channel, content, guild, mentions } = message;
  if ( author.bot ) return;
  if ( channel.type !== 0 ) return;);
  const isDevGuild = ( guild.id == DEV_GUILD_ID );
  const botOwner = client.users.cache.get( process.env.OWNER_ID );
  const isBotOwner = ( author.id === botOwner.id ? true : false );
// Get botMods, isBotMod
  const objGuildMembers = guild.members.cache;
  const objGuildOwner = objGuildMembers.get( guild.ownerId );
  const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
  const msgAuthor = await guild.members.cache.get( author.id );
  const hasPrefix = content.startsWith( prefix );
  const meMentionPrefix = '<@' + CLIENT_ID + '>';
  const mePrefix = content.startsWith( meMentionPrefix );
  const mentionsMe = mentions.users.has( CLIENT_ID );
  if ( !hasPrefix && !mePrefix ) return;
  var args = [];
  if ( hasPrefix ) { args = content.slice( prefix.length ).trim().split( / +/g ); }
  else if ( mePrefix ) {
    args = content.slice( meMentionPrefix.length ).trim().split( / +/g );
    if ( args[ 0 ].startsWith( prefix ) ) {
      args[ 0 ] = args[ 0 ].slice( prefix.length ).trim();
      if ( args[ 0 ].length == 0 ) { args = args.shift(); }
    }
  }
  const cmd = args.shift().toLowerCase();
  if ( cmd.length == 0 ) return;
  let command = client.commands.get( cmd );
  if ( !command ) command = client.commands.get( client.aliases.get( cmd ) );

  if ( command ) {
    const isOwnerOnly = command.ownerOnly;
    const isModOnly = command.modOnly;
    if ( isOwnerOnly && !isBotOwner ) {
      if ( isBotMod ) {
        return message.reply( { content: `This is an **owner only command**, speak to <@${botOwner.id}>/` } );
      } else { /* DO NOTHING */ }
//    } else if ( isModOnly && !isBotMod ) {
        /* DO NOTHING */
    } else {
      if ( command.cooldown ) {
        if ( cooldown.has( `${command.name}${author.id}` ) ) {
          return channel.send( { content: `You are on \`${ms(cooldown.get(`${command.name}${author.id}`) - Date.now(), {long : true})}\` cooldown!` } );
        }
        if ( command.userPerms || command.botPerms ) {
          if ( !message.member.permissions.has( PermissionsBitField.resolve( command.userPerms || [] ) ) ) {
            const userPerms = new EmbedBuilder()
            .setDescription( `🚫 ${author}, You don't have \`${command.userPerms}\` permissions to use this command!` )
            .setColor( 'Red' )
            return message.reply( { embeds: [ userPerms ] } );
          }
          if ( !objGuildMembers.get( client.user.id ).permissions.has( PermissionsBitField.resolve( command.botPerms || [] ) ) ) {
            const botPerms = new EmbedBuilder()
            .setDescription( `🚫 ${message.author}, I don't have \`${command.botPerms}\` permissions to use this command!` )
            .setColor( 'Red' )
            return message.reply( { embeds: [ botPerms ] } );
          }
        }
  
        command.run( client, message, args );
        cooldown.set( `${command.name}${message.author.id}`, Date.now() + command.cooldown );
        setTimeout( () => { cooldown.delete( `${command.name}${message.author.id}` ) }, command.cooldown );
      } else {
        if ( command.userPerms || command.botPerms ) {
          if ( !message.member.permissions.has( PermissionsBitField.resolve( command.userPerms || [] ) ) ) {
            const userPerms = new EmbedBuilder()
            .setDescription( `🚫 ${message.author}, You don't have \`${command.userPerms}\` permissions to use this command!` )
            .setColor( 'Red' )
            return message.reply( { embeds: [userPerms] } );
          }
  
          if ( !objGuildMembers.get( client.user.id ).permissions.has( PermissionsBitField.resolve( command.botPerms || [] ) ) ) {
            const botPerms = new EmbedBuilder()
            .setDescription( `🚫 ${message.author}, I don't have \`${command.botPerms}\` permissions to use this command!` )
            .setColor( 'Red' )
            return message.reply( { embeds: [ botPerms ] } );
          }
        }
        command.run( client, message, args );
      }
    }
  }
} );
