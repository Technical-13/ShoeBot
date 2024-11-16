const express = require( 'express' );
const router = express.Router();
const Users = require( '../../models/BotUser.js' );

router.get( '/', ( req, res ) => {
  res.send( 'Looking for a user?' );
} );

router.get( '/:userId', async ( req, res ) => {
  const { userId } = req.params;
  const reqUser = await Users.findOne( { _id: userId } );
  if ( reqUser ) {
    res.send(`Are you looking for ${reqUser.UserName}?`);
  }
  else {
    res.send(`User id ${userId} doesn't seem to be in my database.`);
  }
} );

router.post( '/', ( req, res ) => {
  res.send( 'POST: users route' );
} );

module.exports = router;