const Discord = require('discord.js');
const Bot = new Discord.Client();
const fetch = require('node-fetch');
const fs = require('fs');

// Setup Varibles

Bot.commands = new Discord.Collection();
Bot.MusicQueue = new Map();
Bot.MusicStreams = new Map();
Bot.Config = require('./config.json');

const { PERMISSIONS, prefix, token, DEBUG } = require(process.cwd() + '/config.json');
Bot.PERMS = PERMISSIONS;                 // << Permissions Visible Anywhere
const LOGSystem = require('LOGSystem');  // << Custom Log Module
const Utilities = require('Utilities');  // << Custom Utilities Module
const pFilter   = require('banbuilder'); // << Custom Profanity FIlter Module
const cooldowns = new Discord.Collection();


function init(){
    commandFiles = null;
    // Get all commands from ./Commands/
    commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));

    Bot.commands.each(obj => {
        delete require.cache[require.resolve(`${process.cwd()}/Commands/${obj.name}.js`)];
    });

    // Load All Commands:
    for (file of commandFiles) {
        command = require(`./Commands/${file}`);
        // Add command to collection as name:command()
        Bot.commands.set(command.name, command);
    }
}

// Add init to bot and run first time
Bot.init = init; Bot.init()


// This is the function that actualy processes all the data from the message and decides what to do with it
async function parseMessage(msg) {
    return new Promise(async (resolve, reject) => {
        var commandsArray = Utilities.splitCommands(msg.content); // Check to see if there are multiple commands

        if(commandsArray.length > 3){
            // Check if in guild, See if Guild MaxChainedCommands is less than current command count, and if user is not Server OWNER
            if(msg.guild && commandsArray.length<=Bot.SETTINGS.MaxChainedCommands+1 && !(await Utilities.hasPermissions(Bot, msg.author.id, "OWNER"))){
                msg.reply("You do not have permissions to run more than 3 commands at a time.");
                return reject("To many commands"); }
            // Check if not Server OWNER
            else if(await !Utilities.hasPermissions(Bot, msg.author.id, "OWNER")){
                msg.reply("You may not run more than 3 commands at a time.");
                return reject("To many commands"); }
        }
        
        // Enable Profanity Filter if Aplicable
        if(msg.guild && Bot.SETTINGS.ProfanityFilterCustom != -1) Utilities.PFFilter(Bot, msg, pFilter);

        // Handle each command seperately
        commandsArray.forEach(commandsArrayObj => {
            // Get CMD Args
            const args = Utilities.getArgs(commandsArrayObj);

            // Get First Command
            var commandName = args.ARGS.shift().toLowerCase();

            // Create regex for Bot Prefix
            var regex = new RegExp(`^(${Utilities.escapeRegex(Bot.Prefix)})`);
            
            // remove Prefix if is command and make sure not NULL
            if(commandName.replace(regex, '') != commandName) commandName = commandName.replace(regex, '');
            else return resolve();

            // Run command via CommandName or Find using Aliases in each command file
            const commandOBJ = Bot.commands.get(commandName) || Bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

            // Make sure commandOBJ is Valid
            if(!commandOBJ) return reject(`${commandName}: Not a valid command`);

            // Check Cooldown if command is applicable
            if(!cooldowns.has(commandOBJ.name)) cooldowns.set(commandOBJ.name, new Discord.Collection());

            const now = Date.now();
            // Get cooldowns list for this command
            const timestamps = cooldowns.get(commandOBJ.name);
            // calculate cooldown time from now if command has setting set
            const cooldownAmount = (commandOBJ.cooldown || 0) * 1000;

            // Check if cooldown list contains Author
            if(timestamps.has(msg.author.id)){
                // Calculate time of last run plus cooldown ammount to see if current time is less or not
                const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
                if(now < expirationTime) {
                    // Author running command to fast time to give a warning
                    const timeLeft =  (commandOBJ.cooldown || 0);
                    msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandOBJ.name}\` command.`)
                    return reject("Tried to run command to fast");
            }}

            // Add author to timestamps for command using NOW time to calculate future cooldowns
            timestamps.set(msg.author.id, now);
            // Auto Delete Author from list after cooldown to free up memory
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
                return reject(`Tried to run ${commandOBJ.name} inside of a DM.`);
            }
 
            // Set Module Default if NULL
            if(!commandOBJ.module) commandOBJ.module = Bot.Config.MODULES.SYSTEM;

            // Check if module command belongs to is loaded for server, if so run command, else exit
            if(msg.guild && !((commandOBJ.module & Bot.SETTINGS.ModulesEnabled)? true : false) && commandOBJ.module!=0){
                msg.reply('That Module is not enabled.')
                return reject('Module Not Enabled.'); }

            // Convert options into OPTIONS.{ "LIST":false, "HELP": false, "STAY":false }
            args.OPTIONS = Utilities.readOptions(Bot, msg, args, args.OPTIONS, commandOBJ.name, commandOBJ.help);

            // Run command if not asking for help ('-h')
            if(!args.OPTIONS.HELP) commandOBJ.execute(Bot, msg, args, commandName)
                .then(value => { if(value && DEBUG) LOGSystem.LOG(value, undefined, `Execute: ${commandOBJ.name}`); })
                .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, `Execute: ${commandOBJ.name}`); });

            // Delete commands if server is set to do so
            if(msg.guild && Bot.SETTINGS.DeleteCommandsAfterSent) msg.delete();

        });
        
        resolve();
    });
}

// Log out when bot ready so we know
Bot.once('ready', () => {
    LOGSystem.LOG("Bot READY", undefined, 'BotReady');
    pFilter.filterType(1, 1);
    LOGSystem.test() // Just for fun but nice to know its working right?
});

// Log all Bot Warnings
Bot.on('warn', async info => {
    LOGSystem.LOG(info, LOGSystem.LEVEL.WARNING, 'Client-WARN');
});

// SUPER DEBUG
// Bot.on('debug', async info => {
//     if(DEBUG) LOGSystem.LOG(info, LOGSystem.LEVEL.DEBUG, 'Client-DEBUG');
// });
    
// List of events to watch for, these are for Emoji reactions
const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

// Get raw bot data so we can sort for reactions
Bot.on('raw', async event => {

    // see if aformentioned events to watch for are in this raw packet
    if (!events.hasOwnProperty(event.t)) return;
    
    // Get data for event
    const { d: data } = event;
    // We need user
    const user = await Bot.users.fetch(data.user_id);
    // We also want to know what channel, or create DM channel in event of Emoji in DMS
    const channel = await Bot.channels.fetch(data.channel_id) || await user.createDM();
    

    // not sure what we are cheking here
    if(channel.messages.cache.get(data.message_id)) return false;

    // Get msg
    const message = await channel.messages.fetch(data.message_id);
    // Get create reaction using message reaction info
    var reaction = message.reactions.add({
       emoji: data.emoji,
       count: event? null : 0,
       me: Bot.user.id,
    });

    // Emit Event with reaction and user so we can watch for them
    Bot.emit(events[event.t], reaction, user);
})

// Check for user adding Reaction
Bot.on('messageReactionAdd', async (reaction, user) => {
    //console.log(`${user} reacted with "${reaction.emoji.name}".`);
    msg = reaction.message;

    // Check if is in guild
    if(msg.guild) {
        // Get Server
        await Utilities.GetServer(msg.guild.id, msg.guild.name)
            .then(async e => { Bot.SETTINGS = e; });
        // Get list of users
        await Utilities.addUsers(Bot, msg)
            .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'Add Users'); });
    }


    // Check if reaction is a specific Emoji
    if(reaction.emoji.name == "rules"){
        // Does ServerRole_GENERAL_USER Exist?
        if(!Bot.SETTINGS.ServerRole_GENERAL_USER) {
            msg.guild.owner.send("No GENERAL_USER Role set, please run: !settings GENERAL_USER <@ROLE> in order to use this feature.");
            return false; }
    
        // Get GENERAL_USER Role
        var GENERAL_USER = JSON.parse(Bot.SETTINGS.ServerRole_GENERAL_USER);
        // Get GENERAL_USER Role ID for assigning
        GENERAL_USER = msg.guild.roles.cache.filter(role => role.id == GENERAL_USER.id);
        // Get Author ID
        var userRoles = await msg.guild.members.fetch(user.id);
        // Get Authors Roles
        var roles = userRoles.roles;
        // See if Author already has GENERAL_USER Role
        var test1 = (roles.cache && roles.cache.has(GENERAL_USER));
        // See if Author already has GENERAL_USER Bot Level Permissions in this server
        var test2 = await Utilities.hasPermissions(Bot, user.id, "GENERAL_USER");
        // Check both tests
        if(test1 || test2){
            LOGSystem.LOG("User already has role, or has permissions", LOGSystem.LEVEL.ERROR, 'Welcome/:rules:')
            return false; }
    
        // Get Author and try add GENERAL_USER
        var tmpUser = await msg.guild.members.fetch(user.id);
        await tmpUser.roles.add(GENERAL_USER)
            .then(async e => {
                //msg.guild.channels.cache.find(ch => ch.name === 'general').send(`Welcome, ${msg.author} to ${msg.guild.name}!!`);
                if((await Utilities.GetUser(msg.guild.id, user.id)).PermissionsLevel == 0){ // Only set permissions if set to 0 already
                    await Utilities.SetUserValue(msg.guild.id, user.id, "PermissionsLevel", 1);
                }
                LOGSystem.LOG(`${user.tag} Added as GENERAL_USER of ${msg.guild.name}`);
            })
            .catch(console.error);
        // Don't run regular code in welcome
        return true;
    }
});


// Check for user Removing Reaction
Bot.on('messageReactionRemove', (reaction, user) => {
    //console.log(`${user} removed their "${reaction.emoji.name}" reaction.`);
});

// OHHHHH INCOMING MESSAGE!!!!
Bot.on('message', async msg => {
    if(msg.author.bot) return; // Ignore messages sent by the bot

    // Check if in guild or not
    if(msg.guild) {
        // Get Server Settings
        await Utilities.GetServer(msg.guild.id, msg.guild.name)
            .then(async e => { Bot.SETTINGS = e; });
        // Get User lists
        await Utilities.addUsers(Bot, msg)
            .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'Add Users'); });
    }

    // get data for current server: Settings / Users
    if(msg.channel.type === 'text') {

        // see if there is a chaneel for bot logs, if so pass to LOGSystem
        LOGSystem.logChannel = msg.guild.channels.cache.find(ch => ch.name === 'bot_log');

        // Get profanity list
        var tmp = Bot.SETTINGS.ProfanityFilterCustomWordList
        // Check if list is a url or not
        tmp = tmp.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/i);
        if(tmp) { // ProfanityCustomWordList = URL
            // Fetch URL and pass to profanity Filter
            var Words = await fetch(tmp[0]).then(e => e.json());
            pFilter.importBadWords(Words); }
        else if(tmp != []){
            // Check if json array, if so pass to Profanity filter
            var Words = JSON.parse(Bot.SETTINGS.ProfanityFilterCustomWordList);
            pFilter.importBadWords(Words); }
        
        // Check to see what mode profanity filter should be set to -1 = dissabled
        if(Bot.SETTINGS.ProfanityFilterCustom != -1) pFilter.filterType(Bot.SETTINGS.ProfanityFilterCustom, Bot.SETTINGS.ProfanityFilterFullWords);
        // Tell Bot what our prefix is
        Bot.Prefix = Bot.SETTINGS.Prefix;
    }
    else {
        Bot.SETTINGS = null;
        // Set Default Prefix
        Bot.Prefix = prefix;
        LOGSystem.logChannel = null;
    }

    // For Testing log every message to the console
    if(DEBUG) LOGSystem.LOG(`Message Received: ${msg.content}`, undefined, 'BotOnMessage')

    // Pass the message to parseMessage
    parseMessage(msg)
        .then(value => { if(value && DEBUG) LOGSystem.LOG(value, undefined, 'ParseMessage'); })
        .catch(err => { LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'ParseMessage'); });

    // If in guild add to users EXP
    if(msg.guild) Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "EXP", ((await Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id)).EXP + 1));
});

// Make sure permissions are cleared when user Banned
Bot.on('guildBanAdd', async (guild, user) => {
    await Utilities.SetUserValue(guild.id, user.id, "PermissionsLevel", 0)
        .then(LOGSystem.LOG(`User ${user.tag}, BANNED, Cleared All Permissions`, LOGSystem.LEVEL.INFO, "guildBanAdd"));
});

// Make sure permissions are cleared when user Kicked
Bot.on('guildMemberRemove', async (guildMember) => {
    await Utilities.SetUserValue(guildMember.guild.id, guildMember.user.id, "PermissionsLevel", 0)
        .then(LOGSystem.LOG(`User ${guildMember.user.tag}, REMOVED, Cleared All Permissions`, LOGSystem.LEVEL.INFO, "guildMemberRemove"));
});

// Tell the bot to login
Bot.login(token);