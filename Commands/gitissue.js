const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')

module.exports = {
    name: 'gitissue',
    aliases: ['issue'],
    description: 'Upload Issue To PRIVATE Bot REPO (ABUSE WILL **NOT** BE TOLERATED)',
    help: '!gitissue <TITLE> "<ISSUE_DESCRIPTION>"',
    usage: `<TITLE> "<ISSUE_DESCRIPTION>"`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            const URL = "https://api.github.com/repos/TNTWZRD/TheTechPortal_BOT/issues";

            if(!args[0] || !args[1]){
                msg.reply("Not Enough Arguments use: ``!gitissue -h`` to see how to use.");
                reject("Not enough args"); }

            var GitHub = await fetch(`${URL}`, {
                headers: {
                    'Authorization':`token ${Bot.Config.github_oauth}`,
                },
                method: "POST",
                body: JSON.stringify({
                    "title":`${args[0]} - {${msg.author.tag}}`,
                    "body":args[1],
                    "labels":["TheGuru-ISSUE", "BUG"],
                    "projects":["TNTWZRD/TheTechPortal_BOT"],
                }),
            }).then(response => {
                if(response.status !== 201) msg.reply("There was an issue with your request.");
                else msg.reply("Issue Submitted, Thank you!");
                response.json();
            });

            resolve("!GitIssue Executed, No Errors");
        });
	},
};