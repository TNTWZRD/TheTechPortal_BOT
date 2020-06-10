const Utilities = require('Utilities');
const fs = require('fs');
const Config = require(process.cwd() + '/config.json')

// Get all commands from ./Commands/
var commandDir = process.cwd() + '/Commands';
const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

module.exports = {
	name: 'reload',
    description: 'Reloads all commands',
    minPermissions: "MODERATOR",
    module: Config.MODULES.SYSTEM,
	execute(Bot, msg, args) {
        return new Promise((resolve) => {
            if(msg.guild){
                if(!(Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))) { 
                    msg.channel.send(`**${msg.author.username}**, You do not have enough permission to use this command`)
                    return reject("Insufficient Permissions") }
            }

            // Maybe?
            // process.exit(1);

            Bot.commands.each(obj => {
                delete require.cache[require.resolve(commandDir+`/${obj.name}.js`)];
            });
            for (const file of commandFiles) {
                const command = require(commandDir+`/${file}`);
                // Add command to collection as name:command()
                msg.client.commands.set(command.name, command);
            }
            msg.reply("Command modules reloaded!");
            return resolve("!Reload Executed, No Errors")
        });
	},
};