const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/geocaching/ftf.js' );

module.exports = {
  name:'ftf',
  group: 'geocaching',
  description: 'Tell someone how to get their FTF (First To Find) noticed on Project-GC.',
  options: [// message-id, target, language
    { type: 3, name: 'message-id', description: 'Paste message ID here' },
    { type: 6, name: 'target', description: 'Tag someone in response.' },
    { type: 3, name: 'language', description: 'Language to give information in.',
      name_localizations: {
        de: 'sprache',
        fi: 'kieli',
        fr: 'langue',
        no: 'språk',
        pl: 'język',
        'sv-SE': 'språk' },
      description_localizations: {
        de: 'Sprache, um Informationen zu geben.',
        fi: 'Kieli, jolla tiedot annetaan.',
        fr: 'Langue dans laquelle donner des informations.',
        no: 'Språk å gi informasjon på.',
        pl: 'Język, w którym należy podawać informacje.',
        'sv-SE': 'Språk att ge information på.' },
      choices: [
        { name: 'Deutsch/German', value: 'de' },
        { name: 'English (default)', value: 'en' },
        { name: 'Suomi/Finnish', value: 'fi' },
        { name: 'Français/French', value: 'fr' },
        { name: 'Norsk/Norwegian', value: 'no' },
        { name: 'Polski/Polish', value: 'pl' },
        { name: 'Svenska/Swedish', value: 'sv-SE' }
      ]
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const msgID = options.getString( 'message-id' );
      const cmdInputUser = options.getUser( 'target' );
      const localeInput = options.getString( 'language' );

      const objLocales = {
        de: 'Deutsch/German',
        en: 'English',
        fi: 'Suomi/Finnish',
        fr: 'Français/French',
        no: 'Norsk/Norwegian',
        pl: 'Polski/Polish',
        'sv-SE': 'Svenska/Swedish'
      };
      var getLocale = 'en';
      switch ( interaction.locale ) {
        case 'de' :
        case 'fi' :
        case 'fr' :
        case 'no' :
        case 'pl' :
        case 'sv-SE' : getLocale = interaction.locale; break;
        case 'en-US' :
        case 'en-GB' :
        default : getLocale = 'en';
      }
      const locale = ( localeInput || getLocale );
      const strLocale = '(*' + objLocales[ locale ] + '*)';
      const i18InvalidMsgId = {
        de: 'ist keine gültige Nachrichten-ID.',
        en: 'is not a valid message-id.',
        fi: 'ei ole kelvollinen viestin tunnus.',
        fr: 'n\'est pas un identifiant de message valide.',
        no: 'er ikke en gyldig meldings-ID.',
        pl: 'nie jest prawidłowym identyfikatorem wiadomości.',
        'sv-SE': 'är inte ett giltigt meddelande-id.'
      };
      const i18FTFinfo = {
        de: 'Es gibt zwei Möglichkeiten über die Project-GC deine FTFs finden kann. Entweder markierst du deine Logs mit einem dieser Markierungen: `{*FTF*}` `{FTF}` `[FTF]`. Alternativ kannst du eine FTF-Bookmark Liste in den Einstellungen (<https://project-gc.com/User/Settings/>) hinzufügen - diese wird dann einmal täglich überprüft. Bitte berücksichtige, dass FTF nichts offizielles ist und nicht jeder seine FTFs markiert. Deshalb wird diese Liste nie 100% genau sein.',
        en: 'There are two ways for Project-GC to detect your FTFs (**F**irst **T**o **F**inds). Either you tag your logs with one of these tags: `{*FTF*}`, `{FTF}`, or `[FTF]`. Alternatively you can add an FTF bookmark list under Settings (<https://project-gc.com/User/Settings/>) that will be checked once per day. Please understand that FTF isn\'t anything offical and not everyone tags their FTFs. Therefore this list won\'t be 100% accurate.',
        fi: 'Project-GC tunnistaa FTF-löytöjä kahdella tavalla. Voit merkitä lokisi jollakin seuraavista tunnisteista: `{*FTF*}` `{FTF}` `[FTF]`. Vaihtoehtoisesti voit lisätä FTF-löytösi kirjanmerkkilistaan ja linkittää sen Asetuksissa (<https://project-gc.com/User/Settings/>). Lista tarkistetaan kerran päivässä. Huomioithan että FTF ei ole virallinen termi, eivätkä kaikki kirjaa heidän FTFiä, joten tämä lista ei ole täsmällinen.',
        fr: 'Il existe deux manières pour Project-GC de détecter vos FTF. Vous pouvez utiliser un de ces tags dans vos logs : `{*FTF*}` `{FTF}` `[FTF]`. Vous pouvez également ajouter une liste de FTF sous Configuration (<https://project-gc.com/User/Settings/>) qui seront vérifiés une fois par jour. Comprenez bien que les FTFs n\'ont rien d\'officiels et que tout le monde ne tague pas ses FTFs. C\'est pourquoi cette liste ne sera pas fiable à 100 %.',
        no: 'Det er to måter Project-GC kan finne FTF-ene dine på. Enten merker du dine logger med en av disse: `{*FTF*}` `{FTF}` `[FTF]`. Eller så kan du legge til en FTF-bokmerkeliste under Innstillinger (<https://project-gc.com/User/Settings/>) som vil bli sjekket en gang om dagen. Husk at FTF ikke er noe offisielt, og at ikke alle markerer FTF-ene sine. Derfor vil ikke denne listen være 100 % nøyaktig.',
        pl: 'Project-GC wykrywa wpisy FTF na dwa różne sposoby. Możesz oznaczyć swoje wpisy jednym z tagów: `{*FTF*}` `{FTF}` `[FTF]`. Albo w Ustawieniach (<https://project-gc.com/User/Settings/>) możesz wybrać listę zakładek z wpisami FTF, która będzie sprawdzana raz dziennie. Proszę zrozumieć, że FTF nie jest niczym oficjalnym i nie każdy oznacza swoje FTFy. Dlatego ta lista nie jest w 100% dokładna.',
        'sv-SE': 'Det finns två sätt för Project-GC att upptäcka dina FTF:er. Antingen taggar du din logg med någon av dessa taggar: `{*FTF*}` `{FTF}` `[FTF]`. Eller så kan du lägga till en lista med dina FTF:er under Inställningar (<https://project-gc.com/User/Settings/>), den kommer att kontrolleras av sidan en gång per dag. Det är viktigt att inse att FTF inte är en officiell term och att det inte är alla som taggar sina FTF-loggar på vedertaget sätt. Därför kommer denna lista aldrig att vara 100% korrekt.'
      };
      const i18NoMessage = {
        de: 'Es kann keine bestimmte Nachricht gefunden werden, auf die geantwortet werden kann.',
        en: 'Unable to find specific message to respond to.',
        fi: 'Ei löydy tiettyä viestiä, johon vastata.',
        fr: 'Impossible de trouver un message spécifique auquel répondre.',
        no: 'Finner ikke spesifikk melding å svare på.',
        pl: 'Nie można znaleźć konkretnej wiadomości, na którą można odpowiedzieć.',
        'sv-SE': 'Det gick inte att hitta ett specifikt meddelande att svara på.'
      };

      const { doLogs, chanDefault, chanError, strClosing } = await getGuildConfig( guild );
      if ( msgID && !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` ' + i18InvalidMsgId[ locale ] } ); }
      else if ( msgID ) {
        channel.messages.fetch( msgID )
        .then( message => {
          const { author: msgAuthor, content } = message;
          message.reply( { content: '<@' + msgAuthor.id + '>, ' + i18FTFinfo[ locale ] } )
          .then( replied => {
            if ( doLogs && author.id != msgAuthor.id ) {
              chanDefault.send( { content:
                'I told <@' + msgAuthor.id + '> about FTFs ' + strLocale + ' in <#' + channel.id + '> at <@' + author.id +
                '>\'s `/ftf` request in response to:\n```\n' + content + '\n```' + strClosing } )
              .then( sentLog => { interaction.deleteReply(); } )
              .catch( async errLog => { await errHandler( errLog, { chanType: 'default', command: 'ftf', channel: channel, type: 'logLogs' } ); } );
            }
            else { interaction.deleteReply(); }
          } )
          .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: 'ftf', doLog: doLogs, guild: guild, msgID: msgID, type: 'errSend' } ) ); } );
        } )
        .catch( async errFetch => { interaction.editReply( await errHandler( errFetch, { command: 'ftf', msgID: msgID, type: 'errFetch' } ) ); } );
      }
      else if ( cmdInputUser ) {
        interaction.editReply( { content: '<@' + cmdInputUser.id + '>, ' + i18FTFinfo[ locale ] } ).then( replied => {
          if ( doLogs && cmdInputUser.id != author.id ) {
            chanDefault.send( { content: 'I told <@' + cmdInputUser.id + '> about FTFs at <@' + author.id +'>\'s `/ftf` request.' + strClosing } )
            .catch( async errLog => { interaction.editReply( await errHandler( errLog, { chanType: 'default', command: 'ftf', channel: channel, type: 'logLogs' } ) ); } );
          }
        } );
      }
      else {
        interaction.editReply( { content: i18FTFinfo[ locale ] } ).catch( noReply => {
          if ( doLogs ) {
            chanError.send( { content: 'Error telling <@' + author.id + '> about FTFs via `/ftf` request.' + strClosing } )
            .catch( async errLog => { interaction.editReply( await errHandler( errLog, { chanType: 'error', command: 'ftf', channel: channel, type: 'logLogs' } ) ); } );
          }
        } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};