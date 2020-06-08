const Utilities = require('Utilities')

module.exports = {
    name: 'bogus',
    aliases: [''],
    description: '',
    help: '!bogus (NUM): A random Command',
    usage: `(NUM)`,
    args: false,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
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