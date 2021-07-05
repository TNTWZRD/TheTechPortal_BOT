const { prefix } = require(process.cwd() + '/config.json');
const Utilities = require('Utilities');
const Config = require(process.cwd() + '/config.json');
const LOGSystem = require('LOGSystem');  // << Custom Log Module

// Needed for proper name display
const MODULES_NAMES = { 0 : "SYSTEM", 1 : "MODERATION", 2 : "GITHUB", 4 : "FUN", 8 : "DND", 16 : "MUSIC" };

// Export module so we can load each one within thier own files
module.exports = {
    // Set Command Settings
	name: 'help',
	description: 'List all of my commands or info about a specific command',
    aliases: ['commands', '?'],
    help: '!help : List all commands',
	usage: '<COMMAND>',
	cooldown: 0,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.SYSTEM,
    // All actual command code is in this Execute part
	execute(Bot, msg, args) {
        return new Promise(async (resolve, reject) => {
            const data = [];
            // Apparently making a new variable with a collection just mirrors it, commands run on new collection still affect original, Using clone fixes that.
            var commands = msg.client.commands.clone();

            // Get user data if in guild
            if(msg.guild) var usr = await Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id);

            // Variable for storing commands in a sortted manner
            var moduleSortedCommands = [];
            // Check each command for needed values
            commands.each(e => { 
                if(!e.usage) e.usage = ''; 
                if(!e.minPermissions) e.minPermissions = "GENERAL_USER";
                if(!e.guildOnly) e.guildOnly = false;
                if(msg.guild) {
                    if(!(((e.module & Bot.SETTINGS.ModulesEnabled)==e.module)? true : false) && e.module!=0) commands.delete(e.name); }
                
                // Skip command sorting if we have arguments
                if(!args.ARGS.length){
                    // Dont add command if in a guild on request and dont have enough perms to use
                    if(msg.guild){
                        if((msg.guild && (usr.PermissionsLevel & Bot.PERMS[e.minPermissions]))){
                            // Try Sort Commands By Modules:
                            if(moduleSortedCommands[MODULES_NAMES[e.module]]) moduleSortedCommands[MODULES_NAMES[e.module]][e.name] = e;
                            else { // Module not already in list, add new
                                moduleSortedCommands[MODULES_NAMES[e.module]] = [];
                                moduleSortedCommands[MODULES_NAMES[e.module]][e.name] = e; } 
                    }}
                    else{ // Not in guild asking commands, SEND ALLLLLL
                        // Try Sort Commands By Modules:
                        if(moduleSortedCommands[MODULES_NAMES[e.module]]) moduleSortedCommands[MODULES_NAMES[e.module]][e.name] = e;
                        else { // Module not already in list, add new
                            moduleSortedCommands[MODULES_NAMES[e.module]] = [];
                            moduleSortedCommands[MODULES_NAMES[e.module]][e.name] = e; }}
                }
            });

            // Run this if there are no arguments
            if(!args.ARGS.length){
                if(msg.guild) data.push(`Here's a list of all commands you have access to in ${msg.guild.name}:`);
                else data.push('Here\'s a list of all my commands:');

                var CommandsDataForPushing = "";
                // Loop over each MODULE
                Object.keys(moduleSortedCommands).forEach(MODULE => {
                    CommandsDataForPushing += `\n**Module: ${MODULE}** ${!((((e.module & Bot.SETTINGS.ModulesEnabled)==e.module)? true : false) && e.module!=0)? " -DISABLED- \n" : "\n"}`;
                    // Loop over each command in Module
                    Object.keys(moduleSortedCommands[MODULE]).forEach(CMD => {
                        CMD = moduleSortedCommands[MODULE][CMD];
                        //LOGSystem.LOG(`**Found CMD: ${CMD}**`, LOGSystem.LEVEL.DEBUG, "HELP");
                        CommandsDataForPushing += '`' + Utilities.lengthen(`${(Bot.Prefix)}${CMD.name} ${CMD.usage}`, 50, char = ' ') + `\` :: ${(!msg.guild)? ((CMD.guildOnly == true)? "**S** :: ": "**-** :: "): ""}${CMD.description}\n`;
                    });
                });

                // Add all above data to Data for sending to user
                data.push(CommandsDataForPushing);
                data.push(`You can send \`${(Bot.Prefix)}help <COMMAND>\` to get info on a specific command!${(msg.guild)? `\nCommands marked with **S** Are Server Only Commands`: ""}`);
                
                // Send Data to user with splitting
                msg.author.send(data, { split: true })
                    .then(() => {
                        // Yay it worked, send confirmation message to Guild Channel
                        if (msg.channel.type === 'dm') return;
                        msg.reply('I\'ve sent you a DM with all my commands!');
                    })
                    .catch(error => {
                        // Well shit there was an error, Log it and send message to Guild Channel
                        LOGSystem.LOG(`Could not send help DM to ${msg.author.tag}.\n ${error}`, LOGSystem.LEVEL.ERROR, "HELP_SENDDM");
                        msg.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                    });
                return resolve("!Help Executed, No Errors");
            }

            // Process HELP with arguments
            const name = args.ARGS[0].toLowerCase();
            // See if there is a command that matches Argument Provided
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

            // Well they didnt give correct command for searching throw error
            if (!command) {
                msg.reply('that\'s not a valid command.');
                return reject("!Help Executed, Invalid Command"); }
            
            // Check if User has Guild permissions to run this command, if so we can display help
            if(msg.guild && !(usr.PermissionsLevel & Bot.PERMS[command.minPermissions])) data.push(' --- INSUFFICENT PERMISSIONS --- \n')
            
            // Formatting for Command Embeds
            if (command.aliases && command.aliases.length > 0) data.push(`**Aliases:** ${command.aliases.join(', ')}\n`); // Add Aliases to Embed
            if (command.description) data.push(`**Description:** ${command.description}\n`);                              // Add Description to embed
            if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}\n`);                       // Add Usage text to embed
            if( command.cooldown ) data.push(`**Cooldown:** ${(command.cooldown) ? 3 : command.cooldown } second(s)\n`);  // Add Cooldown info to embed

            //Embed!
            Utilities.embedMessage(Bot, msg, args, `**Command: ${Bot.Prefix}${Utilities.camelCaseWord(command.name)}**`, data, '#ff6600', "", false)

            // FINALY we are done here!
            return resolve("!Help Executed, No Errors");
        });
	}
};