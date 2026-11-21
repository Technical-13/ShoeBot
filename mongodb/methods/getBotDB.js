const modData = { ext: 'js', name: 'getBotDB', platform: 'methods', type: 'mongodb' };
const bot = require( process.cwd() );
const { buildPath, chalk, config, env, Err } = bot;
const getLangs = require( buildPath( { ext: 'js', group: 'i18n', name: 'getLanguages', type: 'functions' } ).path );
const botConfig = require( buildPath( { ...modData, group: 'Bot', name: 'BotConfig', platform: 'models' } ).path );
const { limit, load, loadForcedCreate, ver } = config.dbData;
const newBotConfig = {
  _id: load,
  Languages: getLangs(),
  Name: ( config.name ),
  Owner: /* TBD */,
  Personas: [ /* TBD */ ],
  Platforms: { /* TBD */ },
  WebDash: { /* TBD */ },
  Verbosity: ( config.verbosity ?? -1 ),
  Version: ver.BotConfig,
};
const updateBotConfig = async ( loadBot ) => {
  if ( loadForcedCreate ) { console.info( 'Ignoring unnecessary `loadForcedCreate` setting.' ); }
  const currConfig = await botConfig.findById( loadBot );
  if ( currConfig.Version?.getTime() === ver.BotConfig.getTime() ) { return currConfig; }
  else {
    const updatedBotConfig = { ...newBotConfig, _id: loadBot };
    if ( currConfig.Languages !== updatedBotConfig.Languages ) { updatedBotConfig.Languages = currConfig.Languages; }
    if ( currConfig.Name !== updatedBotConfig.Name ) { updatedBotConfig.Name = currConfig.Name; }
    if ( currConfig.Owner !== updatedBotConfig.Owner ) { updatedBotConfig.Owner = currConfig.Owner; }
    if ( currConfig.Personas !== updatedBotConfig.Personas ) { updatedBotConfig.Personas = currConfig.Personas; }
    if ( currConfig.Platforms !== updatedBotConfig.Platforms ) { updatedBotConfig.Platforms = currConfig.Platforms; }
    if ( currConfig.WebDash !== updatedBotConfig.WebDash ) { updatedBotConfig.WebDash = currConfig.WebDash; }
    if ( currConfig.Verbosity !== updatedBotConfig.Verbosity ) { updatedBotConfig.Verbosity = currConfig.Verbosity; }
    return await botConfig.updateOne( { _id: loadBot }, updatedBotConfig, { upsert: true } )
      .then( updateSuccess => { return updatedBotConfig; } )
      .catch( updateError => { throw new Err( chalk.bold.cyan.inverse( 'Error attempting to update bot config in my database:' ), updateError ); } );
  }
};

module.exports = async () => {
  try {
    const botIDs = await botConfig.distinct( '_id' );
    if ( botIDs.length > limit ) {
      console.warn( 'Warning: The BotConfig DB Table exceeds the expected limit of %s entries: %o\nPlease either remove %s entr%s from the table or increase the `dbData.limit` in `config.json` to `"limit": %d,`.', chalk.bold( limit ), botIDs, ( botIDs.length - limit ), ( botIDs.length - limit === 1 ? 'y' : 'ies' ), botIDs.length );
    }
    if ( botIDs.indexOf( load ) !== -1 ) { return await updateBotConfig( load ); }
    const likeIDs = [];
    botIDs.forEach( id => { if ( id.toUpperCase() === load.toUpperCase() ) { likeIDs.push( id ); } } );
    if ( likeIDs.length > 1 && !loadForcedCreate ) {
      throw new Err( 'No exact match for `' + load + '` and too many case insensitive similar matches. Aborting initialization.', { botIDs: botIDs, likeIDs: likeIDs } );
    }
    if ( likeIDs.length === 1 && !loadForcedCreate ) {
      console.warn( 'Loading `%s` in lieu of `%s`.\nPlease check `config.json` `dbData.load` and fix it or…\n…if you intentionally want two DB entries with only a case difference, change:\n\t`"load": "%s",`\nto:\n\t`"load": "%s", "loadForcedCreate": true,`', likeIDs[ 0 ], load, load, load );
      return await updateBotConfig( likeIDs[ 0 ] );
    }
    if ( botIDs.length === limit ) {
      console.warn( 'Notice: Creating this %s entry in the BotConfig DB Table exceeds the expected limit of %s entries: %o\nPlease either remove an entry from the table or increase the `dbData.limit` in `config.json` to `"limit": %d,`.', chalk.bold( load ), chalk.bold( limit ), ( limit + 1 ) );
    }
    console.log( 'Initializing bot "load: %s" in database...', load );
    return await botConfig.create( newBotConfig )
      .then( initSuccess => { console.log( chalk.bold.greenBright( 'Bot configuration initialized in my database.' ) ); return newBotConfig; } )
      .catch( initError => { throw new Err( chalk.bold.cyan.inverse( 'Error attempting to initialize bot configuration in my database:', initError ) ); } );
  }
  catch ( errObject ) {
    console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( buildPath( modData ) ), errObject.stack );
    throw new Err( 'Unable to initialize bot database.', errObject );
  }
};
