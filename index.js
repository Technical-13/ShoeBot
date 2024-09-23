const keepAlive = require( './functions/server' );
const objTimeString = require( './time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

const { Client, GatewayIntentBits, Partials, Collection } = require( 'discord.js' );
const client = new Client( {
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	], 
	partials: [ Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction ]
} );

const fs = require( 'fs' );
const config = require( './config.json' );
require( 'dotenv' ).config()

/* ------------------ COLLECTIONS ------------------ */
client.commands = new Collection()
client.aliases = new Collection()
client.events = new Collection();
client.slashCommands = new Collection();
client.prefix = config.prefix

module.exports = client;

fs.readdirSync( './handlers' ).forEach( ( handler ) => {
	require( `./handlers/${handler}` )( client )
} );

client.login( process.env.token );

keepAlive();
