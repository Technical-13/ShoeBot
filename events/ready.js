// The ready event is what will run when the repl starts and the bot successfully connects. 
// At the moment, it is configured to just announce success.

const Discord = require( 'discord.js' );
const mongoose = require( 'mongoose' );

module.exports = {
	name: 'ready',
	once: true,
	async run( client ) {
    await mongoose.connect( process.env.mongodb || '', { keepAlive: true } );
    if ( mongoose.connect ) {
      console.log( 'MongoDB: %o', mongoose.ip );
      console.log( 'Connected to MongoDB on: ' + mongoose.connect.ip );
    }
    
    console.log( 'Successfully logged in as: ' + client.user.tag );
	}
}