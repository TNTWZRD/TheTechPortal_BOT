const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'settings',
    aliases: ['set'],
    description: 'Change Bot Settings for this server',
    help: `!settings <SETTING> <NEW VALUE>: Change SETTING to New Value, USE '-l' to see list of available settings`,
    usage: `<SETTING> <NEW VALUE>`,
    args: true,
    guildOnly: true,
    minPermissions: "ADMIN",
    module: Config.MODULES.SYSTEM,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var SETTINGS = await Utilities.GetServer(msg.guild.id);
            
            if(!(await Utilities.hasPermissions(Bot, msg.author.id, "ADMIN"))){
                msg.reply("You do not have permissions to run this command");
                return reject("Insufficient permissions.") }

            if(OPTIONS.LIST){
                var keys = Object.keys(SETTINGS)
                Utilities.embedMessage(Bot, msg, args, "Available Settings", JSON.stringify(keys, null, `\t`), "#660", Bot.user.name, !OPTIONS.STAY)
            }

            var data = args[1];
            switch(args[0]){
                case "WarningsBeforeKick":
                    Utilities.SetServerValue(msg.guild.id, "WarningsBeforeKick", parseInt(data))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "WarningsBeforeBan":
                    Utilities.SetServerValue(msg.guild.id, "WarningsBeforeBan", parseInt(data))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "ProfanityFilterCustom":
                    Utilities.SetServerValue(msg.guild.id, "ProfanityFilterCustom", parseInt(data))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "ProfanityFilterFullWords":
                    Utilities.SetServerValue(msg.guild.id, "ProfanityFilterFullWords", parseInt(data))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "ProfanityFilterKickBan":
                    Utilities.SetServerValue(msg.guild.id, "ProfanityFilterKickBan", parseInt(data))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "DeleteCommandsAfterSent":
                    Utilities.SetServerValue(msg.guild.id, "DeleteCommandsAfterSent", parseInt(data))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "MaxChainedCommands":
                    Utilities.SetServerValue(msg.guild.id, "MaxChainedCommands", parseInt(data))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "ServerRole_GENERAL_USER":
                    var role = msg.mentions.roles.first();
                    Utilities.SetServerValue(msg.guild.id, "ServerRole_GENERAL_USER", JSON.stringify(role))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;
                
                case "ServerRole_MUTED":
                    var role = msg.mentions.roles.first();
                    Utilities.SetServerValue(msg.guild.id, "ServerRole_MUTED", JSON.stringify(role))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;
                        
                case "Prefix":
                    console.log(data.replace(/^"(.+)"$/gim, '$1'))
                    Utilities.SetServerValue(msg.guild.id, "Prefix", data.replace(/^"(.+)"$/gim, '$1'))
                        .catch(e => reject(e) );
                    msg.reply("Settings Updated!!");
                    break;

                case "CURRENT":
                    keys = Object.keys(SETTINGS)
                    newSettings = {};
                    for(i = 0; i< keys.length; i++){
                        if (keys[i] != "PERMISSIONS" && keys[i] != "ServerRole_GENERAL_USER" && keys[i] != "ServerRole_MUTED" && keys[i] != "AuthCODE" && keys[i] != "ProfanityFilterCustomWordList"){
                            newSettings[keys[i]] = SETTINGS[keys[i]];
                    }}    
                    Utilities.embedMessage(Bot, msg, args, "Current Bot Settings", JSON.stringify(newSettings, null, `\t`), "#660", Bot.user.name, !OPTIONS.STAY)
                    break;
            }

            resolve("!Settings Executed, No Errors");
        });
	},
};