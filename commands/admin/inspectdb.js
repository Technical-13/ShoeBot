const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const botConfig = require( '../../models/GuildLogs.js' );

module.exports = {
    name: 'inspectdb',
    description: 'Inspect my database.',
    ownerOnly: true,
    cooldown: 1000,
    run: async ( client, message, args ) => {
        const author = message.author;
        const botOwner = client.users.cache.get( process.env.OWNER_ID );
        const isBotOwner = ( author.id === botOwner.id ? true : false );
        if ( isBotOwner ) {
            message.delete();
            botConfig.find().then( entries => {
                botOwner.send( 'Sending you the DB details of my ' + entries.length + ' guilds.' ).catch( errSend => {
                    console.error( 'Error trying to show contents of the DB as you requested.\n%o', errSend );
                } );
                entries.forEach( ( entry, i ) => {
                    setTimeout( async () => {
                        const guildId = entry.Guild;
                        const guild = client.guilds.cache.get( guildId );
    					const objGuildOwner = guild.members.cache.get( guild.ownerId );
                        const guildName = guild.name;
                        const chanWidget = guild.widgetChannelId;
                        const chanRules = guild.rulesChannelId;
                        const chanPublicUpdates = guild.publicUpdatesChannelId;
                        const chanSafetyAlerts = guild.safetyAlertsChannelId;
                        const chanSystem = guild.systemChannelId;
                        const chanFirst = guild.channels.cache.first().id;
                        const chanInvite = ( chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
                        const chanLinkUrl = 'https://discordapp.com/channels/' + guildId + '/' + chanInvite;
                        const guildInvite = await guild.invites
                        .create( chanInvite, {
                            maxAge: 300, maxUses: 1, reason: 'Single use invite for my botmod, ' + author.displayName + '.  Expires in 5 minutes if not used.'
                        } ).then( invite => { return 'https://discord.gg/invite/' + invite.code; } ).catch( errCreateInvite => {
                            switch ( errCreateInvite.code ) {
                                case 50013://Missing permissions
                                    objGuildOwner.send( 'Help!  Please give me `CreateInstantInvite` permission in ' + chanLinkUrl + '!' ).catch( errSendGuildOwner => {
                                        console.error( 'Unable to DM guild owner, %s, for %s to get `CreateInstantInvite` permission:\n%o', objGuildOwner.displayName, guildName, errSendGuildOwner );
                                    } );
                                    break;
                                default:
                                    console.error( 'Unable to create an invite for %s:\n%o', guildName, errCreateInvite );
                                    return null;
                            }
                        } );
                        const logDefaultId = entry.Logs.Default;
                        const logErrorId = entry.Logs.Error;
                        const logChatId = entry.Logs.Chat;
                        botOwner.send( {
                            content: guildName + ' (:id: ' + guildId + ')' +
                            '\n\tSingle Use Invite: ' + ( guildInvite ? guildInvite : ':scream: ' + chanLinkUrl ) +
                            '\n\tGuild Owner: <@' + guild.ownerId + '>' +
                            '\n\tDefault Log Channel: <#' + logDefaultId + '>' +
                            '\n\tError Log Channel: <#' + logErrorId + '>' +
                            '\n\tChat Log Channel: <#' + logChatId + '>'
                        } ).catch( errSend => { console.error( 'Error trying to show contents of the DB as you requested.\n%o', errSend ); } );//*/
                    }, i*2000 );
                } );
            } ).catch( err=> { console.error( 'Error trying to inspect botConfig.DB:\n%o', err ); } );
        }
    }
};