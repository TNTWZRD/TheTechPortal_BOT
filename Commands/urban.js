const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')

module.exports = {
    name: 'urban',
    aliases: ['dictionary'],
    description: 'Lookup a term in UrbanDictionary, or fetch a random one',
    help: '!urban (TERM): Lookup a term in UrbanDictionary, or fetch a random one',
    usage: `(TERM)`,
    args: false,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            const query = querystring.stringify( { term: args.join(' ') } );
            if(args[0]) var {list} = await fetch(`https://api.urbandictionary.com/v0/define?${query}`)
                .then(response => response.json());
            else var {list} = await fetch(`https://api.urbandictionary.com/v0/random`)
                .then(response => response.json());

            // Received Empty List
            if(!list.length){
                msg.reply(`No results for **${args.join(' ')}**.`);
                return reject("Fetch Returned NULL") }

            const [answer] = list;
            const embed = new Discord.MessageEmbed()
                .setColor('#EFFF00')
                .setTitle(answer.word)
                .setURL(answer.permalink)
                .addFields(
                    { name: 'Definition', value: Utilities.trim(answer.definition, 1024) },
                    { name: 'Example', value: Utilities.trim(answer.example, 1024) },
                    { name: 'Rating', value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down.` }
                );

            msg.channel.send(embed);

            resolve("!Urban Executed, No Errors");
        });
	},
};