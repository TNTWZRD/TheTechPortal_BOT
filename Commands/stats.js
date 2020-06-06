const Utilities = require('Utilities')

module.exports = {
    name: 'stats',
    aliases: ['me', 'about'],
    description: 'Information about Author, or provided user',
    help: '!stats (@USER): Used to get user info',
    usage: `(@USER)`,
    minPermissions: "GENERAL_USER",
    args: false,
    guildOnly: true,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var target = msg.author.id;
            if(args[0]){
                target = msg.mentions.members.first();
                if(target) target = target.user.id
            }

            if(Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR") || target == msg.author.id){ // Must at least be a general user
                Utilities.embedMessage(Bot, msg, args, `Stats For: ${await Utilities.GetUser(Bot.SETTINGS.SUID, target).Username}`, `${JSON.stringify(await Utilities.GetUser(Bot.SETTINGS.SUID, target), null, `\t`)}`, "#3cc900", `Requested by ${msg.author.username}`, !OPTIONS.STAY);
            }else if(!target){
                msg.reply("invalid argument, please mention a player")
                return reject("invalid argument")
            }else{
                msg.reply("Im sorry you do not have permissions to view other peoples stats.")
                return reject("User did not have permissions to run command on other users")
            }

            resolve("!Stats Executed, No Errors");
        });
	},
};