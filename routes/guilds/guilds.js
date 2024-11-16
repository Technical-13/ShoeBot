const express = require( 'express' );
const router = express.Router();
const Guilds = require( '../../models/GuildConfig.js' );

router.get( '/', ( req, res ) => {
  res.send( 'Looking for a guild?' );
} );

router.get( '/:guildId', ( req, res ) => {
  const { guildId } = req.params;
  const reqGuild = await Guilds.findOne( { _id: guildId } );
  res.send(`Are you looking for ${reqGuild.Guild.Name} with ${new Intl.NumberFormat().format( reqGuild.Guild.Members )} members?`);
} );

router.post( '/', ( req, res ) => {
  res.send( 'POST: guilds route' );
} );

module.exports = router;