const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')

module.exports = {
    name: 'pokemon',
    aliases: [],
    description: 'Lookup a Pokemon, Ability, Type, Item, Move, or Berry',
    help: '!pokemon <TERM>: Lookup a Pokemon, Ability, Type, Item, Move, or Berry, Poekemon with forms: (POKEMON-FORM)',
    usage: `<TERM>`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var Pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${args[0].toLowerCase().replace(/\s/g, '-')}`)
                .then(response => { if(response.ok) return response.json(); else return false; })
                .catch(console.error)
            if(!Pokemon) var Ability = await fetch(`https://pokeapi.co/api/v2/ability/${args[0].toLowerCase().replace(/\s/g, '-')}`)
                .then(response => { if(response.ok) return response.json(); else return false;  })
                .catch(console.error)
            if(!Ability) var Type = await fetch(`https://pokeapi.co/api/v2/type/${args[0].toLowerCase().replace(/\s/g, '-')}`)
                .then(response => { if(response.ok) return response.json(); else return false;  })
                .catch(console.error)
            if(!Type) var Item = await fetch(`https://pokeapi.co/api/v2/item/${args[0].toLowerCase().replace(/\s/g, '-')}`)
                .then(response => { if(response.ok) return response.json(); else return false;  })
                .catch(console.error)
            if(!Item) var Move = await fetch(`https://pokeapi.co/api/v2/move/${args[0].toLowerCase().replace(/\s/g, '-')}`)
                .then(response => { if(response.ok) return response.json(); else return false;  })
                .catch(console.error)
            if(!Move) var Berry = await fetch(`https://pokeapi.co/api/v2/berry/${args[0].toLowerCase().replace(/\s/g, '-')}`)
                .then(response => { if(response.ok) return response.json(); else return false;  })
                .catch(console.error)
            if(!Pokemon && !Ability && !Type && !Item && !Move && !Berry) {
                msg.reply(`Nothing was found for ${args[0]}, Please try something else.`)
                return reject(`Nothing was found`); }

            var data = [];
            var embed = new Discord.MessageEmbed();
            if(Pokemon) {
                embed.setTitle(`Pokemon: ${Pokemon.species.name}`);
                embed.setThumbnail(Pokemon.sprites.front_default);
                embed.setURL(`https://pokemon.fandom.com/wiki/${Pokemon.name.replace(/[\s-]/g, '_')}`);

                data.push(` - **Height**: ${Pokemon.height}`)
                data.push(` - **Weight**: ${Pokemon.weight}`)

                data.push("\n**Special Abilities**:");
                var tmp = " - ";
                Pokemon.abilities.forEach(e => {
                    tmp += `${e.ability.name}, `;
                });
                data.push(tmp+"\n");

                data.push("**Games**");
                tmp = " - ";
                Pokemon.game_indices.forEach(e => {
                    tmp += `${e.version.name}, `;
                });
                data.push(tmp+"\n");
                
                data.push("**Moves**:");
                tmp = " - ";
                Pokemon.moves.forEach(e => {
                    tmp += `${e.move.name}, `;
                });
                data.push(tmp+"\n");

                data.push("**Base Sats**:");
                tmp = "";
                Pokemon.stats.forEach(e => {
                    tmp += ` - ${e.stat.name}: ${e.base_stat}, Effort: ${e.effort} \n`;
                });
                data.push(tmp);

                data.push("**Types**:");
                tmp = " - ";
                Pokemon.types.forEach(e => {
                    tmp += `${e.type.name}, `;
                });
                data.push(tmp);

                embed.setDescription(data)
            }
            else if(Ability){
                embed.setTitle(`Pokemon Ability: ${Ability.name}`);
                embed.setURL(`https://pokemon.fandom.com/wiki/${Ability.name.replace(/[\s-]/g, '_')}`);

                data.push("\n**Effect**:");
                var tmp = "";
                Ability.effect_entries.forEach(e => {
                    tmp += `${e.effect} \n`;
                });
                data.push(tmp);

                data.push("**Flavor Text**:");
                tmp = "";
                Ability.flavor_text_entries.forEach(e => {
                    if(e.language.name == 'en') tmp += ` - **${e.version_group.name}** : \n  -- ${e.flavor_text.replace(/[\n\t\r]/g, ' ')}, \n`;
                });
                data.push(tmp);

                data.push("**Applicable Pokemon**:");
                tmp = " - ";
                Ability.pokemon.forEach(e => {
                    tmp += `${e.pokemon.name}, `;
                });
                data.push(tmp);

                embed.setDescription(data)
            }
            else if(Type){
                embed.setTitle(`Pokemon Type: ${Type.name}`);
                embed.setURL(`https://pokemon.fandom.com/wiki/${Type.name.replace(/[\s-]/g, '_')}_type`);

                data.push(`\n**Damage Class**: ${Type.move_damage_class.name}`);

                data.push("**Double Damage From**:");
                tmp = " - ";
                Type.damage_relations.double_damage_from.forEach(e => {
                    tmp += `${e.name}, `;
                });
                data.push(tmp+"\n");

                data.push("**Double Damage To**:");
                tmp = " - ";
                Type.damage_relations.double_damage_to.forEach(e => {
                    tmp += `${e.name}, `;
                });
                data.push(tmp+"\n");
                
                data.push("**Half Damage From**:");
                tmp = " - ";
                Type.damage_relations.half_damage_from.forEach(e => {
                    tmp += `${e.name}, `;
                });
                data.push(tmp+"\n");
                
                data.push("**Half Damage To**:");
                tmp = " - ";
                Type.damage_relations.half_damage_to.forEach(e => {
                    tmp += `${e.name}, `;
                });
                data.push(tmp+"\n");
                
                data.push("**No Damage From**:");
                tmp = " - ";
                Type.damage_relations.no_damage_from.forEach(e => {
                    tmp += `${e.name}, `;
                });
                data.push(tmp+"\n");
                
                data.push("**No Damage To**:");
                tmp = " - ";
                Type.damage_relations.no_damage_to.forEach(e => {
                    tmp += `${e.name}, `;
                });
                data.push(tmp+"\n");

                data.push("**Applicable Pokemon**:");
                tmp = " - ";
                Type.pokemon.forEach(e => {
                    tmp += `${e.pokemon.name}, `;
                });
                tmp = Utilities.trim(tmp, 512);
                data.push(tmp);

                data.push("**Applicable Moves**:");
                tmp = " - ";
                Type.moves.forEach(e => {
                    tmp += `${e.name}, `;
                });
                tmp = Utilities.trim(tmp, 512);
                data.push(tmp);

                embed.setDescription(data)
            }
            else if(Item){
                embed.setTitle(`Pokemon Item: ${Item.name}`);
                embed.setURL(`https://pokemon.fandom.com/wiki/${Item.name.replace(/[\s-]/g, '_')}`);

                embed.setThumbnail(Item.sprites.default)

                data.push(`**Item Category**: ${Item.category.name}`);

                data.push(`**Item Attributes**:`);
                tmp = " - ";
                Item.attributes.forEach(e => {
                    tmp += `${e.name}, `;
                });
                data.push(tmp+"\n");

                data.push(`**Item Effects**:`);
                tmp = "";
                Item.effect_entries.forEach(e => {
                    if(e.language.name == 'en') tmp += ` - ${e.effect.replace(/[\n\t\r]/g, ' ')}, \n`;
                });
                data.push(tmp);

                data.push(`**Item Flavor text**:`);
                tmp = "";
                Item.flavor_text_entries.forEach(e => {
                    if(e.language.name == 'en') tmp += ` - **${e.version_group.name}**: ${e.text.replace(/[\n\t\r]/g, ' ')}, \n`;
                });
                data.push(tmp);

                embed.setDescription(data);
            }
            else if(Move){
                embed.setTitle(`Pokemon Move: ${Move.name}`);
                embed.setURL(`https://pokemon.fandom.com/wiki/${Move.name.replace(/[\s-]/g, '_')}`);

                data.push(`**Move Accuracy**: ${Move.accuracy}`)
                data.push(`**Move Type**: ${Move.type.name}`)
                data.push(`**Damage Type**: ${Move.damage_class.name}`)
                data.push(`**Damage Power**: ${Move.power}`)
                data.push(`**Damage PP**: ${Move.pp}`)

                data.push(`**Combos Normal**:`);
                tmp = "";
                if(Move.contest_combos.normal.use_after) Move.contest_combos.normal.use_after.forEach(e => {
                    tmp += ` - **Use After**: ${e.name}, \n`;
                });
                if(Move.contest_combos.normal.use_before) Move.contest_combos.normal.use_before.forEach(e => {
                    tmp += ` - **Use Before**: ${e.name}, \n`;
                });
                data.push(tmp);

                data.push(`**Combos Super**:`);
                tmp = "";
                if(Move.contest_combos.super.use_after) Move.contest_combos.super.use_after.forEach(e => {
                    tmp += ` - **Use After**: ${e.name}, \n`;
                });
                if(Move.contest_combos.super.use_before) Move.contest_combos.super.use_before.forEach(e => {
                    tmp += ` - **Use Before**: ${e.name}, \n`;
                });
                data.push(tmp);

                data.push(`**Move Flavor text**:`);
                tmp = "";
                Move.flavor_text_entries.forEach(e => {
                    if(e.language.name == 'en') tmp += ` - **${e.version_group.name}**: ${e.flavor_text.replace(/[\n\t\r]/g, ' ')}, \n`;
                });
                data.push(tmp);

                embed.setDescription(data);
            }
            else if(Berry){
                embed.setTitle(`Pokemon Berry: ${Berry.name}`);
                embed.setURL(`https://pokemon.fandom.com/wiki/${Berry.name.replace(/[\s-]/g, '_')}_Berry`);

                embed.setThumbnail(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${Berry.name}-berry.png`)

                data.push(`**Berry Firmness**: ${Berry.firmness.name}`)
                data.push(`**Berry Growth Time**: ${Berry.growth_time}`)
                data.push(`**Berry Max Harvest**: ${Berry.max_harvest}`)
                data.push(`**Berry Natural Gift Power**: ${Berry.natural_gift_power}`)
                data.push(`**Berry Natural Gift Type**: ${Berry.natural_gift_type.name}`)
                data.push(`**Berry Size**: ${Berry.size}`)
                data.push(`**Berry Smoothness**: ${Berry.smoothness}`)
                data.push(`**Berry Soil Dryness**: ${Berry.soil_dryness}`)

                data.push(`**Berry Flavors**:`);
                tmp = " - ";
                Berry.flavors.forEach(e => {
                    tmp += `${e.flavor.name}, `;
                });
                data.push(tmp+"\n");

                embed.setDescription(data);
            }

            embed.setFooter('Data provided by: pokeapi.co');

            if(msg.guild) msg.channel.send(embed);
            else msg.reply(embed)

            resolve("!Pokemon Executed, No Errors");
        });
	},
};