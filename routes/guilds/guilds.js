require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
const express = require( 'express' );
const router = express.Router();
const Guilds = require( '../../models/GuildConfig.js' );
const htmlGuild = fs.readFileSync( './routes/guilds/guild.html' );
const htmlGuilds = fs.readFileSync( './routes/guilds/guilds.html' );

router.get( '/', async ( req, res ) => {
  const pageGuilds = cheerio.fromBuffer( htmlGuilds );
  pageGuilds( 'title' ).text( 'Guilds | ' + bot );
  const allGuilds = await Guilds.find();
  for ( let dbGuild of allGuilds ) {
    pageGuilds( '#guild-select' ).append( '<option value="' + dbGuild._id + '">' + dbGuild.Guild.Name + '</option>' );
  }
  res.send( pageGuilds );
} );

router.get( '/:guildId', async ( req, res ) => {
  const { guildId } = req.params;
  const reqGuild = await Guilds.findOne( { _id: guildId } );
  if ( reqGuild ) {
    res.send(`Are you looking for ${reqGuild.Guild.Name} with ${new Intl.NumberFormat().format( reqGuild.Guild.Members )} members?`);
  }
  else {
    res.send(`Guild id ${guildId} doesn't seem to be in my database.`);
  }
} );

router.post( '/', ( req, res ) => {
  res.send( 'POST: guilds route' );
} );

module.exports = router;