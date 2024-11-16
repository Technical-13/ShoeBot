const express = require( 'express' );
const router = express.Router();

router.get( '/guilds', ( req, res ) => {
  console.log( req.guild );
  res.send( 'received!' );
} );

router.get( '/guild/:guildId', ( req, res ) => {
  const { guildId } = req.params;

  res.send(`Getting settings for guild id ${guildId}`);
} );

router.post( '/', ( req, res ) => {
  res.send( 'POST: guilds route' );
} );

module.exports = router;