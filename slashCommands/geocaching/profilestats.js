const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errHandler = require( '../../functions/errorHandler.js' );

module.exports = {
  name: 'profilestats',
  description: 'Show link to Project-GC ProfileStats for user.',
  description_localizations: {
    de: 'Link zu Project-GC ProfileStats für Benutzer anzeigen.',
    fi: 'Näytä käyttäjälle linkki Project-GC ProfileStatsiin.',
    pl: 'Pokaż link do Project-GC ProfileStats dla użytkownika.' },
  options: [ {
    name: 'gc-name',
    name_localizations: {
      de: 'gc-name',
      fr: 'nom-gc',
      fi: 'gc-nimi',
      pl: 'gc-name',
      'sv-SE': 'gc-namn' },
    description: 'The case-sensitive Geocaching.com username.',
    description_localizations: {
      de: 'Der Geocaching.com-Benutzername, bei dem die Groß-/Kleinschreibung beachtet werden muss.',
      fi: 'Geocaching.com-käyttäjänimi, kirjainkoko merkitsevä.',
      pl: 'W nazwie użytkownika Geocaching.com rozróżniana jest wielkość liter.' },
    type: 3
  }, {
    name: 'discord-user',
    name_localizations: {
      de: 'discord-benutzer',
      fr: 'utilisateur-discord',
      fi: 'discord-käyttäjä',
      pl: 'discord-użytkownik',
      'sv-SE': 'discord-användare' },
    description: 'Discord member (requires nickname to be set if different from GC name).',
    description_localizations: {
      de: 'Discord-Mitglied (erfordert das Festlegen eines Spitznamens, wenn dieser vom GC-Namen abweicht).',
      fi: 'Discord-jäsen (vaatii nimimerkin asettamisen, jos se on eri kuin GC-nimi).',
      pl: 'Członek Discord (wymaga ustawienia pseudonimu, jeśli różni się od nazwy GC).' },
    type: 6
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 120000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const { content } = await userPerms( author, guild );
    if ( content ) { return interaction.editReply( { content: content } ); }

    const today = ( new Date() );
    const intYear = today.getFullYear();
    const intMonthNow = today.getMonth();
    const intMonth = ( intMonthNow < 9 ? '0' + ( intMonthNow + 1 ).toString() : ( intMonthNow + 1 ).toString() );
    const intDayNow = today.getDate();
    const intDay = ( intDayNow <= 9 ? '0' + intDayNow.toString() : intDayNow.toString() );

    const objGuildMembers = guild.members.cache;
    const strAuthorDisplayName = objGuildMembers.get( author.id ).displayName;
    const strInputUser = ( options.getString( 'gc-name' ) || null );
    const objInputUser = ( options.getUser( 'discord-user' ) || null );
    const strInputUserDisplayName = ( objInputUser ? objInputUser.displayName : strInputUser );
    const strUseName = ( strInputUserDisplayName ? strInputUserDisplayName : strAuthorDisplayName );
    const encName = encodeURI( strUseName ).replace( '&', '%26' );
    
    const { doLogs, chanDefault, chanError, strClosing } = await logChans( guild );    

    channel.send( { content:
      'ProfileStats link for: ' + ( objInputUser == null ? strUseName : '<@' +  objInputUser + '>' ) + '\n<https://project-gc.com/Profile/ProfileStats?profile_name=' + encName + '>'
    } )
    .then( sentMsg => {
      if ( doLogs && strInputUserDisplayName && strInputUserDisplayName !== strAuthorDisplayName ) {
        chanDefault.send( { content:
          'I shared the `/profilestats` for ' + ( objInputUser ? '<@' +  objInputUser.id + '>' : strUseName ) + ' in <#' + channel.id + '>' +
        ( strInputUserDisplayName !== strAuthorDisplayName ? ' as requested by <@' + author.id + '>' : '' ) + strClosing } )
        .catch( async errLog => { await errHandler( errLog, { chanType: 'default', command: 'profilestats', guild: guild, type: 'logLogs' } ); } );
      }
      interaction.deleteReply();
    } )
    .catch( errSend => {
      console.error( 'Error sending /profilestats result to %s#%s:\n%o', guild.name, channel.name, errSend );
      if ( doLogs ) {
        chanError.send( { content: 'Error sending `/profilestats` result to <#' + channel.id + '>' + strClosing } )
        .catch( async errLog => { await errHandler( errLog, { chanType: 'error', command: 'profilestats', guild: guild, type: 'logLogs' } ); } );
      }
    } );    
  }
};