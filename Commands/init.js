const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'init',
    aliases: [''],
    description: 'Init Bot',
    help: '!Init : Init Bot',
    usage: ``,
    args: false,
    guildOnly: true,
    minPermissions: "OWNER",
    module: Config.MODULES.SYSTEM,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Condition
            if(!(await Utilities.hasPermissions(Bot, msg.author.id, "OWNER"))){
                msg.reply("You do not have the required privileges to run this command");
                return reject("Insufficient Perms"); }
            
            var random = Utilities.randomString(50);
            Utilities.SetServerValue(Bot.SETTINGS.SUID, "AuthCode", random);
            msg.author.createDM()
                .then(dmChannel => { dmChannel.send(`Your AuthCode for Server:'${Bot.SETTINGS.SUID}', Is: '${random}', Register https://gurubot.jajliardo.com/?register To Monitor your bot!`) });

            resolve("!Init Executed, No Errors");
        });
	},
};