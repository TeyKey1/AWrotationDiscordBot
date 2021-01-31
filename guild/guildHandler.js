const Discord = require("discord.js");

const {saveData, readDataSync} = require("../utility/dataHandler");
const {createRotationMessages} = require("../rotation");

var guilds = new Map();

function createGuild(guild){

    const existing = exists(guild);

    if(existing){
        //Flush rotationChannelData
        existing.rotationChannelData.splice(0, existing.rotationChannelData.length);

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

function saveGuild(guild){
    guilds.set(guild.guildId, guild);

    saveData(guilds);
}

async function addRotationChannel(guild, rotationChannel){
    var guildData = exists(guild);

    if(!guildData){
        guildData = createGuild(guild);
    }

    //check if channel already has rotation and delete it
    for(var i = 0; i < guildData.rotationChannelData.length; i++){
        if(guildData.rotationChannelData[i].channelId === rotationChannel.id){

            const rotationMessage = await rotationChannel.messages.fetch(guildData.rotationChannelData[i].rotationMessageId);
            const rotationImage = await rotationChannel.messages.fetch(guildData.rotationChannelData[i].rotationImageId);

            await rotationMessage.delete();
            await rotationImage.delete();

            guildData.rotationChannelData.splice(i, 1);
            break;
        }
    }

    const {rotationMessage, rotationImage} = await createRotationMessages(rotationChannel);

    guildData.rotationChannelData.push({
        channelId: rotationChannel.id,
        rotationMessageId: rotationMessage.id,
        rotationImageId: rotationImage.id
    });
    
    guilds.set(guildData.guildId, guildData); 
    saveData(guilds);
}

async function deleteRotationChannel(guild, rotationChannel){
    var guildData = exists(guild);

    if(!guildData){
        guildData = createGuild(guild);
    }

    var deleted = false;

    //check if channel already has rotation and delete it
    for(var i = 0; i < guildData.rotationChannelData.length; i++){
        if(guildData.rotationChannelData[i].channelId === rotationChannel.id){

            const rotationMessage = await rotationChannel.messages.fetch(guildData.rotationChannelData[i].rotationMessageId);
            const rotationImage = await rotationChannel.messages.fetch(guildData.rotationChannelData[i].rotationImageId);

            await rotationMessage.delete();
            await rotationImage.delete();

            guildData.rotationChannelData.splice(i, 1);

            deleted = true;
            break;
        }
    }
    
    if(deleted){
        guilds.set(guildData.guildId, guildData); 
        saveData(guilds);
    }else{
        throw new Error("ROTATION_NOT_FOUND");
    }

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
module.exports.saveGuild = saveGuild;
module.exports.addRotationChannel = addRotationChannel;
module.exports.deleteRotationChannel = deleteRotationChannel;
