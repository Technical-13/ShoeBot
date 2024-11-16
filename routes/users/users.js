const express = require( 'express' );
const router = express.Router();

router.get( '/users', ( req, res ) => {
  console.log( req.user );
  res.send( 'received!' );
} );

router.get( '/guild/:id', ( req, res ) => {
  const { id: userId } = req.params;

  res.send(`Getting settings for user id ${userId}`);
} );

router.post( '/', ( req, res ) => {
  res.send( 'POST: users route' );
} );

module.exports = router;