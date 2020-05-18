const fs = require('fs');
// Get all commands from ./Commands/
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

module.exports = {
	name: 'reload',
    description: 'Reloads all commands',
	execute(Bot, msg, args) {
        return new Promise((resolve) => {
            Bot.commands.each(obj => {
                delete require.cache[require.resolve(`./${obj.name}.js`)];
            });
            for (const file of commandFiles) {
                const command = require(`../commands/${file}`);
                // Add command to collection as name:command()
                msg.client.commands.set(command.name, command);
            }
            return resolve("!Reload Executed, No Errors")
        });
	},
};