const Utilities = require('Utilities')

module.exports = {
    name: 'warn',
    aliases: [],
    description: 'Warn User',
    help: '!Warn <@USER> <WARNING> (WarningCounter(bool) = 0): Warn user, Warning counter will add to their server warnings(Default false)',
    usage: `<@USER> <WARNING> <WarningCounter(bool)>`,
    args: true,
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            let target = msg.mentions.members.first(); // Get Target
            if(!target) { 
                console.log(JSON.stringify(target, null, `\t`))
                msg.channel.send(`**${msg.author.username}**, Please mention the person who you want to warn`)
                return reject("No Mention"); }
            
            if(!(Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))) { 
                msg.channel.send(`**${msg.author.username}**, You do not have enough permission to use this command`)
                return reject("Insufficient Permissions") }

            if(Utilities.hasPermissions(Bot, target.id, "MODERATOR")){ 
                msg.channel.send(`**${msg.author.username}**, CANNOT WARN AN OPERATOR`)
                return reject("Cant WARN Operator") }

            if(target.id === msg.author.id) { 
                msg.channel.send(`**${msg.author.username}**, You can not Warn yourself`)
                return reject("Cant Warn yourself") }

            if(!args[1]) { 
                msg.channel.send(`**${msg.author.username}**, Please Give Reason you are warning`)
                return reject("Reason required for warning") }

            msg.channel.send(`WARNING: <@${target.id}>, ${args[1]}`);
            
            if(parseInt(args[2]) == 1){
                Bot.ServerData.USERS[target.id].Warnings += 1;
                SETTINGS = Bot.ServerData.SETTINGS;

                if(USERS[target.id].Warnings >= SETTINGS.WarningsBeforeKick && USERS[target.id].Warnings < SETTINGS.WarningsBeforeBan ){
                    Utilities.embedMessage(Bot, msg, undefined, "Warned And Kicked User", `Kicked ${msg.author} (${msg.author.id})\n\`\`${args[1]}\`\``, "#ff6600", `Kicked by ${Bot.user.name}`, false)
                    target.createDM()
                        .then(dmChannel => { dmChannel.send(`${target}, You are being warned, and kicked for: ${args[1]}, you are subsiquently being kicked, and your warning count has increased by 1.`); });
                    target.kick();
                }else if(USERS[target.id].Warnings >= SETTINGS.WarningsBeforeBan){
                    Utilities.embedMessage(Bot, msg, undefined, "Warned And Banned User", `Banned ${msg.author} (${msg.author.id})\n\`\`${args[1]}\`\``, "#ff0000", `Banned by ${Bot.user.name}`, false)
                    target.createDM()
                        .then(dmChannel => { dmChannel.send(`${target}, You are being warned, and banned for: ${args[1]}, you are subsiquently being banned as your warnings are past acceptable levels.`); });
                    target.ban();
                }else{
                    Utilities.embedMessage(Bot, msg, undefined, "Warned User", `Warned ${msg.author} (${msg.author.id})\n\`\`${args[1]}\`\``, "#ff6600", `Warned by ${Bot.user.name}`, false)
                    target.createDM()
                        .then(dmChannel => { dmChannel.send(`${target}, You are being warned for: ${args[1]}, and your server warnings have increased by 1.`); });
                }
            }else{
                Utilities.embedMessage(Bot, msg, undefined, "Warned User", `Warned ${msg.author} (${msg.author.id})\n\`\`${args[1]}\`\``, "#ff6600", `Warned by ${Bot.user.name}`, false)
                target.createDM()
                    .then(dmChannel => { dmChannel.send(`${target}, You are being warned for: ${args[1]}.`); });
            }

            resolve("!Warn Executed, No Errors");
        });
	},
};