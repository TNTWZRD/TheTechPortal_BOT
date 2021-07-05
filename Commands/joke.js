const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'joke',
    aliases: [],
    description: 'Pull a random Joke from the Eather.',
    help: '!joke: Pull a random Joke from the Eather.',
    args: false,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.FUN,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var list = await fetch(`https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist,explicit`)
                .then(response => response.json());

            var answer = list;
            if(answer.type=='single'){
                answer.joke = Utilities.trim(answer.joke, 1024);
            }
            else if(answer.type=='twopart'){
                answer.setup = Utilities.trim(answer.setup, 1024);
                answer.delivery = Utilities.trim(answer.delivery, 1024);
            }

            var data = [];
            if(answer.type=='single'){
                data.push(`\n${answer.joke}\n`);
            }
            else if(answer.type=='twopart'){
                data.push(`${answer.setup} \n\n`);
                data.push(`||${answer.delivery}||\n`);
            }

            Utilities.embedMessage(Bot, msg, args, Utilities.camelCaseWord("Joke Category: " + answer.category), data, '#efff00', "Joke provided by: https://sv443.net/jokeapi/v2/", false)

            resolve("!Joke Executed, No Errors");
        });
	},
};