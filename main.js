const Discord = require('discord.js');
const Bot = new Discord.Client();
Bot.commands = new Discord.Collection();
Bot.MusicQueue = new Map();
Bot.MusicStreams = new Map();
Bot.Config = require('./config.json');

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
    return new Promise(async (resolve, reject) => {
        const err = null;
        var commandsArray = Utilities.splitCommands(msg.content);

        if(commandsArray.length > 3){
            if(msg.guild && commandsArray.length<=Bot.SETTINGS.MaxChainedCommands+1 && (await Utilities.hasPermissions(Bot, msg.author.id, "OWNER"))){
                msg.reply("You do not have permissions to run more than 3 commands at a time.");
                return reject("To many commands"); }
            else {
                msg.reply("You may not run more than 3 commands at a time.");
                return reject("To many commands"); }
        }

        if(msg.guild) Utilities.PFFilter(Bot, msg, pFilter);

        // Handle each command seperately
        commandsArray.forEach(commandsArrayObj => {
            // Get CMD Args
            const args = Utilities.getArgs(commandsArrayObj);

            // Get First Command
            var commandName = args.ARGS.shift().toLowerCase();

            var regex = new RegExp(`^(${Bot.Prefix})`);
            // remove Prefix if is command
            if(commandName.replace(regex, '') != commandName) commandName = commandName.replace(regex, '');
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

            if(msg.guild && Bot.SETTINGS.DeleteCommandsAfterSent) msg.delete();

        });

        if(err) reject(err);
        else resolve();
    });
}

Bot.once('ready', () => {
    LOGSystem.LOG("Bot READY", undefined, 'BotReady');
    pFilter.filterType(1, 1);
});

Bot.on('message', async msg => {
    // Ignore messages sent by the bot
    if(msg.author.bot) return;

    if(msg.guild) {
        await Utilities.GetServer(msg.guild.id, msg.guild.name)
            .then(async e => { Bot.SETTINGS = e; });
        await Utilities.addUsers(Bot, msg)
            .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'Add Users'); });
    }

    // get data for current server: Settings / Users
    if(msg.channel.type === 'text') {
        LOGSystem.logChannel = msg.guild.channels.cache.find(ch => ch.name === 'bot_log');
        pFilter.filterType(!Bot.SETTINGS.ProfanityFilterCustom, Bot.SETTINGS.ProfanityFilterFullWords);
        Bot.Prefix = Bot.SETTINGS.Prefix;
    }
    else {
        Bot.SETTINGS = null;
        // Set Default Prefix
        Bot.Prefix = prefix;
        LOGSystem.logChannel = null;
    }

    // See if message was in welcome channel
    if(msg.channel.name == "welcome"){
        // see if GENERAL_USER role set in settings
        
        if(msg.content.includes(":rules:")) {
            
            msg.delete();

            if(!Bot.SETTINGS.ServerRole_GENERAL_USER) {
                msg.guild.owner.send("No GENERAL_USER Role set, please run: !settings GENERAL_USER <@ROLE> in order to use this feature.");
                return false; }

            var GENERAL_USER = JSON.parse(Bot.SETTINGS.ServerRole_GENERAL_USER);
            GENERAL_USER = msg.guild.roles.cache.filter(role => role.id == GENERAL_USER.id);
            var userRoles = msg.guild.member(msg.author).roles
            if((userRoles.cache && userRoles.cache.has(GENERAL_USER)) || await Utilities.hasPermissions(Bot, msg.author.id, "GENERAL_USER") ){
                LOGSystem.LOG("User already has role, or has permissions", LOGSystem.LEVEL.ERROR, 'Welcome/:rules:')
                return false; }

            await msg.guild.member(msg.author).roles.add(GENERAL_USER)
                .then(async e => {
                    //msg.guild.channels.cache.find(ch => ch.name === 'general').send(`Welcome, ${msg.author} to ${msg.guild.name}!!`);
                    if((await Utilities.GetUser(msg.guild.id, msg.author.id)).PermissionsLevel == 0){ // Only set permissions if set to 0 already
                        await Utilities.SetUserValue(msg.guild.id, msg.author.id, "PermissionsLevel", 1);
                    }
                    LOGSystem.LOG(`${msg.author.tag} Added as GENERAL_USER of ${msg.guild.name}`);
                })
                .catch(console.error);
            // Don't run regular code in welcome
            return true;
        }

        msg.delete();
        return false;
    }

    // For Testing log every message to the console
    if(DEBUG) LOGSystem.LOG(`Message Received: ${msg.content}`, undefined, 'BotOnMessage')

    parseMessage(msg)
        .then(value => { if(value && DEBUG) LOGSystem.LOG(value, undefined, 'ParseMessage'); })
        .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'ParseMessage'); });

    if(msg.guild) Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "EXP", ((await Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id)).EXP + 1));

});

Bot.login(token);