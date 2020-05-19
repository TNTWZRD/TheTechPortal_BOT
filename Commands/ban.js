const Utilities = require('Utilities')

module.exports = {
    name: 'ban',
    aliases: [],
    description: 'Ban User From Server',
    help: '!Ban <@USER> <REASON>: Ban user',
    usage: `<@USER> <REASON>`,
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            let target = msg.mentions.members.first(); // Get Target
            if(!target) { 
                msg.channel.send(`**${msg.author.username}**, Please mention the person who you want to Ban`)
                return reject("No Mention"); }
            
            if(!(Utilities.hasPermissions(Bot, msg.author.id, "ADMIN"))) { 
                msg.channel.send(`**${msg.author.username}**, You do not have enough permission to use this command`)
                return reject("Insufficient Permissions") }

            if(!msg.guild.me.hasPermission("BAN_MEMBERS")) { 
                msg.channel.send(`**${msg.author.username}**, I do not have enough permission to use this command`)
                return reject("No Mention") }

            if(Utilities.hasPermissions(Bot, target.id, "MODERATOR")){ 
                msg.channel.send(`**${msg.author.username}**, CANNOT BAN AN OPERATOR`)
                return reject("Cant Ban Operator") }

            if(target.id === msg.author.id) { 
                msg.channel.send(`**${msg.author.username}**, You can not Ban yourself`)
                return reject("Cant Ban yourself") }

            if(!args[1]) { 
                msg.channel.send(`**${msg.author.username}**, Please Give Reason to Ban`)
                return reject("Reason required for Banning") }
    
            Utilities.embedMessage(Bot, msg, args, "Banned User", `Banned ${target} (${target.id}) \n \`\`${args[1]}\`\``, "#ff6600", `Banned by ${msg.author.username}`, false)
            
            target.ban(args[1]);

            resolve("!Ban Executed, No Errors");
        });
	},
};