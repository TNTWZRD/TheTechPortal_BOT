const Utilities = require('Utilities')

module.exports = {
    name: 'stats',
    aliases: ['me', 'about'],
    description: 'Information about Author, or provided user',
    help: '!stats (@USER): Used to get user info',
    usage: `(@USER)`,
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            var target = msg.author.id;
            if(args[0]){
                target = msg.mentions.members.first();
                if(target) target = target.user.id
            }

            if(target in USERS){
                if(Utilities.hasPermission(Bot, msg.author.id, "MODERATOR") || target == msg.author.id){ // Must at least be a general user
                    Utilities.embedMessage(Bot, msg, args, `Stats For: ${USERS[target].Username}`, `${JSON.stringify(USERS[target], null, `\t`)}`, "#3cc900", `Requested by ${msg.author.username}`, !OPTIONS.STAY);
                }else{
                    msg.reply("Im sorry you do not have permissions to view other peoples stats.")
                    return reject("User did not have permissions to run command on other users")
                }
            }else if(!target){
                msg.reply("invalid argument, please mention a player")
                return reject("invalid argument")
            }else {
                msg.reply("No Stats Exist Yet.")
                return reject("no stats exist yet.")
            }

            resolve("!Stats Executed, No Errors");
        });
	},
};