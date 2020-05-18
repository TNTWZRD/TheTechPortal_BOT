/*
    Written By Daniel Jajliardo @ TheTechSphere 2020
    Used To Log Data to console for my Discord.JS Bot
    Currently returns a priomise in order to make it Async
*/

exports.LEVEL = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    PROFANITY: 'profanity',
    MUSIC: 'music',
};


exports.LOG = (CONTENTS, LVL = this.LEVEL.INFO) => {
    return new Promise((resolve, reject) => {
        var LOGCONTENTS = "";

        switch(LVL) {
            case this.LEVEL.INFO:
                LOGCONTENTS += "[INFO]";
            break;
            case this.LEVEL.WARNING:
                LOGCONTENTS += "[WARNING]";
            break;
            case this.LEVEL.ERROR:
                LOGCONTENTS += "[ERROR]";
            break;
            case this.LEVEL.PROFANITY:
                LOGCONTENTS += "[PROFANITY]";
            break;
            case this.LEVEL.MUSIC:
                LOGCONTENTS += "[MUSIC]";
            break;
            default:
                LOGCONTENTS += "[NULL]";
            break;
        }

        LOGCONTENTS += "[" + getDate() + "]:: ";
        LOGCONTENTS += CONTENTS;

        if(LOGCONTENTS) console.log(LOGCONTENTS);

        if(!LOGCONTENTS) reject("No Log Contents");
        else resolve();
    });
};

function getDate() {
    var d = new Date();
    var date = d.getFullYear().toString().slice(2, 4) + "W" + ("00" + ISO8601_week_no(d)).slice(-2) + "B" + ("00" + d.getDay().toString()).slice(-2);
    var time = (d.getHours() % 12) + ":" + (d.getMinutes()) + " " + ((d.getHours > 12) ? 'AM' : 'PM');
    return date + " -- " + time;
}

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
}