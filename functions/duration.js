const client = require( '..' );

module.exports = async ( ms, getUnits = { getWeeks: false, getDays: true, getHours: true, getMinutes: true, getSeconds: false } ) => {
/* DEBUGGING */console.log( 'ms: %o', ms );/* DEBUGGING */
/* DEBUGGING */console.log( 'getUnits: %o', getUnits );/* DEBUGGING */
  if ( isNaN( ms ) ) { return '∅ms'; }
  const objUnits = {
    wks: ( typeof getUnits.getWeeks != 'boolean' ? false : getUnits.getWeeks ),
    days: ( typeof getUnits.getDays != 'boolean' ? true : getUnits.getDays ),
    hrs: ( typeof getUnits.getHours != 'boolean' ? true : getUnits.getHours ),
    min: ( typeof getUnits.getMinutes != 'boolean' ? true : getUnits.getMinutes ),
    secs: ( typeof getUnits.getSeconds != 'boolean' ? false : getUnits.getSeconds ),
  };
/* DEBUGGING */console.log( 'objUnits: %o', objUnits );/* DEBUGGING */

  if ( objUnits.wks || objUnits.days || objUnits.hrs || objUnits.min || objUnits.secs ) {
    var intWeeks, intDays, intHours, intMinutes, intSeconds;
    var totalSeconds = ( ms / 1000 );
    if ( objUnits.wks ) {
      intWeeks = Math.floor( totalSeconds / 604800 );
      totalSeconds %= 604800;
    }
/* DEBUGGING */console.log( 'intWeeks: %o', intWeeks );/* DEBUGGING */
    if ( objUnits.days ) {
      intDays = Math.floor( totalSeconds / 86400 );
      totalSeconds %= 86400;
    }
/* DEBUGGING */console.log( 'intDays: %o', intDays );/* DEBUGGING */
    if ( objUnits.hrs ) {
      intHours = Math.floor( totalSeconds / 3600 );
      totalSeconds %= 3600;
    }
/* DEBUGGING */console.log( 'intHours: %o', intHours );/* DEBUGGING */
    if ( objUnits.min ) { intMinutes = Math.floor( totalSeconds / 60 ); }
/* DEBUGGING */console.log( 'intMinutes: %o', intMinutes );/* DEBUGGING */
    if ( objUnits.secs ) { intSeconds = Math.floor( totalSeconds % 60 ); }
/* DEBUGGING */console.log( 'intSeconds: %o', intSeconds );/* DEBUGGING */

    const result = [];
    if ( objUnits.wks && intWeeks != 0 ) { result.push( intWeeks + ' week' + ( intWeeks === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.days && intDays != 0 ) { result.push( intDays + ' day' + ( intDays === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.hrs && intHours != 0 ) { result.push( intHours + ' hour' + ( intHours === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.min && intMinutes != 0 ) { result.push( intMinutes + ' minute' + ( intMinutes === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.secs && intSeconds != 0 ) { result.push( intSeconds + ' second' + ( intSeconds === 1 ? '' : 's' ) + ',' ); }
/* DEBUGGING */console.log( 'result: %o', result );/* DEBUGGING */

    return result.join( ' ' );
  }
  else { return ms + 'ms'; }
};