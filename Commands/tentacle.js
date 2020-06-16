const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'tentacle',
    aliases: [],
    description: 'Slaps a person with a tentacle.',
    help: '!tentacle <@NAME>: Ghave slaps @targetuser with a tentacle',
    usage: `<@NAME>`,
    args: true,
    guildOnly: true,
    module: Config.MODULES.FUN,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Get Target User
            var target = msg.mentions.members.first();

            if(await Utilities.hasPermissions(Bot, target.user.id, 'MODERATOR')){
                msg.channel.send(`${target.user} has deflected such behavior from ${msg.author}`);
                return reject("Cant tentacle OP"); }
            
            msg.channel.send(`Ghave slaps ${target.user} with a tentacle`);

            resolve("!Tentacle Executed, No Errors");
        });
	},
};