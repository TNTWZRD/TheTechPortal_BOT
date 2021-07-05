/*
    Written By Daniel Jajliardo @ TheTechSphere 2020
    Random Functions for my Discord.JS Bot
    Currently returns a promise in order to make it Async
*/

// Impport and declaire important vars
const Discord = require('discord.js');
const LOGSystem = require('LOGSystem')
var fs = require('fs');
var config = require(process.cwd() + '/config.json');
const mysql = require('mysql');
const { promises } = require('stream');

// MYSQL Connection settings
var connection = mysql.createConnection({
    host: config.MYSQL.HOST,
    user: config.MYSQL.USER,
    password: config.MYSQL.PASSWORD,
    database: config.MYSQL.DB
});

// Connect to MYSQL for database functions
connection.connect(function(err){
    if(err) throw err;
    LOGSystem.LOG("Mysql Connected!!", undefined, 'Modules/Utilities');
});

// Get Server Settings from MYSQL
exports.GetServer = (ServerID, ServerName) => {
    return new Promise((resolve, reject) => { // Return Promise for ASYNC
        // Create Querry
        var query = `SELECT * FROM \`Servers\` WHERE \`SUID\` = '${ServerID}'`;
        connection.query(query, (err, result) => { // Submit Querry
            if(err) reject(err);
            if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0]))); // Return Result
            else{ // Create New Entry, server Doesnt Exist
                var query = `INSERT INTO \`Servers\`(\`SUID\`, \`ServerName\`) VALUES ('${ServerID}','${ServerName}')`;
                connection.query(query, function(err, result, fields){
                    if(err) reject(err);
                    // Created server now return defualt settings
                    var query = `SELECT * FROM \`Servers\` WHERE \`SUID\` = '${ServerID}'`;
                    connection.query(query, (err, result) => {
                        if(err) reject(err);
                            if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0]))); // return result after creating empty.
                    });
                });
            }
        });
    });
};


// Update Server Value in SQL
exports.SetServerValue = (ServerID, Setting, Value) => {
    return new Promise((resolve, reject) => {
        // Create Querry
        var query = `UPDATE \`Servers\` SET \`${Setting}\`='${Value}' WHERE \`SUID\` = '${ServerID}'`;
        connection.query(query, (err, result) => {
            if(err) reject(err);
            // Updated Server, Now pull updated information
            var query = `SELECT * FROM \`Servers\` WHERE \`SUID\` = '${ServerID}'`;
            connection.query(query, (err, result) => {
                if(err) reject(err);
                    if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0]))); // Return new data
            });
        });
    });
}

// Get User Data From SQL for specified server
exports.GetUser = (ServerID, UserID, UserName = null, IsOwner = 0) => {
    return new Promise((resolve, reject) => {
        // Create Querry
        var query = `SELECT * FROM \`Users\` WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
        connection.query(query, (err, result) => {
            if(err) reject(err);
            if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0]))); // Return Data
            else{
                // User doesnt exist create now
                var query = `INSERT INTO \`Users\`(\`SUID\`, \`UID\`, \`Username\`, \`PermissionsLevel\`) VALUES ('${ServerID}', '${UserID}', '${UserName}', '${IsOwner}')`;
                connection.query(query, function(err, result, fields){
                    if(err) reject(err);
                    LOGSystem.LOG(`Added User: ${UserName}`, undefined, "GetUser");
                    // create querry to get updated info
                    var query = `SELECT * FROM \`Users\` WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
                    connection.query(query, (err, result) => {
                        if(err) reject(err);
                            var newResult = JSON.parse(JSON.stringify(result[0]));
                            newResult.UserName = decodeURI(newResult.UserName)
                            if(result.length > 0) return resolve(newResult); // Return Data
                            reject("Error");
                        });
                });
            }
        });
    });
}

// Set User Data for server
exports.SetUserValue = (ServerID, UserID, Setting, Value) => {
    return new Promise((resolve, reject) => {
        // Create Querry
        var query = `UPDATE \`Users\` SET \`${Setting}\`='${Value}' WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
        connection.query(query, (err, result) => {
            if(err) reject(err);
            // Get Updated Info
            var query = `SELECT * FROM \`Users\` WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
            connection.query(query, (err, result) => {
                if(err) reject(err);
                    if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0]))); // Return Data
                    reject("Error");
                });
        });
    });
}

// Small function to trim text to specified length
exports.trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

// Small function that just padds text to desired length
exports.lengthen = (str, min, char = '‏‏‎ ') => { while(str.length < min) str += char; return str; }

// Check if user has permissions level
exports.hasPermissions = async (Bot, UserID, LEVEL) => {
    // Get user data
    var perm = await this.GetUser(Bot.SETTINGS.SUID, UserID);
    LOGSystem.LOG(
        `SUID = ${Bot.SETTINGS.SUID} AND UID = ${UserID}, ${perm.PermissionsLevel} == ${LEVEL} <<-- ${((perm.PermissionsLevel & Bot.PERMS[LEVEL]) == Bot.PERMS[LEVEL])}`, 
        LOGSystem.LEVEL.DEBUG, 
        'Modules/Utilities');
    return ((perm.PermissionsLevel & Bot.PERMS[LEVEL]) == Bot.PERMS[LEVEL]); // Retrun BOOL if Perms match or not
}

// Create new user if not in Database
exports.addUsers = (Bot, msg) => {
    return new Promise(async resolve => {
        // Get all users mentioned in message
        msg.mentions.members.forEach(async e => { 
            var owner = 0;
            // Check if user is Server owner?
            if(e.user.id == msg.guild.ownerID) owner = 15;
            // Send to get user as it will add user if not exists
            await this.GetUser(Bot.SETTINGS.SUID, e.user.id, e.user.username+"#"+e.user.discriminator , owner); 
        });
        var owner = 0;
        // Check if user is Server owner?
        if(msg.author.id == msg.guild.ownerID) owner = 15;
        // Send to get user as it will add user if not exists
        await this.GetUser(Bot.SETTINGS.SUID, msg.author.id, msg.author.tag, owner).then(e=> {resolve('');})
    });
};

// Get arguments from message
exports.getArgs = (msg) => {
    var RETURN = false
    var newReturn = [];
    var str = msg;

    // Get Options matching `-w` style currently using '-l -s -h'
    var options = str.match(/(\s[-]+[^0-9])/g)
    // Remove spaces
    if(options) options.forEach((val, index) => { options[index] = val.replace(' ', ''); });
    // Remove Options from str
    if(options && options.length >= 1) options.forEach(i => { str = str.replace(i, ''); });
    if(!options) options = [];

    // Split strings by spaces, only if not surrounded by quotes
    RETURN = str.split(/"([^"]+)"|\s*([^"\s]+)/g)
    RETURN.forEach(element => {
        if(element && element != '' && element != ' ') newReturn.push(element)
    });
    RETURN = newReturn

    // Return new ARGS and OPTIONS
    return {"ARGS":RETURN, "OPTIONS":options}
}

// Split commands by ';' Delimiter
exports.splitCommands = (msg) => { return msg.split(';') }

// Create Embeded message with Emoji Controlls 
async function embedMessage(Bot, msg, args, title, description, color, footer, killAfterTime = true, aliveTime = 30000){
    return new Promise((resolve, reject) => {
        let err = null;
        // Create Embed with specified options
        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter(footer);
        
        // Send embed to channel
        msg.channel.send(embed)
            .then(async msg => {
                // React with Emoji so user can click if needed
                for (emoji of ['❌']) await msg.react(emoji);

                // create filter to make sure we get the right reaction
                var filter = (reaction, user) => reaction.emoji.name === '❌' && user.id != Bot.user.id;
                // create collector with specified alive time
                var collector = msg.createReactionCollector(filter, { time: aliveTime });
                // create onCollect
                collector.on('collect', r => collector.stop()); // this ends the collector
                // what to do when collector ends
                collector.on('end', r => {
                    // if kill after time set, delete Embed!
                    if(killAfterTime) msg.delete()
                });
            })
            .catch(console.error);
        
        if(!err) resolve();
        else reject("There was an error.");
    });
}
exports.embedMessage = embedMessage;

// Turn options into array of options
exports.readOptions = (Bot, msg, args, OPTIONS, CMD_NAME, HelpMsg) => { // <<--- ['-l', '-h', '-s']
    // set base return values to update
    RETURN = { "LIST":false, "HELP": false, "STAY":false , "EXTRA":null};
    if(OPTIONS && OPTIONS.length > 0){
        // check each option if exists and update return flag for corrisponding values to true if present
        OPTIONS.forEach(e => {
            switch(e) {
                case '-l':
                    RETURN.LIST = true;
                break;
                case '-s':
                    RETURN.STAY = true;
                break;
                case '-h':
                    // HELP!! We create a Embeded Message with all the help data for user with some options!
                    this.embedMessage(Bot, msg, args, `${Bot.user.username} : Command ${CMD_NAME}`, HelpMsg, "#00ff00", Bot.user.name, !OPTIONS.STAY);
                    RETURN.HELP = true;
                break;
                default:
                    e.sub;
            }
        });
    }
    return RETURN; // lol Return RETURN!
}

// filter mesages for profanity!
exports.PFFilter = (Bot, msg, pFilter) => {
    return new Promise((resolve) => {
        // Profanity Check
        pFilter.censorString(msg.content)
        .then(value => { 
            // !!! CURSES!
            if(value.CurseCount > 0){
                LOGSystem.LOG(JSON.stringify(value), LOGSystem.LEVEL.PROFANITY, 'censorString');
                
                // Funny response for profanit, no despawn!
                this.embedMessage(Bot, msg, undefined, `Slapped ${msg.author.tag} for Profanity`, `Original Message: \`\` ${value.NewString}.\`\``, "#ff0000", Bot.user.tag, false);
                
                // OOHHH does this server have KickBan Enabled?
                if(Bot.SETTINGS.ProfanityFilterKickBan) {
                    // It is so lets send a message to the profanity author
                    msg.channel.send(`${msg.author}, Profanity, including cursing and racism will not be tolerated in this server, repeated offences will result in a **BAN**.`)
                    
                    // Does this user have more warnings then min for kick but less than that for ban?
                    if(Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings >= Bot.SETTINGS.WarningsBeforeKick && Utilities.GetUser(Bot.SETTINGS.SUID, mg.author.id).Warnings < Bot.SETTINGS.WarningsBeforeBan ){
                        // YES lets kick an asshole! send message to channel involved
                        this.embedMessage(Bot, msg, undefined, "Kicked User For Profanity", `Kicked ${msg.author} (${msg.author.id})`, "#ff6600", `Kicked by ${Bot.user.name}`, false)
                        // Aight, now lets boot the fool!
                        msg.guild.members.fetch(msg.author.id)
                            .then(user => {
                                // Suppose we should send the user some feedback as to why they where kicked!
                                user.createDM()
                                    .then(dmChannel => { dmChannel.send(`${msg.author},  Profanity, including cursing and racism will not be tolerated in this server, repeated offences will result in a **BAN**.  Contact the Server owner if you beleve this is an error!`); });
                                user.kick();
                            });
                            // Increment warnings!
                            Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "Warnings", (Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings+1));
                    }
                    // Is user over warning limit for a ban?
                    else if(Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings >= Bot.SETTINGS.WarningsBeforeBan){
                        // well they where warned, send channel message
                        this.embedMessage(Bot, msg, undefined, "Banned User For Profanity", `Banned ${msg.author} (${msg.author.id})`, "#ff0000", `Banned by ${Bot.user.name}`, false)
                        // Get user and BAN
                        msg.guild.members.fetch(msg.author.id)
                            .then(user => {
                                // Send user some feedback
                                user.createDM()
                                    .then(dmChannel => { dmChannel.send(`${msg.author},  Profanity, including cursing and racism will not be tolerated in this server. You have been **BANNED**. Contact the Server owner if you beleve this is an error!`); });
                                user.ban();
                            });
                            // Increment Warnings Again
                            Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "Warnings", (Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings+1));
                    }
                    // No bans or kicks, but we can increment warnings at least
                    else Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "Warnings", (Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings+1));
                }
                // Delete the profane message
                msg.delete();
            }
        })
        .catch(err => { if(err) LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'censorString'); });
        resolve();
    });
}


// Get a files contents
exports.getFile = (FILE) => {
    return new Promise((resolve) => {
        var toReturn = null;
        // Add cwd to filename for correct grabbing of data
        FILE = process.cwd()+FILE;
        // check if file exists
        if(fs.existsSync(FILE)){
            // open file
            toReturn = fs.readFileSync(FILE, 'utf8', function(err, contents){
                if(!err) {
                    return contents;
                }else {
                    // OOPS error, lets log
                    LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'getFile');
                    return false;
                }
            });
        }else{
            // No file, so no data
            toReturn = false;
        }
        resolve(toReturn);
    });
}

// Open file and right to it!
exports.setFileData = (FILE, NewData) => {
    success = true;
    // Add cwd to filename for correct grabbing of data
    FILE = process.cwd()+FILE;
    // open file and write data to it!
    fs.writeFileSync(FILE, JSON.stringify(NewData, null, "\t"), function(err){
        if(err) {
            // Log our errors for easy debugging!
            LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'setFileData');
            success = false;
        }
    });
    // return i guess?
    return success;
}

// Like it says generates a random string!
exports.randomString = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    // Loop and randomly pick characters and put in result untill we are long enough to return!
    for ( var i = 0; i < length; i++ ) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

// this escapse characters that can mess things up!
exports.escapeRegex = (string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Randomly shuffle an array for reasons unknown
exports.shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Camel Case Is Lord, You Always Need A Function For This
exports.camelCaseWord = (str) => {
    str = str.split(''); 
    str[0] = str[0].toLocaleUpperCase(); 
    str = str.join('');
    return str;
}