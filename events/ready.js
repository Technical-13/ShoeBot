const Discord = require( 'discord.js' );
const chalk = require( 'chalk' );
const mongoose = require( 'mongoose' );

module.exports = {
	name: 'ready',
	once: true,
	async run( client ) {
    const myOwner = client.users.cache.get( process.env.OWNERID );
    
    mongoose.set( 'strictQuery', false );
    client.user.setActivity( 'with bot code', { type: 'PLAYING' } );
    mongoose.disconnect( () => console.log( chalk.yellow( 'MongoDB closed.' ) ) );
    await mongoose.connect( process.env.mongodb || '', { keepAlive: true } )
      .then( connected => { console.log( chalk.green( 'Connected to MongoDB.' ) ); } )
      .catch( errDB => {
        myOwner.send( 'Failed to connect to MongoDB:\n```\n' + errDB + '\n```' )
          .catch( errSend => { console.error( chalk.red( `Unable to send DM:\n${errSend}` ) ); } );
        console.error( chalk.red( `Failed to connect to MongoDB:\n${errDB}` ) );
      } );
    
    console.log( chalk.green( `Successfully logged in as: ${client.user.tag}` ) ) );
	}
}
