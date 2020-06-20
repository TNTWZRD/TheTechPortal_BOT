const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'ticket',
    aliases: [],
    description: 'Clear messages in channel',
    help: '!clear <NUMBER>: clear number of messages',
    usage: `<NUMBER>`,
    args: false,
    guildOnly: false,
    module: Config.MODULES.SYSTEM,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Condition
            if(false){
                msg.reply("MESSAGE");
                return reject("MESSAGE") }

            resolve(`!${Utilities.camelCaseWord(module.exports.name)} Executed, No Errors`);
        });
	},
};