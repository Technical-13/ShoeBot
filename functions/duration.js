const client = require( '..' );

module.exports = async ( ms, getUnits = { getWeeks: false, getDays: true, getHours: true, getMinutes: true, getSeconds: false } ) => {
  if ( isNaN( ms ) ) { return '∅ms'; }
  const objUnits = {
    wks: ( !getUnits.getWeeks ? false : ( typeof getUnits.getWeeks != 'boolean' ? false : getUnits.getWeeks ) ),
    days: ( !getUnits.getDays ? true : ( typeof getUnits.getDays != 'boolean' ? true : getUnits.getDays ) ),
    hrs: ( !getUnits.getHours ? true : ( typeof getUnits.getHours != 'boolean' ? true : getUnits.getHours ) ),
    min: ( !getUnits.getMinutes ? true : ( typeof getUnits.getMinutes != 'boolean' ? true : getUnits.getMinutes ) ),
    secs: ( typeof getUnits.getSeconds != 'boolean' ? false : getUnits.getSeconds ),
  };

  if ( objUnits.wks || objUnits.days || objUnits.hrs || objUnits.min || objUnits.secs ) {
    const totalSeconds = ( ms / 1000 );
    if ( objUnits.wks ) {
      const intWeeks = Math.floor( totalSeconds / 604800 );
      totalSeconds %= 604800;
    }
    if ( objUnits.days ) {
      const intDays = Math.floor( totalSeconds / 86400 );
      totalSeconds %= 86400;
    }
    if ( objUnits.hrs ) {
      const intHours = Math.floor( totalSeconds / 3600 );
      totalSeconds %= 3600;
    }
    if ( objUnits.min ) { const intMinutes = Math.floor( totalSeconds / 60 ); }
    if ( objUnits.secs ) { const intSeconds = Math.floor( totalSeconds % 60 ); }

    const result = [];
    if ( objUnits.wks ) { result.push( intWeeks === 0 ? '' : intWeeks + ' week' + ( intWeeks === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.days ) { result.push( intDays === 0 ? '' : intDays + ' day' + ( intDays === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.hrs ) { result.push( intHours === 0 ? '' : intHours + ' hour' + ( intHours === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.min ) { result.push( intMinutes === 0 ? '' : intMinutes + ' minute' + ( intMinutes === 1 ? '' : 's' ) + ',' ); }
    if ( objUnits.secs ) { result.push( intSeconds === 0 ? '' : intSeconds + ' second' + ( intSeconds === 1 ? '' : 's' ) + ',' ); }

    return result.join( ' ' );
  }
  else { return ms + 'ms' }
};