const { prefix } = require('../config.json');
const Utilities = require('Utilities');


module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command',
    aliases: ['commands'],
    help: '!help : List all commands',
	usage: '<COMMAND>',
	cooldown: 0,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, args) {
        return new Promise(async (resolve, reject) => {
            const data = [];
            const { commands } = msg.client;

            if(msg.guild) var usr = await Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id);

            commands.each(e => { 
                if(!e.usage) e.usage = ''; 
                if(!e.minPermissions) e.minPermissions = "GENERAL_USER";
                if(msg.guild) if(!( usr.PermissionsLevel & Bot.PERMS[e.minPermissions] )) commands.delete(e.name);
            });

            if(!args.ARGS.length){
                if(msg.guild) data.push(`Here's a list of all commands you have access to in ${msg.guild.name}:\n\`\``);
                else data.push('Here\'s a list of all my commands:\n\`\`');

                data.push(commands.map(command => `${Bot.Prefix}${command.name} ${command.usage} :: ${command.description}`).join(',\n'));
                data.push(`\`\`\nYou can send \`${Bot.Prefix}help <COMMAND>\` to get info on a specific command!`);

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

            data.push(`**Cooldown:** ${(command.cooldown) ? 3 : command.cooldown } second(s)`);

            msg.channel.send(data, { split: true });

            return resolve("!Help Executed, No Errors");
        });
	},
};