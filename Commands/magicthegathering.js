const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'magicthegathering',
    aliases: ['mtg'],
    description: 'Lookup Magic The Gathering card',
    help: '!magicthegathering <CARDNAME>: Lookup Magic The Gathering card by card name',
    usage: `<CARDNAME>`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.FUN,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var querry = querystring.stringify( { name: args.join(' ') } );
            var CARD = await fetch(`https://api.magicthegathering.io/v1/cards?${querry}`)
                .then(response => { if(response.ok) return response.json(); else return false; })
                .catch(console.error)

            if(!CARD){
                msg.reply(`Nothing found for [${args.join[' ']}], please search again using correct card name.`);
                return reject("Invalid Card Lookup"); }

            var data = [];
            var embed = new Discord.MessageEmbed();
            if(CARD) {
                CARD.cards.some(e =>{
                    if(e.multiverseid) {
                        CARD = e;
                        return true;
                    }
                });

                var manaCost = CARD.manaCost.replace(/\{W\}/g, '{ White }');
                manaCost = manaCost.replace(/\{G\}/g, '{ Green }');
                manaCost = manaCost.replace(/\{B\}/g, '{ Black }');
                manaCost = manaCost.replace(/\{U\}/g, '{ Blue }');
                manaCost = manaCost.replace(/\{R\}/g, '{ Red }');

                var description = null;
                if(CARD.text) description = CARD.text;
                description += "\n"+CARD.flavor;

                description = description.replace(/\{W\}/g, '{ White }');
                description = description.replace(/\{G\}/g, '{ Green }');
                description = description.replace(/\{B\}/g, '{ Black }');
                description = description.replace(/\{U\}/g, '{ Blue }');
                description = description.replace(/\{R\}/g, '{ Red }');

                var cardName = null
                if(CARD.names && CARD.names.length > 0) cardName = CARD.names[0]+' : '+CARD.names[1];
                if(!cardName) cardName = CARD.name;

                embed.setTitle(`Magic The Gathering Card: ${cardName}\nMID: ${CARD.multiverseid}`);
                if(CARD.imageUrl) embed.setThumbnail(CARD.imageUrl);
                
                data.push(`**Set**: ${CARD.setName}`)
                data.push(`**Color - Rarity**: ${CARD.colors[0]} - ${CARD.rarity}`);
                data.push(`**Mana Cost**: ${manaCost}`);

                data.push(`\n**Description**: \n${description}\n`)

                if(CARD.type.includes("Creature")){
                    data.push(`**${CARD.power}/${CARD.toughness}**\n`)
                }

                data.push(`**Legalities**:`)
                CARD.legalities.forEach(e => {
                    data.push(` - **${e.format}** : ${e.legality}`);
                });

                data.push(`\n**Rulings**:`)
                CARD.rulings.forEach(e => {
                    data.push(` - **${e.date}** : ${e.text}`);
                });

                embed.setDescription(data)
            }
            embed.setFooter('Data provided by: magicthegathering.io');

            if(msg.guild) msg.channel.send(embed);
            else msg.reply(embed)

            resolve("!MagicTheGathering Executed, No Errors");
        });
	},
};  