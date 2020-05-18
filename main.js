const Discord = require('discord.js');
const Bot = new Discord.Client();
Bot.commands = new Discord.Collection();

const fs = require('fs');

// Get all commands from ./Commands/
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

const { prefix, token } = require('./config.json');
const LOGSystem = require('LOGSystem');
const Utilities = require('Utilities');
const pFilter = require('banbuilder');

// Load All Commands:
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Add command to collection as name:command()
    Bot.commands.set(command.name, command);
}

async function embedMessage(msg, args, title, description, color, footer, killAfterTime = true, aliveTime = 30000){
    let embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter(footer);
    msg.channel.send(embed)
        .then(async msg => {
            for (emoji of ['❌']) await msg.react(emoji);

            var filter = (reaction, user) => reaction.emoji.name === '❌' && user.id != Bot.user.id;
            var collector = msg.createReactionCollector(filter, { time: aliveTime });
            collector.on('collect', r => collector.stop());
            collector.on('end', r => {
                if(killAfterTime) msg.delete()
            })
        })
        .catch(console.error)
}

function parseMessage(msg) {
    return new Promise((resolve, reject) => {
        const err = null;
        var cmds = Utilities.splitCommands(msg.content);
        
        cmds.forEach(cmd => {
            // Get CMD Args
            const args = Utilities.getArgs(msg.content);

            // Profanity Check
            pFilter.censorString(msg.content)
                .then(value => { 
                    if(value.CurseCount > 0){
                        LOGSystem.LOG(JSON.stringify(value), LOGSystem.LEVEL.PROFANITY); 
                        embedMessage(msg, args, "Action: Original Message Deleted", msg.author.tag + " : " + value.NewString, "#ff0000", "BotName", false);
                        msg.delete();
                    }
                })
                .catch(err => { if(err) LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR); });

            // remove Prefix if is command
            if(args.ARGS[0][0] == prefix) args.ARGS[0][0] == '';
            else resolve("Not a command");

            // Command Check
            if(!Bot.commands.has(args.ARGS[0])) resolve("Not a valid command");

            Bot.commands.get(args.ARGS[0]).execute(msg, args)
                .then(value => { if(value) LOGSystem.LOG(value); })
                .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR); });
        
        });

        if(err) reject(err);
        else resolve();
    });
}

Bot.once('ready', () => {
    LOGSystem.LOG("Bot READY");
    pFilter.filterType(0, 1);
});

Bot.on('message', msg => {
    // Ignore messages sent by the bot
    if(msg.author.bot) return;

    // For Testing log every message to the console
    LOGSystem.LOG(`Message Received: ${msg.content}`)

    parseMessage(msg);

});

Bot.login(token);