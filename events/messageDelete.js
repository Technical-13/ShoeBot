const client = require( '..' );
const { Collection } = require( 'discord.js' );
const logSchema = require( '../models/GuildLogs.js' );
const { model, Schema } = require( 'mongoose' );

client.on( 'messageDelete', async message => {
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const { author, guild, channel } = message;
    const objGuildMembers = guild.members.cache;
    const objGuildOwner = objGuildMembers.get( guild.ownerId );
    var logChan = objGuildOwner;

    logSchema.findOne( { Guild: guild.id } ).then( async data => {
        if ( data ) {  if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); } }
        let setupPlease = ( logChan == objGuildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '----' );
        if ( logChan !== channel ) {
            var attachments = [];
            if ( message.attachments.size != 0 ) {
                message.attachments.each( attachment => {
                    let imageSize = attachment.size;
                    if ( imageSize > ( 1024 ** 3 ) ) {
                        imageSize = ( imageSize / ( 1024 ** 3 ) ).toFixed( 2 ) + 'gb ';
                    } else if ( imageSize > ( 1024 ** 2 ) ) {
                        imageSize = ( imageSize / ( 1024 ** 2 ) ).toFixed( 2 ) + 'mb ';
                    } else if ( imageSize > 1024 ) {
                        imageSize = ( imageSize / 1024 ).toFixed( 2 ) + 'kb ';
                    } else {
                        imageSize = imageSize + 'b ';
                    }
                    let thisAttachment = {
                        name: attachment.name,
                        attachment: attachment.attachment,
                        description: attachment.height + 'x' + attachment.width + 'px ' + imageSize + attachment.type + ( attachment.description ? ': ' + attachment.description : '.' )
                    }
                    attachments.push( thisAttachment );
                } );
            }
            const strAttachments = ( attachments.length == 0 ? 'no attachments' : attachments.length === 1 ? 'an attachment' : attachments.length + ' attchments' );
            const content = ( message.content ? ':\n```\n' + message.content + '\n```\n' : '.\n' );
            const msgContained = strAttachments + content;
            logChan.send( {
                content: ( author ? '<@' + author.id + '>\'s' : 'A' ) + ' message in <#' + channel.id + '> was deleted with ' + msgContained + setupPlease,
                files: ( attachments.length === 0 ? null : attachments )
            } ).catch( noLogChan => { console.error( 'logChan.send error:\n%o', noLogChan ) } );
        }
    } ).catch( err => { console.error( 'Encountered an error running messageDelete.js from %s:\n\t%o', guild.name, err ); } );
} );