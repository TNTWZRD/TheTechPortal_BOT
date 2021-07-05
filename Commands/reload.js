const Utilities = require('Utilities');
const fs = require('fs');
const Config = require(process.cwd() + '/config.json')

// Get all commands from ./Commands/
var commandDir = process.cwd() + '/Commands';
const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

module.exports = {
	name: 'reload',
    description: 'Reloads all commands',
    guildOnly: true,
    minPermissions: "MODERATOR",
    module: Config.MODULES.SYSTEM,
	execute(Bot, msg, args) {
        return new Promise(async (resolve, reject) => {
            if(msg.guild){
                if(!(await Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))) { 
                    msg.channel.send(`**${msg.author.username}**, You do not have enough permission to use this command`);
                    return reject("Insufficient Permissions"); }
                else Bot.init();
            }
            // Let TNTWZRD Bot Owner run command Anyways
            else if(msg.author.id == Config.botOwner) Bot.init();
            else {
                msg.channel.send(`**${msg.author.username}**, You cannot run this command in a Direct Message`);
                return reject("Not BotOwner, Cant Run In DM"); }


            msg.reply("Command modules reloaded!");
            return resolve("!Reload Executed, No Errors");
        });
	},
};