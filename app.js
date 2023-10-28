var http = require('http');
let Pokedex = require('pokedex-promise-v2');

let pokedex = new Pokedex();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var server = http.createServer((req, res) => {   // 2 - creating server
    if (req.url.includes('/')) {
        let typeString = req.url.substr(1);
        pokedex.getTypeByName(typeString).then(async (typeResponse) => {
            let isValidPokemon = false;
            let orgName = null;
            let isGenderless = false;
            while (!isValidPokemon) {
                const randomPokemonIndex = getRandomInt(typeResponse.pokemon.length);
                orgName = typeResponse.pokemon[randomPokemonIndex].pokemon.name;
                console.log("orgName", orgName);
                try {
                    const speciesData = await pokedex.getPokemonSpeciesByName(orgName);
                    isValidPokemon = !speciesData.is_legendary && !speciesData.is_mythical;
                    isGenderless = speciesData.gender_rate == -1;
                    console.log("GENDER RATE", speciesData.gender_rate);
                } catch (err) { }
            }
            console.log(orgName);
            pokedex.getPokemonByName(orgName).then((pokemonResponse) => {
                //console.log(pokemonResponse);
                const name = pokemonResponse.name;
                const moves = pokemonResponse.moves;
                const abilities = pokemonResponse.abilities;
                const imageUrl = pokemonResponse.sprites.front_default;

                let gender = getRandomInt(100) > 50 ? "MALE" : "FEMALE";
                if (isGenderless) gender = "GENDERLESS";
                // GENERATE RANDOM MOVES HERE
                let validMoveList = [];
                moves.forEach(moveInfo => {
                    let versionGroupDetails = moveInfo.version_group_details.pop();
                    if (versionGroupDetails && versionGroupDetails.move_learn_method.name === 'level-up') {
                        validMoveList.push(moveInfo.move);
                    }
                });
                let selectedMoveIndices = [];
                let moveListString = [];
                for (let i = 0; i < Math.min(4, validMoveList.length); i++) {
                    let randomIndex = getRandomInt(validMoveList.length);
                    while (selectedMoveIndices.includes(randomIndex)) {
                        randomIndex = (randomIndex == validMoveList.length - 1) ? 0 : (randomIndex + 1);
                    }
                    selectedMoveIndices.push(randomIndex);

                    moveListString.push(validMoveList[randomIndex].name.replace(/-/g, ' ').toUpperCase());
                }

                // GENERATE RANDOM ABILITY HERE
                const selectedAbility = abilities[getRandomInt(abilities.length)].ability.name.replace(/-/g, ' ').toUpperCase();

                // SEND RESPONSE HERE
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(`<html><body>
[nospaces]<br />
[div align="center"]<br />
[div][attr="class","wildtemp"]<br />
[div][attr="class","wildbgsaf"][/div]<br />
[div][attr="class","wildtitle"]A WILD ${name.toUpperCase()} APPEARED![/div] 
[div][attr="class","wildshiny"][img src="https://i.imgur.com/Ht4F0n8.png" style="max-width:100%;opacity:0;"][/div] <br />
[div][attr="class","wildpkmnbox"]<br />
[div][attr="class","wildpkmn"]<br />

[img style="max-width:100%;" src="${imageUrl}" alt=" "] <br />

[/div][/div]<br />

[div][attr="class","wildtab"][table][tbody]<br />
[tr]
    [td][div][attr="class","wildtabox"] [font color="75a8e6"]${gender}[/font] [/div][/td]
    [td][div][attr="class","wildtabox2"] [font color="75a8e6"]${selectedAbility}[/font] [/div][/td] 
[/tr]
[tr]
    [td][div][attr="class","wildtabox"]${moveListString[0]}[/div][/td]
    [td][div][attr="class","wildtabox2"]${moveListString[1]}[/div][/td]
[/tr]
[tr]
    [td][div][attr="class","wildtabox"]${moveListString[2]}[/div][/td]
    [td][div][attr="class","wildtabox2"]${moveListString[3]}[/div][/td]
[/tr]
[tr]
    [td][div][attr="class","wildtabox"] --- [/div][/td] 
    [td][div][attr="class","wildtabox2"] --- [/div][/td]
[/tr]
[/tbody][/table]<br />

[div][attr="class","wildtag"]@tag[/div] <br />

[div][attr="class","wildnote"] WHAT WILL YOU DO? [/div]<br />

[/div][/div][/div][break][break]<br />

</body>
</html>`);
                res.end();
            });
        }).catch(error => {
            //console.log(error);
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.write('<html><body>Invalid Request</body></html>');
            res.end();
        });
    }
});

server.listen(process.env.PORT || 5000); //3 - listen for any incoming requests

console.log('Node.js web server at port 5000 is running..');
