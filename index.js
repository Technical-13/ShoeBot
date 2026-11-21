/**
 * @file index.js
 * @description Core entry point and initialization engine for ShoeBot "error-of-demogorgon" (v3).
 * Responsible for loading environment configurations, initializing the MongoDB persistence layer,
 * instantiating the Discord client with necessary intents/partials, and booting modular handlers.
 *
 * @project ShoeBot "error-of-demogorgon" (v3)
 * @see {@link  https://github.com/Technical-13/ShoeBot/tree/error-of-demogorgon | GitHub Repository Branch}
 *
 * @author Technical-13
 * @see {@link https://github.com/Technical-13 | Technical-13 (GitHub)}
 * @see {@link https://discord.com/users/440752068509040660/ | MagentaRV (Discord)}
 * @see {@link https://ddowiki.com/page/User:Technical_13 | Technical_13 (DDOwiki)}
 * @see {@link https://forums.ddo.com/index.php?members/shoemaker.2824/ | ShoeMaker (DDO Forums)}
 *
 * @license GNU-3
 *
 * @requires dotenv
 * @requires discord.js
 * @requires chalk
 * @requires fs
 */
require( 'dotenv' ).config();
const path = require( 'path' );
const root = path.resolve( __dirname );
const utils = require( './functions/utils.js' )();
const { buildPath } = utils;
const modData = buildPath( { ext: 'js', name: 'index' } );
const zettel = {
  bbeg: buildPath( { ext: 'js', name: 'errorHandler', type: 'functions' } ).path,
  config: buildPath( { ext: 'json', name: 'config' } ).path,
  db: buildPath( type: 'mongodb' ).path,
  discord: buildPath( { ext: 'js', name: 'clientDiscord', type: 'functions' } ).path,
  Err: buildPath( { ext: 'js', name: 'Err', type: 'functions' } ).path,
  i18n: buildPath( group: 'i18n', type: 'functions' ).path,
  initDB: buildPath( { ext: 'js', name: 'initialize', type: 'mongodb' } ).path,
  json: buildPath( type: 'jsonObjects' ).path,
  languages: buildPath( type: 'i18n' ).path,
  timeFormat: buildPath( { ext: 'json', name: 'time', type: 'jsonObjects' } ).path,
  utilities: buildPath( group: 'Utilities', type: 'functions' ).path,
  webDash: buildPath( { ext: 'js', name: 'server', type: 'webDashboard' } ).path,
};
const { EventEmitter } = require( 'events' );
const bot = {
  ascii: require( 'ascii-table' ),
  bbeg: require( zettel.bbeg ),
  buildPath: buildPath,
  chalk: require( 'chalk' ),
  config: require( zettel.config ),
  djs: require( 'discord.js' ),
  env: process.env,
  Err: require( zettel.Err ),
  events: new EventEmitter(),
  fs: require( 'fs' ),
  timeFormat: require( zettel.timeFormat ),
  utils: utils,
  z: zettel,
};
bot.events.setMaxListeners( 100 );
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
const dClient = require( z.discord );
const iDiscoBots = [];
const { personas } = config.discord;
personas.forEach( ego => { if ( ego.enabled ) { iDiscoBots.push( ego.idn ); } } );

require( z.initDB )().then( async () => {
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

//  require( z.webDash )();
} ).catch( errDB => {
  console.error( 'Failed to initialize database in %s: %o', chalk.hex( '#FFA500' ).bold( modData.path ), errDB );
  throw new Error( 'Start aborted.' );
} );//*/
