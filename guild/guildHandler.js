const Discord = require("discord.js");

const {saveData, readDataSync} = require("../utility/dataHandler");

var guilds = [];

function createGuild(guild){
    guilds.push({
        name: guild.name,
        guildId: guild.id,
        rotationChannelData: []
    });

    saveData(guilds);
}

function deleteGuild(guild){

    for(var i = 0; i < guilds.length; i++){
        if(guilds[i].guildId === guild.id){
            guilds.splice(i, 1);
            break;
        }
    }

    saveData(guilds);
}

function loadGuilds(){
    guilds = readDataSync();
}

function getGuilds(){
    return guilds;
}

async function addRotationChannel(guild, rotationChannel){
    if(!exists(guild)){
        createGuild(guild);
    }

    const embed = new Discord.MessageEmbed()
        .setColor("#FCA311")
        .setTitle("Current rotations")
        .setDescription("The Description");

    const rotationMessage = await rotationChannel.send(":regional_indicator_p: :regional_indicator_v: :regional_indicator_e:   :regional_indicator_r: :regional_indicator_o: :regional_indicator_t: :regional_indicator_a: :regional_indicator_t: :regional_indicator_i: :regional_indicator_o: :regional_indicator_n:", embed);
    const rotationImage = await rotationChannel.send("https://i.imgur.com/pRHE8M5.png");
    


    /*for(var i = 0; i < guilds.length; i++){
        if(guilds[i].guildId === guild.id){
            guilds[i].rotationChannelData.push({});
        }
    }

    saveData(guilds);*/
}

/*
* Check if Guild exists in Database
*/
function exists(guild){
    var exists = false;

    for(var i = 0; i < guilds.length; i++){
        if(guilds[i].guildId === guild.id){
            exists = true;
            break;
        }
    }

    return exists;
}

module.exports.createGuild = createGuild;
module.exports.deleteGuild = deleteGuild;
module.exports.loadGuilds = loadGuilds;
module.exports.getGuilds = getGuilds;
module.exports.addRotationChannel = addRotationChannel;
