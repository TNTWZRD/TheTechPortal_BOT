const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'args-info',
    aliases: ['args', 'a'],
    args: true,
    description: 'Information about the arguments provided',
    help: '!args <ARGUMENTS>: used test to see if but is receiving arguments',
    usage: `<ARGUMENT> (OPTIONS)`,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.SYSTEM,
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