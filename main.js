const Discord = require('discord.js');
const Bot = new Discord.Client();
Bot.commands = new Discord.Collection();
Bot.MusicQueue = new Map();
Bot.MusicStreams = new Map();

const fs = require('fs');

// Get all commands from ./Commands/
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

const { PERMISSIONS, prefix, token, DEBUG } = require('./config.json');
Bot.PERMS = PERMISSIONS;                // << Permissions Visible Anywhere
const LOGSystem = require('LOGSystem'); // << Custom Log Module
const Utilities = require('Utilities'); // << Custom Utilities Module
const pFilter = require('banbuilder');  // << Custom Profanity FIlter Module

const cooldowns = new Discord.Collection();

// Load All Commands:
for (const file of commandFiles) {
    const command = require(`./Commands/${file}`);
    // Add command to collection as name:command()
    Bot.commands.set(command.name, command);
}

async function parseMessage(msg) {
    return new Promise((resolve, reject) => {
        const err = null;
        var commandsArray = Utilities.splitCommands(msg.content);

        if(msg.guild) Utilities.PFFilter(Bot, msg, pFilter);

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
            if(!args.OPTIONS.HELP) commandOBJ.execute(Bot, msg, args, commandName)
                .then(value => { if(value && DEBUG) LOGSystem.LOG(value, undefined, `Execute: ${commandOBJ.name}`); })
                .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, `Execute: ${commandOBJ.name}`); });

            if(msg.guild && Bot.ServerData.SETTINGS.DeleteCommandsAfterSent) msg.delete();

        });

        if(msg.guild) Utilities.SetServerData(msg.guild.id, Bot.ServerData);

        if(err) reject(err);
        else resolve();
    });
}

Bot.once('ready', () => {
    LOGSystem.LOG("Bot READY", undefined, 'BotReady');
    pFilter.filterType(0, 1);
});

Bot.on('message', async msg => {
    // Ignore messages sent by the bot
    if(msg.author.bot) return;

    // get data for current server: Settings / Users
    if(msg.channel.type === 'text') {
        Bot.ServerData = JSON.parse(Utilities.getServerData(msg.guild));
        LOGSystem.logChannel = msg.guild.channels.cache.find(ch => ch.name === 'bot_log');
    }
    else {
        Bot.ServerData = null;
        LOGSystem.logChannel = null;
    }

    if(msg.guild)Utilities.addUsers(Bot, msg)
        .then(value => { if(value && DEBUG) LOGSystem.LOG(value, undefined, 'Add Users'); })
        .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'Add Users'); });

    // See if message was in welcome channel
    if(msg.channel.name == "welcome"){
        // see if GENERAL_USER role set in settings
        
        if(msg.content.includes(":rules:")) {
            
            if(!Bot.ServerData.SETTINGS.ServerRole_GENERAL_USER) {
                msg.guild.owner.send("No GENERAL_USER Role set, please run: !settings GENERAL_USER <@ROLE> in order to use this feature.");
                return false; }

            var tmpData = Bot.ServerData;
            var USERS = tmpData.USERS;
            await msg.guild.member(msg.author).roles.add(tmpData.SETTINGS.ServerRole_GENERAL_USER.id)
                .then(e => {
                    //msg.guild.channels.cache.find(ch => ch.name === 'general').send(`Welcome everyone, ${msg.author} to ${msg.guild.name}!!`);
                    if(USERS[msg.author.id].PermissionsLevel == 0){ // Only set permissions if set to 0 already
                        console.log(USERS[msg.author.id].PermissionsLevel)
                        USERS[msg.author.id].PermissionsLevel = 1; 
                        console.log(USERS[msg.author.id].PermissionsLevel); } // Set to general user instead of EVERYONE
                    LOGSystem.LOG(`${msg.author.tag} Added as GENERAL_USER of ${msg.guild.name}`);
                })
                .catch(console.error);
            tmpData.USERS = USERS;
            msg.delete();
            // Don't run regular code in welcome
            return true;
        }
        else{
            msg.delete();
            return false;
        }
    }

    // For Testing log every message to the console
    if(DEBUG) LOGSystem.LOG(`Message Received: ${msg.content}`, undefined, 'BotOnMessage')

    parseMessage(msg)
        .then(value => { if(value && DEBUG) LOGSystem.LOG(value, undefined, 'ParseMessage'); })
        .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'ParseMessage'); });

});

Bot.login(token);
