const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'gitissue',
    aliases: ['issue'],
    description: 'Upload Issue To PRIVATE Bot REPO (ABUSE WILL **NOT** BE TOLERATED)',
    help: '!gitissue <TITLE> "<ISSUE_DESCRIPTION>"',
    usage: `<TITLE> "<ISSUE_DESCRIPTION>"`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.SYSTEM,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            if(!Bot.Config.github_oauth) {
                msg.reply("There is no Git OAuth Code Specified");
                reject("No OAUTH Specified"); }
            
            if(!Bot.Config.github_repository) {
                msg.reply("There is no Git Repo Specified");
                reject("No Repo Specified"); }
            
            if(!args[0] || !args[1]){
                msg.reply("Not Enough Arguments use: ``!gitissue -h`` to see how to use.");
                reject("Not enough args"); }
                
            const URL = Bot.Config.github_repository;

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
                if(response.status !== 201) {
                    console.log(response)
                    msg.reply("There was an issue with your request.");
                    reject("Error");
                }
                else {
                    embed = new Discord.MessageEmbed();
                    embed.setTitle(`New Issue: ${(args[0]).replace(/^"|"$/g, '')}`);
                    embed.setURL((response.headers.get('location')).replace('https://api.github.com/repos/', 'https://github.com/'));
                    embed.setColor("#00ff00");
                    embed.setDescription((args[1]).replace(/^"|"$/g, ''));
                    msg.channel.send(embed);
                }
            });

            resolve("!GitIssue Executed, No Errors");
        });
	},
};