module.exports = {
    name: '!ping',
    description: 'Ping!',
    help: '!ping : Used to ping the bot',
    execute(msg, args) {
        return new Promise((resolve) => {
            msg.channel.send('Pong.');
            resolve("!Ping Executed, No Errors");
        });
    },
};