new Promise( async ( resolve, reject ) => {
  const botGuildIds = Array.from( client.guilds.cache.keys() );
  if ( typeof( botGuildIds ) != 'array' ) { reject( { message: 'Unable to retrieve guilds bot is in.' } ); }
  const storedGuilds = await guildConfig.find();
  const storedGuildIds = Array.from( storedGuilds.keys() );
  if ( typeof( storedGuildIds ) != 'array' ) { reject( { message: 'Unable to retrieve bot\'s guilds from database.' } ); }
  const allGuildIds = [].concat( botGuildIds, storedGuildIds ).getDistinct().sort();
  const addedGuildIds = botGuildIds.getDiff( storedGuildIds );
  const removedGuildIds = storedGuildIds.getDiff( botGuildIds );
  const ioGuildIds = [].concat( addedGuildIds, removedGuildIds ).sort();
  const updateGuildIds = allGuildIds.getDiff( ioGuildIds ).getDistinct();
  for ( let guildId of updateGuildIds ) {
    let ndxGuild = updateGuildIds.indexOf( guildId );
    let botGuild = client.guilds.cache.get( guildId );
    let actualEntry = storedGuilds.filter( g => g._id === guildId );
    let Blacklist = ( actualEntry.Blacklist || { Members: [], Roles: [] } );
    let Logs = ( actualEntry.Logs || { Active: true, Chat: null, Default: null, Error: null, strClosing: logClosing( null ) } );
    let Part = ( actualEntry.Part || { Active: false, Channel: null, Message: null, SaveRoles: false } );
    let Welcome = ( actualEntry.Welcome || { Active: false, Channel: null, Message: null, Role: null } );
    let Whitelist = ( actualEntry.Whitelist || { Members: [], Roles: [] } );
    let expectedEntry = {
      _id: botGuild.id,
      Bans: actualEntry.Bans,
      Blacklist: {
        Members: Blacklist.Members,
        Roles: Blacklist.Roles
      },
      Commands: actualEntry.Commands,
      Expires: actualEntry.Expires,
      Guild: {
        Name: botGuild.name,
        Members: botGuild.members.cache.size,
        OwnerID: botGuild.ownerId,
        OwnerName: guildOwner.displayName
      },
      Invite: actualEntry.Invite,
      Logs: {
        Active: Logs.Active,
        Chat: Logs.Chat,
        Default: Logs.Default,
        Error: Logs.Error,
        strClosing: Logs.strClosing
      },
      Part: {
        Active: Part.Active,
        Channel: Part.Channel,
        Message: Part.Message,
        SaveRoles: Part.SaveRoles
      },
      Prefix: actualEntry.Prefix,
      Premium: actualEntry.Premium,
      Version: verGuildDB,
      Welcome: {
        Active: Welcome.Active,
        Channel: Welcome.Channel,
        Message: Welcome.Message,
        Role: Welcome.Role
      },
      Whitelist: {
        Members: Whitelist.Members,
        Roles: Whitelist.Roles
      }
    };
    if ( expectedEntry.valMatch( actualEntry ) ) { updateGuildIds.splice( ndxGuild, 1 ) }
  }

  const botUserIds = Array.from( client.users.cache.keys() );
  if ( typeof( botUserIds ) != 'array' ) { reject( { message: 'Unable to retrieve bot\'s mutual users.' } ); }
  const storedUsers = await userConfig.find();
  const storedUserIds = Array.from( storedUsers.keys() );
  if ( typeof( storedUserIds ) != 'array' ) { reject( { message: 'Unable to retrieve userlist from database.' } ); }
  const allUserIds = [].concat( botUserIds, storedUserIds ).getDistinct().sort();
  const addedUserIds = botUserIds.getDiff( storedUserIds );
  const removedUserIds = storedUserIds.getDiff( botUserIds );
  const ioUserIds = [].concat( addedUserIds, removedUserIds ).sort();
  const updateUserIds = allUserIds.getDiff( ioUserIds ).getDistinct();
  for ( let userId of updateUserIds ) {
    let ndxUser = updateUserIds.indexOf( userId );
    let botUser = client.users.cache.get( userId );
    let actualEntry = storedUsers.filter( u => u._id === userId );
    let expectedEntry = {
      _id: botUser.id,
      Bot: botUser.bot,
      Guilds: actualEntry.Guilds,
      Guildless: actualEntry.Guildless,
      UserName: botUser.displayName,
      Score: actualEntry.Score,
      Version: verUserDB
    };
    if ( expectedEntry.valMatch( actualEntry ) ) { updateUserIds.splice( ndxUser, 1 ) }
  }

  resolve( {
    guilds: {
      db: storedGuilds,
      add: addedGuildIds,
      remove: removedGuildIds,
      update: updateGuildIds
    },
    users: {
      db: storedUsers,
      add: addedUserIds,
      remove: removedUserIds,
      update: updateUserIds
      }
  } );
} )
.then( async ( data ) => {
  console.log( 'data: %o', data );
} )