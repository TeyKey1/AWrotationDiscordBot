
const guilds = [];

function createGuild(guild){
    guilds.push({
        name: guild.name,
        guildId: guild.id,
        rotationChannelData: []
    });

}

function deleteGuild(guild){
    const index = guilds.findIndex((e)=>{e.guildId === guild.id});

    if(index == -1){
        return;
    }

    guilds.splice(index, 1);
}

module.exports.createGuild = createGuild;
module.exports.deleteGuild = deleteGuild;
