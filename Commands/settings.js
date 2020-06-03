const Utilities = require('Utilities')

module.exports = {
    name: 'settings',
    aliases: ['set'],
    description: 'Change Bot Settings for this server',
    help: `!settings <SETTING> <NEW VALUE>: Change SETTING to New Value, USE '-l' to see list of available settings`,
    usage: `<SETTING> <NEW VALUE>`,
    args: true,
    guildOnly: true,
    minPermissions: "ADMIN",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            
            if(!Utilities.hasPermissions(Bot, msg.author.id, "ADMIN")){
                msg.reply("You do not have permissions to run this command");
                return reject("Insufficient permissions.") }

            if(OPTIONS.LIST){
                var keys = Object.keys(Bot.ServerData.SETTINGS)
                Utilities.embedMessage(Bot, msg, args, "Available Settings", JSON.stringify(keys, null, `\t`), "#660", Bot.user.name, !OPTIONS.STAY)
            }

            var data = args[1];
            switch(args[0]){
                case "WarningsBeforeKick":
                    Bot.ServerData.SETTINGS.WarningsBeforeKick = parseInt(data)
                    msg.reply("Settings Updated")
                    break;

                case "WarningsBeforeBan":
                    Bot.ServerData.SETTINGS.WarningsBeforeBan = parseInt(data)
                    msg.reply("Settings Updated")
                    break;

                case "ProfanityFilterType":
                    Bot.ServerData.SETTINGS.ProfanityFilterType = parseInt(data)
                    msg.reply("Settings Updated")
                    break;

                case "ProfanityFilterMode":
                    Bot.ServerData.SETTINGS.ProfanityFilterMode = parseInt(data)
                    msg.reply("Settings Updated")
                    break;

                case "ProfanityFilterKickBan":
                    Bot.ServerData.SETTINGS.ProfanityFilterKickBan = parseInt(data)
                    msg.reply("Settings Updated")
                    break;

                case "DeleteCommandsAfterSent":
                    Bot.ServerData.SETTINGS.DeleteCommandsAfterSent = parseInt(data)
                    msg.reply("Settings Updated")
                    break;

                case "MaxChainedCommands":
                    Bot.ServerData.SETTINGS.MaxChainedCommands = parseInt(data)
                    msg.reply("Settings Updated")
                    break;
                
                case "ProfanityFilterType":
                    Bot.ServerData.SETTINGS.ProfanityFilterType = parseInt(data)
                    msg.reply("Settings Updated")
                    break;
                
                case "ProfanityFilterFullWords":
                    Bot.ServerData.SETTINGS.ProfanityFilterFullWords = parseInt(data)
                    msg.reply("Settings Updated");
                    break;

                case "GENERAL_USER":
                    var role = msg.mentions.roles.first();
                    Bot.ServerData.SETTINGS.ServerRole_GENERAL_USER = role;
                    msg.reply("Settings Updated")
                    break;

                case "CURRENT":
                    keys = Object.keys(Bot.ServerData.SETTINGS)
                    newSettings = {};
                    for(i = 0; i< keys.length; i++){
                        if (keys[i] != "PERMISSIONS" && keys[i] != "ServerRole_GENERAL_USER"){
                            newSettings[keys[i]] = Bot.ServerData.SETTINGS[keys[i]];
                    }}    
                    Utilities.embedMessage(Bot, msg, args, "Current Bot Settings", JSON.stringify(newSettings, null, `\t`), "#660", Bot.user.name, !OPTIONS.STAY)
                    break;
            }

            resolve("!Settings Executed, No Errors");
        });
	},
};