const client = require( '..' );
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const duration = require( './duration.js' );

module.exports = async ( rawString, obj = { guild: null, member: null } ) => {
  const member = ( obj.member ? obj.member : null );
  const guild = ( member ? member.guild : ( obj.guild ? obj.guild : null ) );
  const bot = client.user;

  const transclusions = {
    '{{bot.name}}': bot.displayName,
    '{{bot.owner.name}}': client.users.cache.get( client.ownerId ).displayName,
    '{{bot.owner.ping}}': '<@' + client.ownerId + '>',
    '{{bot.servers}}': client.guilds.cache.size,
    '{{bot.users}}': client.users.cache.size,
    '{{bot.uptime}}': await duration( client.uptime )
  };
  const notAvailable = {};

  if ( guild ) {
    transclusions[ '{{guild.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
    transclusions[ '{{guild.owner.ping}}' ] = '<@' + guild.ownerId + '>';
    transclusions[ '{{guild.members}}' ] = guild.members.cache.size;
    transclusions[ '{{guild.name}}' ] = guild.name;
  } else {
    notAvailable[ '{{guild.owner.name}}' ] = 'guild';
    notAvailable[ '{{guild.owner.ping}}' ] = 'guild';
    notAvailable[ '{{guild.members}}' ] = 'guild';
    notAvailable[ '{{guild.name}}' ] = 'guild';
  }

  if ( member ) {
    transclusions[ '{{member.name}}' ] = member.displayName;
    transclusions[ '{{member.ping}}' ] = '<@' + member.id + '>';
  } else {
    notAvailable[ '{{member.name}}' ] = 'member';
    notAvailable[ '{{member.ping}}' ] = 'member';
  }

console.log( 'transclusions: %o', transclusions );
console.log( 'notAvailable: %o', notAvailable );
  arrTemplates = rawString.match( /\{\{((?:bot|guild)\.[a-z\.]*)\}\}/g );
console.log( 'arrTemplates: %o', arrTemplates );
  arrTemplates.forEach( template => {
    if ( transclusions[ template ] ) { rawString.replace( template, transclusions[ template ] );console.log( 'template transclusions: %o', template ); }
    else if ( notAvailable[ template ] ) { rawString.replace( template, '*(unknown ' + notAvailable[ template ] + ')*' );console.log( 'template notAvailable: %o', template ); }
    else {
      rawString.replace( template, '[*' + template + '*](<https://github.com/Technical-13/' + bot.username + '/issues/new?labels=enhancement&template=feature_request.md&title=' + encodeURI( 'Please add ' + template + ' to transclude.js' ) + '>)' );
      console.log( 'Someone tried to transclude %s, search for a GitHub feature request:\n https://github.com/Technical-13/%s/issues?q=%s', chalk.bold.red( template ), bot.username, encodeURI( 'Please add ' + template + ' to transclude.js' ) );
    }
  } );
};