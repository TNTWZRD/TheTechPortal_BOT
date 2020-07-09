const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'slap',
    aliases: [],
    description: 'Slap Someone',
    help: '!slap <@USER : Slap User',
    usage: `<@USER>`,
    args: true,
    guildOnly: true,
    module: Config.MODULES.FUN,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var target = msg.mentions.members.first();

            // Condition
            if(!target){
                msg.reply("Please @Mention a user to use");
                return reject("No Mentioned User") }
            
            msg.channel.send(`${msg.author} Slaps the everloving shit out of ${target}`)

            resolve(`!${Utilities.camelCaseWord(module.exports.name)} Executed, No Errors`);
        });
	},
};