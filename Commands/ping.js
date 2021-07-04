const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'ping',
    description: 'Ping!',
    help: '!ping : Used to ping the bot',
    guildOnly: false,
    cooldown: 0,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.SYSTEM,
    execute(Bot, msg, args) {
        return new Promise((resolve) => {
            msg.channel.send('Pong.');
            resolve("!Ping Executed, No Errors");
        });
    },
};