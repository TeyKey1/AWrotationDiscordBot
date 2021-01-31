const config = require("config");
const Discord = require("discord.js");

const {addRotationChannel, deleteRotationChannel} = require("../guild/guildHandler");

async function command(msg, arguments){
    if(arguments[0] === "awr"){

        //check if User has permission
        if(!hasPermission(msg)){
            return;
        }

        if(arguments[1] === "version"){
            getVersion(msg);
        }else 

        if(arguments[1] === "help"){
            getHelp(msg);
        }else 

        if(arguments[1] === "setup"){
             setupRotations(arguments, msg);
        }else

        if(arguments[1] === "delete"){
            deleteRotations(arguments, msg);
        }
        
        else{
            msg.channel.send(`Invalid command. For help please type **${config.get("options.prefix")}awr help**`);
        }
    }
}

function getVersion(msg){
    msg.channel.send(`**Software Version:** ${process.env.npm_package_version}\n**Developed By:** TeyKey1\n**Github:** `);
}

function getHelp(msg){
    const prefix = config.get("options.prefix");

    const generalString = prefix + "setup channel\n```css\nCreates a new PVE rotation message in given channel.```\n"+prefix+"delete channel\n```css\nDeletes the PVE rotation message in given channel.```\n";
    const miscString = prefix + "version\n```css\nShows the version and about page of this bot```\n"+prefix+"help\n```css\nShows this help page```\n";

    const embed = new Discord.MessageEmbed()
        .setColor("#FCA311")
        .setTitle("Help")
        .setFooter("AW rotations Discord Bot by TeyKey1")
        .addField("General Commands", generalString)
        .addField("Misc Commands", miscString);
    msg.channel.send("", embed);
    
}

async function setupRotations(arguments, msg){

    if(!arguments[2]){
        await msg.channel.send("Please specify a channel.");
        return;
    }

    const channel = await msg.channel.guild.channels.resolve(arguments[2].substring(2, 20));
    const guild = msg.channel.guild;

    if(channel === null){
        await msg.channel.send("Invalid channel. Please specify a valid channel.");
        return;
    }

    try {
        await addRotationChannel(guild, channel);
        await msg.channel.send("Setup rotations successfully.");
    } catch (error) {
        await msg.channel.send("Failed to setup rotations.");
    }
    
}

async function deleteRotations(arguments, msg){

    if(!arguments[2]){
        await msg.channel.send("Please specify a channel.");
        return;
    }

    const channel = await msg.channel.guild.channels.resolve(arguments[2].substring(2, 20));
    const guild = msg.channel.guild;

    if(channel === null){
        await msg.channel.send("Invalid channel. Please specify a valid channel.");
        return;
    }

    try {

        await deleteRotationChannel(guild, channel);
        await msg.channel.send("Deleted rotations successfully.");

    } catch (error) {

        if(error.message === "ROTATION_NOT_FOUND"){
            await msg.channel.send("There is no rotation in this channel.");
        }else{
            await msg.channel.send("Failed to delete rotations.");
        }

    }
    
}

function hasPermission(msg){
    var access = false;

    const guildMember = msg.channel.guild.members.resolve(msg.author);

    if(guildMember.hasPermission(config.get("options.permission"))){
        access = true;
    }

    return access
}

module.exports.command = command;