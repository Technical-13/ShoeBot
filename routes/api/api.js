require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
const express = require( 'express' );
const router = express.Router();
const Users = require( '../../models/BotUser.js' );
const Guilds = require( '../../models/GuildConfig.js' );

router.get( '/g/:guildName', async ( req, res ) => {
  const { guildName } = req.params;
  const reqGuilds = await Guilds.find( { Name: guildName }, '_id Guild:Name', { limit: 10 } );
  console.log( 'reqGuilds: %o', reqGuilds );
} );

router.get( '/u/:userName', async ( req, res ) => {
  const { userName } = req.params;
  const reqUsers = await Users.find( { UserName: userName }, '_id UserName', { limit: 10 } );
  console.log( 'reqUsers: %o', reqUsers );
} );