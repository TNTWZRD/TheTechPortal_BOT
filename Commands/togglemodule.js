const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'togglemodule',
    aliases: [''],
    description: 'Change Module States',
    help: '!toggleModule <MODULE> <NEWSTATE(BOOL)>: Change Module States',
    usage: `<MODULE> <NEWSTATE(BOOL)>`,
    args: true,
    guildOnly: true,
    module: Config.MODULES.SYSTEM,
    minPermissions: "ADMIN",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            if(OPTIONS.LIST){
                var data = [];
                data.push(`Current Module Status: `);
                Object.keys(Config.MODULES).forEach(e => {
                    var enabled = (Config.MODULES[e] & Bot.SETTINGS.ModulesEnabled)? true : false;
                    if(e == "SYSTEM") enabled = true;
                    data.push(`\`${e} : [${enabled}]\``);
                });
                Utilities.embedMessage(Bot, msg, args, "Bot Modules", data, "#ff6600", msg.client.user.username, !OPTIONS.STAY);
                return resolve("!ToggleModule Executed, No Errors");
            }

            // Not Enough Permissions
            if(!(await Utilities.hasPermissions(Bot, msg.author.id, "ADMIN"))){
                msg.reply("Insufficent Permissions");
                return reject("Insufficent Permissions") }
                
            // Not Enough Arguments
            if((!args[0] && !parseInt(args[1])) && args[0]!='CURRENT'){
                msg.reply("Not Enough Arguments, see \`!togglemodule -h\`");
                return reject("Not Enough arguments"); }
            
            // Value = True / False
            var value = (parseInt(args[1]) == 1)? true : false;

            switch (args[0].toLowerCase()) {
                case 'system':
                    msg.reply("Cannot Change System Module");
                    return reject("Cannot Change System Module");
                case 'moderation':
                    var Module = Bot.Config.MODULES.MODERATION;
                    if(value){ // Enable Module
                        if(!(Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled+Module));
                    }else{ // Disable  Module
                        if((Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled-Module)); }
                    msg.reply("Settings Updated!!");
                    break;
                case 'github':
                    var Module = Bot.Config.MODULES.GITHUB;
                    if(value){ // Enable Module
                        if(!(Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled+Module));
                    }else{ // Disable  Module
                        if((Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled-Module)); }
                    msg.reply("Settings Updated!!");
                    break;
                case 'fun':
                    var Module = Bot.Config.MODULES.FUN;
                    if(value){ // Enable Module
                        if(!(Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled+Module));
                    }else{ // Disable  Module
                        if((Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled-Module)); }
                    msg.reply("Settings Updated!!");
                    break;
                case 'dnd':
                    var Module = Bot.Config.MODULES.DND;
                    if(value){ // Enable Module
                        if(!(Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled+Module));
                    }else{ // Disable  Module
                        if((Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled-Module)); }
                    msg.reply("Settings Updated!!");
                    break;
                case 'music':
                    var Module = Bot.Config.MODULES.MUSIC;
                    if(value){ // Enable Module
                        if(!(Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled+Module));
                    }else{ // Disable  Module
                        if((Bot.SETTINGS.ModulesEnabled & Module)) 
                            await Utilities.SetServerValue(Bot.SETTINGS.SUID, "ModulesEnabled", (Bot.SETTINGS.ModulesEnabled-Module)); }
                    msg.reply("Settings Updated!!");
                    break;
                case 'current':
                    var data = [];
                    data.push(`Current Module Status: `);
                    Object.keys(Config.MODULES).forEach(e => {
                        var enabled = (Config.MODULES[e] & Bot.SETTINGS.ModulesEnabled)? true : false;
                        if(e == "SYSTEM") enabled = true;
                        data.push(`\`${e} : [${enabled}]\``);
                    });
                    Utilities.embedMessage(Bot, msg, args, "Bot Modules", data, "#ff6600", msg.client.user.username, !OPTIONS.STAY)
                    break;
                default:
                    msg.reply('Error Parsing Command, Run \`!togglemodules -h\`')
                    break;
            }

            resolve("!ToggleModule Executed, No Errors");
        });
	},
};