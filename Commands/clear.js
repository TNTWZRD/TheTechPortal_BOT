const Utilities = require('Utilities')

module.exports = {
    name: 'clear',
    aliases: ['delete'],
    description: 'Clear messages in channel',
    help: '!clear <NUMBER>: clear number of messages',
    args: true,
    usage: `<NUMBER>`,
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            if(USERS[msg.author.id].PermissionsLevel & Bot.PERMS.MODERATOR){
                if (!args[0]) {
                    msg.reply("Error please define second arg") 
                    return reject("Didn't Supply Enough Arguments") }
                
                if(parseInt(args[0]) >= 99) {
                    msg.reply("Cannot Delete More Than 99 Messages At A Time")
                    return reject("Tried to delete to many messages")
                }else{
                    var tempVar = Math.min((parseInt(args[0])+1), 100);
                    msg.channel.messages.fetch({ limit: tempVar })
                        .then(messages => msg.channel.bulkDelete(messages, true))
                        .catch(console.error);
                }
            }else{
                msg.reply("Im sorry you do not have permissions to clear messages")
                return reject("User had insufficient permissions");
            }
            resolve("!Clear Executed, No Errors");
        });
	},
};