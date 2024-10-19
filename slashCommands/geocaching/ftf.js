const logSchema = require( '../../models/GuildConfig.js' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType } = require( 'discord.js' );

module.exports = {
    name:'ftf',
    description: 'Tell someone how to get their FTF (First To Find) noticed on Project-GC.',
    options: [ {
        name: 'message-id',
        description: 'Paste message ID here',
        type: 3
    }, {
        name: 'target',
        description: 'Tag someone in response.',
        type: 6
    }, {
        name: 'language',
        name_localizations: {
            de: 'sprache',
            fi: 'kieli',
            fr: 'langue',
            no: 'språk',
            pl: 'język',
            'sv-SE': 'språk' },
        description: 'Language to give information in.',
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
            { name: 'Svenska/Swedish', value: 'sv-SE' } ],
        type: 3
    } ],
    type: ApplicationCommandType.ChatInput,
    cooldown: 1000,
    run: async ( client, interaction ) => {
        await interaction.deferReply();
        const { channel, guild, options } = interaction;
        const author = interaction.user;
        const botOwner = client.users.cache.get( process.env.OWNER_ID );
        const isBotOwner = ( author.id === botOwner.id ? true : false );
        const botMods = [];
        const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
        const objGuildMembers = guild.members.cache;
        const objGuildOwner = objGuildMembers.get( guild.ownerId );
        const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
        const arrAuthorPermissions = ( guild.members.cache.get( author.id ).permissions.toArray() || [] );
        var logChan = objGuildOwner;
        var logErrorChan = objGuildOwner;

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

        logSchema.findOne( { Guild: interaction.guild.id } ).then( async data => {
            if ( data ) {
                if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); }
                if ( data.Logs.Error ) { logErrorChan = guild.channels.cache.get( data.Logs.Error ); }
            }
            let setupPlease = ( logChan == objGuildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '----' );
            if ( msgID && isNaN( msgID ) ) {
                interaction.editReply( '`' + msgID + '` ' + i18InvalidMsgId[ locale ] );
            } else if ( msgID ) {
                channel.messages.fetch( msgID ).then( message => {
                    message.reply( '<@' + message.author.id + '>, ' + i18FTFinfo[ locale ] ).then( replied => {
                        logChan.send( 'I told <@' + message.author.id + '> about FTFs ' + strLocale + ' in <#' + channel.id + '> at <@' + author.id +'>\'s `/ftf` request in response to:\n```\n' +
                                     message.content + '\n```\n' + setupPlease )
                            .catch( noLogChan => { console.error( 'No msgID logChan.send error in ftf.js:\n%o', noLogChan ) } );
                    } ).catch( noMessage => {
                        interaction.editReply( i18NoMessage[ locale ] + ' ' + i18FTFinfo[ locale ] );
                        console.error( 'Unable to find message with ID:%o\n\t%o', msgID, noMessage );
                    } );
                } );
            } else if ( cmdInputUser ) {
                interaction.editReply( '<@' + cmdInputUser.id + '>, ' + i18FTFinfo[ locale ] ).then( replied => {
                    logChan.send( 'I told <@' + cmdInputUser.id + '> about FTFs at <@' + author.id +'>\'s `/ftf` request.\n' + setupPlease )
                        .catch( noLogChan => { console.error( 'No cmdInputUser logChan.send error in ftf.js:\n%o', noLogChan ) } );
                } );
            } else {
                interaction.editReply( i18FTFinfo[ locale ] ).then( replied => {
                    logChan.send( 'I told <@' + author.id + '> about FTFs via `/ftf` request.\n' + setupPlease )
                        .catch( noLogChan => { console.error( ' logChan.send error in ftf.js:\n%o', noLogChan ) } );
                } );
            }
        } );
    }
};
