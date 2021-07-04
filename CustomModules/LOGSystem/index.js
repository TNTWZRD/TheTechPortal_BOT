/*  Written By Daniel Jajliardo @ TheTechSphere 2020
    Used To Log Data to console for my Discord.JS Bot
    Currently returns a promise in order to make it Async
*/
const Utilities = require('Utilities')

// List of levels to employ
exports.LEVEL = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    PROFANITY: 'PROFANITY',
    SYSTEM: 'SYSTEM',
    MODERATION: 'MODERATION',
    MUSIC: 'MUSIC'
};

// Log channel if applicable
exports.logChannel = null;

// Actual logging command
exports.LOG = (CONTENTS, LVL = this.LEVEL.INFO, funcName) => {
    return new Promise((resolve) => {
        // If null set defualt
        if(LVL == null) LVL = this.LEVEL.INFO;
        var LOGCONTENTS = "";
        // Put log level first, use lengthen so they are all the same lenghth for easier reading
        LOGCONTENTS += `[${Utilities.lengthen(LVL, 10, '-')}]`;

        // If function its from is applicable format and add to log contents
        if(funcName) LOGCONTENTS += `[${Utilities.lengthen(funcName, 20, '-')}]`;

        // Get date and add stamp to log
        LOGCONTENTS += "[" + getDate() + "]:: ";
        LOGCONTENTS += CONTENTS;

        // Log to console
        if(LOGCONTENTS) console.log(LOGCONTENTS);

        // Log to channel if aplicable
        if(this.logChannel) this.logChannel.send(`\`\`${LOGCONTENTS}\`\``)
        resolve(); // Done Goodby
    });
};

// Get Date Formatted: [21W26B00 -- 7:36 PM UTC]
function getDate() {
    var d = new Date();
    var date = d.getFullYear().toString().slice(2, 4) + "W" + ("00" + ISO8601_week_no(d)).slice(-2) + "B" + ("00" + d.getDay().toString()).slice(-2);
    var time = (d.getHours() % 12) + ":" + (d.getMinutes()) + " " + ((d.getHours > 12) ? 'AM' : 'PM');
    return date + " -- " + time + " UTC";
};

// Get week number
function ISO8601_week_no(dt) {
    var tdt = new Date(dt.valueOf());
    var dayn = (dt.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
};


// Test of all log levels to check for errors
exports.test = () => {
    this.LOG("----- Starting Logsystem TEST -----", "LOGSYSTEM", 'LOGSystem: TEST');
    Object.keys(this.LEVEL).forEach(lvl => {
        this.LOG(`Test of ${lvl}`, lvl, 'LOGSystem: TEST');
    })
    this.LOG("Test of Custom", 'Custom', 'LOGSystem: TEST');
    this.LOG("Test of Undefined", undefined, 'LOGSystem: TEST');
    this.LOG("Test of Null", null, 'LOGSystem: TEST');
    this.LOG("------ End of Logsystem TEST ------", "LOGSYSTEM", 'LOGSystem: TEST');
}