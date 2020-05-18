const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command',
	aliases: ['commands'],
	usage: '<COMMAND>',
	cooldown: 0,
	execute(Bot, msg, args) {
        return new Promise((resolve, reject) => {
            const data = [];
            const { commands } = msg.client;
            commands.each(e => { if(!e.usage) e.usage = ''; });

            if(!args.ARGS.length){
                data.push('Here\'s a list of all my commands:\`\`');
                data.push(commands.map(command => `${prefix}${command.name} ${command.usage} :: ${command.description}`).join(',\n'));
                data.push(`\`\`\nYou can send \`${prefix}help <COMMAND>\` to get info on a specific command!`);

                msg.author.send(data, { split: true })
                    .then(() => {
                        if (msg.channel.type === 'dm') return;
                        msg.reply('I\'ve sent you a DM with all my commands!');
                    })
                    .catch(error => {
                        console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
                        msg.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                    });
                return resolve("!Help Executed, No Errors");
            }

            const name = args.ARGS[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

            if (!command) {
                msg.reply('that\'s not a valid command!');
                return reject("!Help Executed, Invalid Command")
            }

            data.push(`**Name:** ${command.name}`);

            if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
            if (command.description) data.push(`**Description:** ${command.description}`);
            if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

            data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

            msg.channel.send(data, { split: true });

            return resolve("!Help Executed, No Errors") 
        });
	},
};