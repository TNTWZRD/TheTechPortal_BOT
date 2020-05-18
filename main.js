const Discord = require('discord.js');
const Bot = new Discord.Client();

const { prefix, token } = require('./config.json');
const LOGSystem = require('LOGSystem');


Bot.once('ready', () => {
    LOGSystem.LOG("Bot READY");
});

Bot.on('message', msg => {
    // Ignore messages sent by the bot
    if(msg.author.bot) return;

    // For Testing log every message to the console
    LOGSystem.LOG(`Message Received: ${msg.content}`)
        .then(LOG => { console.log(LOG); });

    // Basic Command reading
    if (msg.content === `${prefix}ping`) {
        msg.channel.send('Pong.');
    } else if (msg.content === `${prefix}beep`) {
        msg.channel.send('Boop.');
    }
});

Bot.login(token);