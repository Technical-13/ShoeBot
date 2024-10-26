const client = require( '..' );
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const duration = require( './duration.js' );

module.exports = async ( rawString, objects = { guild: null, member: null } ) => {
  const bot = client.user;

  const transclusions = {
    '{{bot.name}}': bot.displayName,
    '{{bot.owner.name}}': client.users.cache.get( client.ownerId ).displayName,
    '{{bot.owner.ping}}': '<@' + client.ownerId + '>',
    '{{bot.servers}}': client.guilds.cache.size,
    '{{bot.users}}': client.users.cache.size,
    '{{bot.uptime}}': await duration( client.uptime )
  };
  if ( objects.guild ) {
    const { guild } = objects;
    transclusions[ '{{guild.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
    transclusions[ '{{guild.owner.ping}}' ] = '<@' + guild.ownerId + '>';
    transclusions[ '{{guild.members}}' ] = guild.members.cache.size;
    transclusions[ '{{guild.name}}' ] = guild.name;
  }
  if ( objects.member ) {
    const { member } = objects;
    transclusions[ '{{member.name}}' ] = member.displayName;
    transclusions[ '{{member.ping}}' ] = '<@' + member.id + '>';
  }

  arrTemplates = rawString.match( /\{\{((?:bot|guild)\.[a-z\.]*)\}\}/g );
  arrTemplates.forEach( template => {
    if ( transclusions[ template ] ) { rawString.replace( template, transclusions[ template ] ); }
    else {
      rawString.replace( template, '[*' + template + '*](<https://github.com/Technical-13/' + bot.username + '/issues/new?labels=enhancement&template=feature_request.md&title=' + encodeURI( 'Please add ' + template + ' to transclude.js' ) + '>)' );
      console.log( 'Someone tried to transclude %s.  Search for a GitHub feature_request: https://github.com/Technical-13/%s/issues?q=%s', chalk.bold.red( template ), bot.username, encodeURI( 'Please add ' + template + ' to transclude.js' ) );
    }
  } );
};