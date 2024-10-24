const client = require( '..' );
const chalk = require( 'chalk' );

client.on( 'ready', async rdy => {
  const today = ( new Date() );
  const objTimeString = {"hour":"2-digit","hourCycle":"h24","minute":"2-digit","second":"2-digit","timeZone":"America/New_York","timeZoneName":"short"};
  const botTime = today.toLocaleTimeString( 'en-US', objTimeString );
  console.log( chalk.bold( `The bot owner's local time is ${botTime}.` ) );
  const hour = parseInt( botTime.split( ':' )[ 0 ] );
  const myTime = ( hour >= 5 && hour < 12 ? 'morning' : ( hour >= 12 && hour < 18 ? 'evening' : 'nighttime' ) );
  const myCup = ( hour >= 5 && hour < 12 ? 'my ' : ( hour >= 12 && hour < 18 ? 'an ' : 'a ' ) ) + myTime;
  const activityTypes = { 'playing': 0, 'streaming': 1, 'listening': 2, 'watching': 3, 'custom': 4, 'competing': 5 };
  client.user.setPresence( { activities: [ { type: activityTypes.custom, name: '🥱 Just waking up...' } ], status: 'dnd' } );
  setTimeout( () => { client.user.setPresence( { activities: [ { type: activityTypes.watching, name: 'my ' + myTime + ' coffee brew...' } ], status: 'dnd' } ); }, 15000 );
  setTimeout( () => { client.user.setPresence( { activities: [ { type: activityTypes.custom, name: 'Drinking ' + myCup + ' cup of ☕' } ], status: 'idle' } ); }, 60000 );
  setTimeout( () => { client.user.setPresence( { activities: [ { type: activityTypes.custom, name: 'https://discord.me/Geocaching' } ], status: 'online' } ); }, 180000 );

  console.log( chalk.bold.magentaBright( `Successfully logged in as: ${client.user.tag}` ) );
} );