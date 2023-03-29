// Source and more info:
// https://discordjs.guide/slash-commands
const { SlashCommandBuilder } = require( '@discordjs/builders' );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );
const clientId = '501574812687400960';

const commands = [
	new SlashCommandBuilder()
    .setName( 'foo' )
    .setDescription( 'Foo Bar Baz - Testing command' ),
	new SlashCommandBuilder()
    .setName( 'lmgt' )
    .setDescription( 'Let Me Google That for you...' )
    .addStringOption( option =>
      option.setName( 'query' )
      .setDescription( 'What you want to search for.' )
      .setRequired( true ) )
    .addUserOption( option =>
      option.setName( 'target' )
      .setDescription( 'Tag someone in response.' ) ),
	new SlashCommandBuilder()
    .setName( 'ping' )
    .setDescription( 'Replies with the bot\'s ping!' ),
  new SlashCommandBuilder()
    .setName( 'react' )
    .setDescription( 'Make bot react to a message.' )
    .addStringOption( option =>
      option.setName( 'message-id' )
        .setDescription( 'Paste message ID here.' )
        .setRequired( true ) )
    .addStringOption( option =>
      option.setName( 'reaction' )
        .setDescription( 'How do you want me to react?' )
        .setRequired( true ) ),
  new SlashCommandBuilder()
    .setName( 'reply' )
    .setDescription( 'Make bot respond to message.' )
    .addStringOption( option =>
      option.setName( 'message-id' )
        .setDescription( 'Paste message ID here.' )
        .setRequired( true ) )
    .addStringOption( option =>
      option.setName( 'response' )
        .setDescription( 'What do you want me to say in response?' )
        .setRequired( true ) ),
	new SlashCommandBuilder()
    .setName( 'roll' )
    .setDescription( 'Dice Roller!' )
    .addIntegerOption( option =>
      option.setName( 'dice' )
      .setDescription( 'How many dice? (default: 1)' ) )
    .addIntegerOption( option =>
      option.setName( 'sides' )
      .setDescription( 'How many sides per die? (default: 6)' ) )
    .addIntegerOption( option =>
      option.setName( 'sets' )
      .setDescription( 'How many sets of dice? (default: 1)' ) )
    .addIntegerOption( option =>
      option.setName( 'modifier' )
      .setDescription( '± to final roll for each die? (default: 0)' ) ),
  new SlashCommandBuilder()
    .setName( 'say' )
    .setDescription( 'Make bot speak.' )
    .addStringOption( option =>
      option.setName( 'saying' )
        .setDescription( 'What do you want me to say?' )
        .setRequired( true ) )
    .addChannelOption( option =>
      option.setName( 'channel' )
        .setDescription( 'Where do you want me to say it? (default: current channel)' ) ),
  new SlashCommandBuilder()
    .setName( 'setup-log' )
    .setDescription( 'Set up log channels for this server.' )
    .addSubcommand( subcommand => subcommand
      .setName( 'default' )
      .setDescription( 'Channel to log all requests.' )
      .addChannelOption( option => option
        .setName( 'default-channel' )
        .setDescription( 'Default channel for all logs.' ) ) )
    .addSubcommand( subcommand => subcommand
      .setName( 'react' )
      .setDescription( 'Channel to log `/react` requests.' )
      .addChannelOption( option => option
        .setName( 'react-channel' )
        .setDescription( 'Select channel:' )
        .setRequired( true ) ) )
    .addSubcommand( subcommand => subcommand
      .setName( 'reply' )
      .setDescription( 'Channel to log `/reply` requests.' )
      .addChannelOption( option => option
        .setName( 'reply-channel' )
        .setDescription( 'Select channel:' )
        .setRequired( true ) ) )
    .addSubcommand( subcommand => subcommand
      .setName( 'say' )
      .setDescription( 'Channel to log `/say` requests.' )
      .addChannelOption( option => option
        .setName( 'say-channel' )
        .setDescription( 'Select channel:' )
        .setRequired( true ) ) ),	
  new SlashCommandBuilder()
    .setName( 'setup-welcome' )
    .setDescription( 'Set up your welcome message for this server.' )
    .addChannelOption( option =>
      option.setName( 'channel' )
        .setDescription( 'Channel for welcomes?' )
        .setRequired( true ) )
    .addStringOption( option =>
      option.setName( 'welcome-message' )
        .setDescription( 'Welcoming message?' )
        .setRequired( true ) )
    .addRoleOption( option =>
      option.setName( 'welcome-role' )
        .setDescription( 'Welcome role?' ) ),
  new SlashCommandBuilder()
    .setName( 'setup' )
    .setNameLocalizations( {
      de: 'aufstellen' } )
    .setDescription( 'Setup the bot for your server.' )
    .setDescriptionLocalizations( {
      de: 'Richten Sie den Bot für Ihren Server ein.' } )
    .addSubcommand( subcommand => subcommand
      .setName( 'welcome' )
      .setNameLocalizations( {
        de: 'willkommen' } )
      .setDescription( 'Set up your welcome message for this server.' )
      .setDescriptionLocalizations( {
        de: 'Richten Sie Ihre Willkommensnachricht für diesen Server ein.' } ) )
    .addSubcommand( subcommand => subcommand
      .setName( 'logs' )
      .setNameLocalizations( {
        de: 'protokolle' } )
      .setDescription( 'Set up log channels for this server.' )
      .setDescriptionLocalizations( {
        de: 'Protokollkanäle für diesen Server einrichten.' } )
      .addStringOption( option => option
        .setName( 'log-type' )
        .setNameLocalizations( {
          de: 'protokolltyp' } )
        .setDescription( 'What type of log do you want to set the channel for?' )
        .setDescriptionLocalizations( {
          de: 'Für welche Art von Protokoll möchten Sie den Kanal festlegen?' } )
        .addChoices(
          { name: 'All logs', nameLocalizations: {
            de: 'Alle Protokolle'
          }, value: 'default' },
          { name: 'Requests to /react', nameLocalizations: {
            de: 'Anfragen zu /Reagieren'
          }, value: 'react' },
          { name: 'Requests to /reply', nameLocalizations: {
            de: 'Bitten um /Antwort'
          }, value: 'reply' },
          { name: 'Requests to /say', name_localizations: {
            de: 'Anfragen zu /sagen'
          }, value: 'say' } )
        .setRequired( true ) )
      .addChannelOption( option => option
        .setName( 'channel' )
        .setNameLocalizations( {
          de: 'sender' } )
        .setDescription( 'Channel to send logs.' )
        .setDescriptionLocalizations( {
          de: 'Kanal zum Senden von Protokollen.' } )
        .setRequired( true ) ) )
].map( command => command.toJSON() );

const rest = new REST( { version: '9' } ).setToken( process.env.token );

rest.put( Routes.applicationCommands( clientId ), { body: commands } )
	.then( () => console.log( 'Successfully registered application commands.' ) )
	.catch( errPutRest => console.error( errPutRest.stack ) );

/*
Discord uses slash commands now, meaning all commands must be preconfigured and sent to Discord. The way this works is by adding this file which allows you to set up your files then send them. Read the link above, and enter command data before running this command in shell to get the commands to be published:

node deployCommands.js

*/