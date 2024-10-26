const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );

client.on( 'ready', async rdy => {
  const activityTypes = { 'Playing': 0, 'Streaming': 1, 'Listening': 2, 'Watching': 3, 'Custom': 4, 'Competing': 5 };
  await client.user.setPresence( { activities: [ { type: activityTypes.Custom, name: '🥱 Just waking up...' } ], status: 'dnd' } );

  const today = ( new Date() );
  const objTimeString = {"hour":"2-digit","hourCycle":"h24","minute":"2-digit","second":"2-digit","timeZone":"America/New_York","timeZoneName":"short"};
  const botTime = today.toLocaleTimeString( 'en-US', objTimeString );
  console.log( chalk.bold( `The bot owner's local time is ${botTime}.` ) );
  const hour = parseInt( botTime.split( ':' )[ 0 ] );
  const myTime = ( hour >= 5 && hour < 12 ? 'morning' : ( hour >= 12 && hour < 18 ? 'evening' : 'nighttime' ) );
  const myCup = ( hour >= 5 && hour < 12 ? 'my ' : ( hour >= 12 && hour < 18 ? 'an ' : 'a ' ) ) + myTime;
  setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes.Watching, name: 'my ' + myTime + ' coffee brew...' } ], status: 'dnd' } ); }, 15000 );
  setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes.Custom, name: 'Drinking ' + myCup + ' cup of ☕' } ], status: 'idle' } ); }, 60000 );
  const firstActivity = config.activities[ 0 ];
  setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes[ firstActivity.type ], name: firstActivity.name } ], status: 'online' } ); }, 180000 );

  const servingGuilds = [ { type: 'Watching', name: client.guilds.cache.size + ' servers.' } ];
  const servingUsers = [ { type: 'Listening', name: client.users.cache.size + ' members.' } ];
  const cycleActivities = [].concat( config.activities, servingGuilds, servingUsers );
  const intActivities = cycleActivities.length;
  var iAct = 1;
  setInterval( async () => {
    let activityIndex = ( iAct++ % intActivities );
    let thisActivity = cycleActivities[ activityIndex ];
    await client.user.setPresence( { activities: [ { type: activityTypes[ thisActivity.type ], name: thisActivity.name } ], status: 'online' } );
  }, 300000 );

  console.log( chalk.bold.magentaBright( `Successfully logged in as: ${client.user.tag}` ) );
} );