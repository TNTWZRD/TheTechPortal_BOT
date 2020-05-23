const Utilities = require('Utilities')

module.exports = {
    name: 'kick',
    aliases: [],
    description: 'Kick User From Server',
    help: '!Kick <@USER> <REASON>: Kick user',
    usage: `<@USER> <REASON>`,
    minPermissions: "MODERATOR",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            let target = msg.mentions.members.first(); // Get Target
            if(!target) { 
                msg.channel.send(`**${msg.author.username}**, Please mention the person who you want to kick`)
                return reject("No Mention"); }
            
            if(!(Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))) { 
                msg.channel.send(`**${msg.author.username}**, You do not have enough permission to use this command`)
                return reject("Insufficient Permissions") }

            if(!msg.guild.me.hasPermission("KICK_MEMBERS")) { 
                msg.channel.send(`**${msg.author.username}**, I do not have enough permission to use this command`)
                return reject("No Mention") }

            if(Utilities.hasPermissions(Bot, target.id, "MODERATOR")){ 
                msg.channel.send(`**${msg.author.username}**, CANNOT KICK AN OPERATOR`)
                return reject("Cant Kick Operator") }

            if(target.id === msg.author.id) { 
                msg.channel.send(`**${msg.author.username}**, You can not kick yourself`)
                return reject("Cant kick yourself") }

            if(!args[1]) { 
                msg.channel.send(`**${msg.author.username}**, Please Give Reason to kick`)
                return reject("Reason required for kicking") }
    
            Utilities.embedMessage(Bot, msg, args, "Kicked User", `Kicked ${target} (${target.id}) \n \`\`${args[1]}\`\``, "#ff6600", `Kicked by ${msg.author.username}`, false)
            
            target.kick(args[1]);

            resolve("!Kick Executed, No Errors");
        });
	},
};