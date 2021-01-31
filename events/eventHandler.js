const config = require("config");

const {createGuild, deleteGuild, getGuilds, saveGuild} = require("../guild/guildHandler");
const {command} = require("./commands");

function onMessage(msg){
    if(msg.content.substring(0, 1) === config.get("options.prefix")){

        const arguments = msg.content.substring(1).toLowerCase().replace(/\s\s+/g, " ").split(" ");

        command(msg, arguments);
    }
};

function onGuildCreate(guild){
    createGuild(guild);
}

function onGuildDelete(guild){
    
    const guildData = getGuilds().get(guild.id);

    if(guildData){

        /*guildData.rotationChannelData.forEach(async (e) => {
            const channel = guild.channels.resolve(e.channelId);

            const rotationMessage = await channel.messages.fetch(e.rotationMessageId);
            const rotationImage = await channel.messages.fetch(e.rotationImageId);

            await rotationMessage.delete();
            await rotationImage.delete();
            
        });

        console.log("Kick");*/

        deleteGuild(guild);
    }

}

async function onMessageDelete(msg){
    const guildData = getGuilds().get(msg.channel.guild.id);
    if(guildData){

        for(var i = 0; i < guildData.rotationChannelData.length; i++){
            const rotationChannel = guildData.rotationChannelData[i];
            if(rotationChannel.channelId === msg.channel.id){
                if(rotationChannel.rotationMessageId === msg.id || rotationChannel.rotationImageId === msg.id){
                        try {
                            const rotationMessage = await msg.channel.messages.fetch(rotationChannel.rotationMessageId);
                            await rotationMessage.delete();
                        } catch (error) {
                            
                        }

                        try {
                            const rotationImage = await msg.channel.messages.fetch(rotationChannel.rotationImageId);
                            await rotationImage.delete();
                        } catch (error) {
                            
                        }

                        guildData.rotationChannelData.splice(i, 1);

                        saveGuild(guildData);
                }
            }
        }
    }
}

module.exports.onMessage = onMessage;
module.exports.onGuildCreate = onGuildCreate;
module.exports.onGuildDelete = onGuildDelete;
module.exports.onMessageDelete = onMessageDelete;