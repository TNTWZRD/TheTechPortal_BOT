const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'bogus',
    aliases: [],
    description: 'A random command, that returns what you say',
    help: '!bogus (SOMETHING): A random Command',
    usage: `(SOMETHING)`,
    args: false,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.FUN,
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Condition
            if(false){
                msg.reply("MESSAGE");
                return reject("MESSAGE") }
            
            msg.channel.send(`Bogus Reply ${args.join(' ')}`);

            resolve("!Bogus Executed, No Errors");
        });
	},
};