const fs = require('fs');
// Get all commands from ./Commands/
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
const Utilities = require('Utilities');

module.exports = {
	name: 'reload',
    description: 'Reloads all commands',
    minPermissions: "MODERATOR",
	execute(Bot, msg, args) {
        return new Promise((resolve) => {
            
            if(!(Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))) { 
                msg.channel.send(`**${msg.author.username}**, You do not have enough permission to use this command`)
                return reject("Insufficient Permissions") }

            Bot.commands.each(obj => {
                delete require.cache[require.resolve(`./${obj.name}.js`)];
            });
            for (const file of commandFiles) {
                const command = require(`../Commands/${file}`);
                // Add command to collection as name:command()
                msg.client.commands.set(command.name, command);
            }
            msg.reply("Command modules reloaded!");
            return resolve("!Reload Executed, No Errors")
        });
	},
};