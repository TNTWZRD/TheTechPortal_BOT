const Utilities = require('Utilities')

module.exports = {
    name: 'invite',
    aliases: [''],
    description: 'Get link to invite bot to your server',
    help: '!invite : Get link to invite the bot to your server',
    usage: ``,
    args: false,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            msg.author.createDM()
                .then(dmChannel => { dmChannel.send(`Invite Me To Your Server! : https://discordapp.com/oauth2/authorize?client_id=709411700734165072&scope=bot&permissions=2146958847&response_type=code`) })

            resolve("!invite Executed, No Errors");
        });
	},
};