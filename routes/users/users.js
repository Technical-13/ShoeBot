const express = require( 'express' );
const router = express.Router();

router.get( '/', ( req, res ) => {
  console.log( req.user );
  res.send( 'Looking for a user?' );
} );

router.get( '/:userId', ( req, res ) => {
  const { userId } = req.params;

  res.send(`Getting settings for user id ${userId}`);
} );

router.post( '/', ( req, res ) => {
  res.send( 'POST: users route' );
} );

module.exports = router;