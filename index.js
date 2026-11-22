/**
 * @file index.js
 * @description Core entry point and initialization engine for ShoeBot "error-of-demogorgon" (v3).
 * Responsible for loading environment configurations, initializing the MongoDB persistence layer,
 * instantiating the Discord client with necessary intents/partials, and booting modular handlers.
 *
 * @project ShoeBot "error-of-demogorgon" (v3)
 * @see { @link  https://github.com/Technical-13/ShoeBot/tree/error-of-demogorgon | GitHub Repository Branch }
 *
 * @author Technical-13
 * @see { @link https://github.com/Technical-13 | Technical-13 (GitHub) }
 * @see { @link https://discord.com/users/440752068509040660/ | MagentaRV (Discord) }
 * @see { @link https://ddowiki.com/page/User:Technical_13 | Technical_13 (DDOwiki) }
 * @see { @link https://forums.ddo.com/index.php?members/shoemaker.2824/ | ShoeMaker (DDO Forums) }
 *
 * @license GNU-3
 *
 * @requires dotenv
 * @requires chalk
 */
require( 'dotenv' ).config();
const utils = require( './functions/utils.js' )();
const { buildPath } = utils;
const modData = buildPath( { ext: 'js', name: 'index' } );
const zettel = {
//  bbeg: buildPath( { ext: 'js', name: 'errorHandler', type: 'functions' } ),
  config: buildPath( { ext: 'json', name: 'config' } ),
  contacts: buildPath( { ext: 'json', name: 'contacts', type: 'jsonObjects' } ),
  db: buildPath( { type: 'mongodb' } ),
//  discord: buildPath( { ext: 'js', name: 'clientDiscord', type: 'functions' } ),
  Err: buildPath( { ext: 'js', name: 'Err', type: 'functions' } ),
  i18n: buildPath( { group: 'i18n', type: 'functions' } ),
  initDB: buildPath( { ext: 'js', name: 'initialize', type: 'mongodb' } ),
  json: buildPath( { type: 'jsonObjects' } ),
  languages: buildPath( { type: 'i18n' } ),
  timeFormat: buildPath( { ext: 'json', name: 'time', type: 'jsonObjects' } ),
  utilities: buildPath( { group: 'Utilities', type: 'functions' } ),
//  webDash: buildPath( { ext: 'js', name: 'server', type: 'webDashboard' } ),
};
const { EventEmitter } = require( 'events' );
const bot = {
  ascii: require( 'ascii-table' ),
//  bbeg: require( zettel.bbeg.path ),
  buildPath: buildPath,
  chalk: require( 'chalk' ),
  config: require( zettel.config.path ),
  djs: require( 'discord.js' ),
  env: process.env,
  Err: require( zettel.Err.path ),
  events: new EventEmitter(),
  fs: require( 'fs' ),
  timeFormat: require( zettel.timeFormat.path ),
  utils: utils,
  z: zettel,
};
bot.events.setMaxListeners( bot.config.maxEvents ?? 10 );
module.exports = bot;
const { chalk, config, env, fs, z } = bot;
Object.entries( config.dbData.ver ).forEach( ( [ key, value ] ) => {
  let newDate = new Date( value );
  if ( Number.isNaN( newDate.getTime() ) ) {
    newDate = new Date( 0 );
    console.error( 'config.dbData.ver.%s value of `%o` could not be coerced into a valid Date.\n\tDefaulting to %o', key, value, newDate );
  }
  config.dbData.ver[ key ] = newDate;
} );

/*
const dClient = require( z.discord.path );
const iDiscoBots = [];
const { personas } = config.discord;
personas.forEach( ego => { if ( ego.enabled ) { iDiscoBots.push( ego.idn ); } } );

require( z.initDB.path )().then( async () => {
  console.log( '%s', chalk.hex( '#00DD00' ).bold( 'Database initialization sequence completed successfully.' ) );

  const discord = {};
  for ( const sEgo of iDiscoBots ) {
    const persona = personas.find( p => p.idn === sEgo );
    discord[ sEgo ] = await dClient( persona );
    if ( !discord[ sEgo ] ) {
      console.error( '%s %s', chalk.hex( '#CC0000' )( 'Failed to initialize Discord client:' ), chalk.hex( '#FF5555' ).bold( persona.botName ) );
    }
  }
  bot.discord = discord;

//  require( z.webDash.path )();
} ).catch( errDB => {
  console.error( 'Failed to initialize database in %s: %o', chalk.hex( '#FFA500' ).bold( modData.path ), errDB );
  throw new Error( 'Start aborted.' );
} );//*/
