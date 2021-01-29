const Discord = require("discord.js");

const {saveData, readDataSync} = require("../utility/dataHandler");

var guilds = new Map();

function createGuild(guild){

    const existing = exists(guild);

    if(existing){
        //Flush rotationChannelData

        saveData(guilds);
        return existing;
    }

    const guildData = {
        name: guild.name,
        guildId: guild.id,
        rotationChannelData: []
    };

    guilds.set(guild.id, guildData);
    console.log(guilds);

    saveData(guilds);

    return guildData;
}

function deleteGuild(guild){
    guilds.delete(guild.id);

    saveData(guilds);
}

function loadGuilds(){
    guilds = readDataSync();
}

function getGuilds(){
    return guilds;
}

async function addRotationChannel(guild, rotationChannel){
    var guildData = exists(guild);

    if(!guildData){
        guildData = createGuild(guild);
    }

    //check if channel already has rotation


    const embed = new Discord.MessageEmbed()
        .setColor("#FCA311")
        .setTitle("PVE Rotations")
        .setDescription("The Description");

    const rotationMessage = await rotationChannel.send("", embed);
    const rotationImage = await rotationChannel.send("http://teygaming.com:1212/data/rotations.png");

    guildData.rotationChannelData.push({
        channelId: rotationChannel.id,
        rotationMessageId: rotationMessage.id,
        rotationImageId: rotationImage.id
    });
    
    guilds.set(guildData.guildId, guildData); 
    saveData(guilds);
}

/*
* Check if Guild exists in Database. Returns the guild data if it exists
*/
function exists(guild){
    var guildData = undefined;

    if(guilds.has(guild.id)){
        guildData = guilds.get(guild.id);
    }

    return guildData;
}

module.exports.createGuild = createGuild;
module.exports.deleteGuild = deleteGuild;
module.exports.loadGuilds = loadGuilds;
module.exports.getGuilds = getGuilds;
module.exports.addRotationChannel = addRotationChannel;
