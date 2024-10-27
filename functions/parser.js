const client = require( '..' );
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const duration = require( './duration.js' );

module.exports = async ( rawString, obj = { author: null, guild: null, member: null, uptime: null } ) => {
  const author = ( obj.author ? obj.author : null );
  const member = ( obj.member ? obj.member : null );
  const guild = ( obj.guild ? obj.guild : ( author ? author.guild : ( member ? member.guild : null ) ) );
  const uptime = ( obj.uptime ? obj.uptime : null );
  const ageUnits = { getDecades: true, getYears: true, getMonths: true, getDays: true, getHours: false, getMinutes: false };
  const bot = client.user;

  const currUptime = await duration( client.uptime, uptime );
  const transclusions = {
    '{{bot.age}}': await duration( Date.now() - client.user.createdTimestamp, ageUnits ),
    '{{bot.members}}': client.users.cache.size.toLocaleString(),
    '{{bot.name}}': bot.displayName,
    '{{bot.owner.name}}': client.users.cache.get( client.ownerId ).displayName,
    '{{bot.owner.ping}}': '<@' + client.ownerId + '>',
    '{{bot.servers}}': client.guilds.cache.size.toLocaleString(),
    '{{bot.users}}': client.users.cache.size.toLocaleString(),
    '{{bot.uptime}}': currUptime
  };
  const notAvailable = {};

  if ( author ) {
    transclusions[ '{{author.age}}' ] = await duration( Date.now() - author.user.createdTimestamp, ageUnits );
    transclusions[ '{{author.guild.age}}' ] = await duration( Date.now() - author.joinedTimestamp, ageUnits );
    transclusions[ '{{author.name}}' ] = author.displayName;
    transclusions[ '{{author.ping}}' ] = '<@' + author.id + '>';
    transclusions[ '{{author.server.age}}' ] = await duration( Date.now() - author.joinedTimestamp, ageUnits );
  } else {
    notAvailable[ '{{author.age}}' ] = 'author';
    notAvailable[ '{{author.guild.age}}' ] = 'author';
    notAvailable[ '{{author.name}}' ] = 'author';
    notAvailable[ '{{author.ping}}' ] = 'author';
    notAvailable[ '{{author.server.age}}' ] = 'author';
  }

  if ( guild ) {
    transclusions[ '{{guild.age}}' ] = await duration( Date.now() - guild.createdTimestamp, ageUnits );
    transclusions[ '{{guild.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
    transclusions[ '{{guild.owner.ping}}' ] = '<@' + guild.ownerId + '>';
    transclusions[ '{{guild.members}}' ] = guild.members.cache.size.toLocaleString();
    transclusions[ '{{guild.name}}' ] = guild.name;
    transclusions[ '{{server.age}}' ] = await duration( Date.now() - guild.createdTimestamp, ageUnits );
    transclusions[ '{{server.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
    transclusions[ '{{server.owner.ping}}' ] = '<@' + guild.ownerId + '>';
    transclusions[ '{{server.members}}' ] = guild.members.cache.size.toLocaleString();
    transclusions[ '{{server.name}}' ] = guild.name;
  } else {
    notAvailable[ '{{guild.age}}' ] = 'guild';
    notAvailable[ '{{guild.owner.name}}' ] = 'guild';
    notAvailable[ '{{guild.owner.ping}}' ] = 'guild';
    notAvailable[ '{{guild.members}}' ] = 'guild';
    notAvailable[ '{{guild.name}}' ] = 'guild';
    notAvailable[ '{{server.age}}' ] = 'guild';
    notAvailable[ '{{server.owner.name}}' ] = 'guild';
    notAvailable[ '{{server.owner.ping}}' ] = 'guild';
    notAvailable[ '{{server.members}}' ] = 'guild';
    notAvailable[ '{{server.name}}' ] = 'guild';
  }

  if ( member ) {
    transclusions[ '{{member.age}}' ] = await duration( Date.now() - member.user.createdTimestamp, ageUnits );
    transclusions[ '{{member.guild.age}}' ] = await duration( Date.now() - member.joinedTimestamp, ageUnits );
    transclusions[ '{{member.name}}' ] = member.displayName;
    transclusions[ '{{member.ping}}' ] = '<@' + member.id + '>';
    transclusions[ '{{member.server.age}}' ] = await duration( Date.now() - member.joinedTimestamp, ageUnits );
  } else {
    notAvailable[ '{{member.age}}' ] = 'member';
    notAvailable[ '{{member.guild.age}}' ] = 'member';
    notAvailable[ '{{member.name}}' ] = 'member';
    notAvailable[ '{{member.ping}}' ] = 'member';
    notAvailable[ '{{member.server.age}}' ] = 'member';
  }

  arrTemplates = rawString.match( /\{\{((?:author|bot|guild|member)\.[a-z\.]*)\}\}/g );
  var parsed = rawString;
  if ( arrTemplates ) {
    arrTemplates.forEach( template => {
      if ( transclusions[ template ] ) { parsed = parsed.replace( template, transclusions[ template ] ); }
      else if ( notAvailable[ template ] ) { parsed = parsed.replace( template, '*(unknown ' + notAvailable[ template ] + ')*' ); }
      else {
        parsed = parsed.replace( template, '[*' + template + '*](<https://github.com/Technical-13/' + bot.username + '/issues/new?labels=enhancement&template=feature_request.md&title=' + encodeURI( 'Please add ' + template + ' to transclude.js' ) + '>)' );
        console.log( 'Someone tried to transclude %s, search for a GitHub feature request:\n https://github.com/Technical-13/%s/issues?q=%s', chalk.bold.red( template ), bot.username, encodeURI( 'Please add ' + template + ' to transclude.js' ) );
      }
    } );
  }

  return parsed;
};