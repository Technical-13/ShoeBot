const express = require( 'express' );

const router = express.Router();

//router.use( '/auth', require( './auth' ) );
//router.use( '/guilds', require( './guilds' ) );
router.use( '/users', require( './users' ) );

module.exports = router;