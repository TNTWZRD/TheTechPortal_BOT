const Discord = require('discord.js');
const Bot = new Discord.Client();
Bot.commands = new Discord.Collection();

const fs = require('fs');

// Get all commands from ./Commands/
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

const { PERMISSIONS, prefix, token } = require('./config.json');
Bot.PERMS = PERMISSIONS;                // << Permissions Visible Anywhere
const LOGSystem = require('LOGSystem'); // << Custom Log Module
const Utilities = require('Utilities'); // << Custom Utilities Module
const pFilter = require('banbuilder');  // << Custom Profanity FIlter Module

const cooldowns = new Discord.Collection();

// Load All Commands:
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Add command to collection as name:command()
    Bot.commands.set(command.name, command);
}

function parseMessage(msg) {
    return new Promise((resolve, reject) => {
        const err = null;
        var commandsArray = Utilities.splitCommands(msg.content);

        // Profanity Check
        pFilter.censorString(msg.content)
            .then(value => { 
                if(value.CurseCount > 0){
                    LOGSystem.LOG(JSON.stringify(value), LOGSystem.LEVEL.PROFANITY, 'censorString'); 
                    Utilities.embedMessage(Bot, msg, undefined, "Action: Original Message Deleted", msg.author.tag + " : " + value.NewString, "#ff0000", "BotName", false)
                        .catch((err) => {LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'EmbedMessage'); });
                    msg.delete();
                }
            })
            .catch(err => { if(err) LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'censorString'); });
        

        // Handle each command seperately
        commandsArray.forEach(commandsArrayObj => {
            // Get CMD Args
            const args = Utilities.getArgs(commandsArrayObj);

            // Get First Command 
            var commandName = args.ARGS.shift().toLowerCase();

            // remove Prefix if is command
            if(commandName[0] == prefix) commandName = commandName.replace('!', '');
            else return resolve();

            // Run command
            const commandOBJ = Bot.commands.get(commandName)
                || Bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
                
            // Command Check
            if(!commandOBJ) return reject(`${commandName}: Not a valid command`);

            // Check Cooldown:
            if(!cooldowns.has(commandOBJ.name)) cooldowns.set(commandOBJ.name, new Discord.Collection());

            const now = Date.now();
            const timestamps = cooldowns.get(commandOBJ.name);
            const cooldownAmount = (commandOBJ.cooldown || 0) * 1000;
            
            if(timestamps.has(msg.author.id)){
                const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
                if(now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandOBJ.name}\` command.`)
                    return reject("Tried to run command to fast");
            }}

            timestamps.set(msg.author.id, now);
            setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);


            // Check to see if args are required and that we have no options selected if so
            if((commandOBJ.args && !args.ARGS.length)) {
                if(!args.OPTIONS.length){
                    let reply = `You didn't provide any arguments, ${msg.author}!`;
                    if(commandOBJ.usage) reply += `\nThe proper usage would be: \`${commandOBJ.name} ${commandOBJ.usage}\``;
                
                    msg.channel.send(reply);
                    return reject("No Arguments Provided");
            }}

            // Check if command is guild only and message was sent from DM
            if(commandOBJ.guildOnly && msg.channel.type !== 'text'){
                msg.reply('I can\'t execute that command inside of DMs!');
                return reject('Tried to run inside of a DM.');
            }

            // Convert options into { "LIST":false, "HELP": false, "STAY":false }
            args.OPTIONS = Utilities.readOptions(Bot, msg, args, args.OPTIONS, commandOBJ.name, commandOBJ.help);
            
            // Run command if not asking for help ('-h')
            if(!args.OPTIONS.HELP) commandOBJ.execute(Bot, msg, args)
                .then(value => { if(value) LOGSystem.LOG(value, undefined, `Execute: ${commandOBJ.name}`); })
                .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, `Execute: ${commandOBJ.name}`); });
        
        });
        
        if(msg.channel.type === 'text') Utilities.SetServerData(msg.guild.id, Bot.ServerData);
   
        if(err) reject(err);
        else resolve();
    });
}

Bot.once('ready', () => {
    LOGSystem.LOG("Bot READY", undefined, 'BotReady');
    pFilter.filterType(0, 1);
});

Bot.on('message', msg => {
    // Ignore messages sent by the bot
    if(msg.author.bot) return;

    // get data for current server: Settings / Users
    if(msg.channel.type === 'text') Bot.ServerData = JSON.parse(Utilities.getServerData(msg.guild.id));
    else Bot.ServerData = null;

    Utilities.addUsers(Bot, msg)
        .then(value => { if(value) LOGSystem.LOG(value, undefined, 'Add Users'); })
        .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'Add Users'); });

    // For Testing log every message to the console
    LOGSystem.LOG(`Message Received: ${msg.content}`, undefined, 'BotOnMessage')

    parseMessage(msg)
        .then(value => { if(value) LOGSystem.LOG(value, undefined, 'ParseMessage'); })
        .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'ParseMessage'); });

});

Bot.login(token);