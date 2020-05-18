const Utilities = require('Utilities')

module.exports = {
    name: 'args-info',
    aliases: ['args', 'a'],
    args: true,
    description: 'Information about the arguments provided',
    help: '!args <ARGUMENTS>: used test to see if but is receiving arguments',
    usage: `<ARGUMENT> (OPTIONS)`,
    guildOnly: false,
	execute(Bot, msg, _args) {
        return new Promise((resolve) => {
            const options = _args.OPTIONS;
            const args = _args.ARGS;

            if(args[0] == 'foo') msg.channel.send('bar');
            
            msg.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);

            resolve("!Args-Info Executed, No Errors");
        });
	},
};