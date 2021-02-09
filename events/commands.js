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
            try {
                getVersion(msg);
            } catch (error) {
                console.log("Failed to serve version command: "+err);
            }
        }else 

        if(arguments[1] === "help"){
            try {
                getHelp(msg);
            } catch (err) {
                console.log("Failed to serve help command: "+err);
            }
        }else 

        if(arguments[1] === "setup"){
            try {
                setupRotations(arguments, msg);
            } catch (error) {
                console.log("Failed to serve setup command: "+err);
            }
        }else

        if(arguments[1] === "delete"){
            try {
                deleteRotations(arguments, msg);
            } catch (error) {
                console.log("Failed to serve delete command: "+err);
            }
        }
        
        else{
            msg.channel.send(`Invalid command. For help please type **${config.get("options.prefix")}awr help**`);
        }
    }
}

function getVersion(msg){
    msg.channel.send(`**Software Version:** ${process.env.npm_package_version}\n**Developed By:** TeyKey1\n**Github:** https://github.com/TeyKey1/AWrotationDiscordBot`);
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
    } catch (err) {
        console.log("Failed to setup rotations: "+err);

        if(err.code === Discord.Constants.APIErrors.MISSING_ACCESS || err.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS){
            try {
                await msg.channel.send("Bot does not have sufficient permissions to access this channel!");
            } catch (err) {
                
            }
        }else{
            try {
                await msg.channel.send("Failed to setup rotations.");
            } catch (err) {
                
            }
        }
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