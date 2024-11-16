const express = require( 'express' );
const router = express.Router();

router.get( '/guilds', ( req, res ) => {
  console.log( req.user );
  res.send( 'received!' );
} );

router.get( '/guild/:id', ( req, res ) => {
  const { id: guildId } = req.params;

  res.send(`Getting settings for guild id ${guildId}`);
} );

router.post( '/', ( req, res ) => {
  res.send( 'POST: guilds route' );
} );

module.exports = router;