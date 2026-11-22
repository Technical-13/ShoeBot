const buildPath = require( './Utilities/buildPath.js' );
const modData = { ext: 'js', group: 'Utilities', name: 'getInternationalizations', type: 'functions' };

module.exports = () => {
  const basePath = { ext: 'js', group: 'i18n', type: 'functions' };
  const modPaths = {
//    discordSlasher: buildPath( { ext: 'js', group: 'functions', name: 'i18nSlasher', platform: 'discord', type: 'platforms' } ).path,
//    getOptions: buildPath( { ...basePath, name: 'getOptions' } ).path,
//    getResponses: buildPath( { ...basePath, name: 'getResponses' } ).path,
    validateLangCode: buildPath( { ...basePath, name: 'validateLangCode' } ).path,
  };
  return {
//    discordSlasher: require( modPaths.discordSlasher ),
//    getOptions: require( modPaths.getOptions ),
//    getResponses: require( modPaths.getResponses ),
    validateLangCode: require( modPaths.validateLangCode ),
  };
}
