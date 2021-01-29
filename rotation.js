const fs = require("fs");
const  {DateTime, Duration} = require("luxon");
const {createCanvas, loadImage} = require("canvas");
const schedule = require("node-schedule");
const Discord = require("discord.js");
const config = require("config");
const {v1: uuidV1} = require("uuid");

const {getGuilds} = require("./guild/guildHandler");



var updatedAt = DateTime.local({year: 2000, day: 1, month: 1});
var rotations = [[], [], [], [], [], []];
var offset = {minutes: -1, seconds: -32};
var urlID = "";
var prevUrlID = ""; 

function setRotationDate(date){
    updatedAt = date;
}

function getRotationDate(){
    return updatedAt;
}

function setRotations(rotationArray){
    rotations = rotationArray;
    generateImage();
}

function getRotations(){
    return rotations;
}

function setOffset(minutes, seconds){
    offset = {minutes: minutes, seconds: seconds};
}

async function generateImage(){

    //generate unique ID for url
    prevUrlID = urlID;
    urlID = uuidV1();

    const width = 1200;
    const height = 524;

    const yOffset = 76;
    const yGap = 41;
    
    const xOffset = 8;
    const xTimeGap = 92;
    const xGap = 182;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const baseImage = await loadImage("./assets/aw_rotations_baseimage.png");
    const activeBracket = await loadImage("./assets/aw_rotations_activebracket.png");

    context.drawImage(baseImage, 0, 0);

    //Draw Rotation Time and Active Bracket
    context.font = "regular 20pt Calibri";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#000000";

    //Calculate time of AW server timer based on offset
    var serverTime = DateTime.local().plus(Duration.fromObject(offset));

    //Calculate current bracket position & timetable
    var time;
    var position;
    if(serverTime.minute >= (30 + offset.minutes)){
        position = Math.round((serverTime.minute - (30 + offset.minutes)) / 9 * 3);
        time = DateTime.fromObject({hour: serverTime.hour, minutes: DateTime.fromObject({minutes: 30}).plus(Duration.fromObject({minutes: offset.minutes})).minute});
    }else{
        position = Math.round((serverTime.minute + offset.minutes) / 9 * 3);
        time = DateTime.fromObject({hour: serverTime.hour, minutes: DateTime.fromObject({minutes: 0}).plus(Duration.fromObject({minutes: offset.minutes})).minute});
    }


    //Active Bracket
    context.drawImage(activeBracket, xOffset, yOffset + (position * yGap));
    context.fillText("Active", xOffset + (xTimeGap / 2), yOffset + 21 + (position * yGap));

    const end = position + 10;
    position++;

    //Times
    for(position; position < end; position++){

        context.fillText(time.plus({minutes: 3 * position}).toLocaleString(DateTime.TIME_24_SIMPLE), xOffset + (xTimeGap / 2), yOffset + 21 + ((position%10) * yGap));

    }

    //Draw Missions
    context.font = "regular 17pt Calibri";
    context.textAlign = "start";

    for(var i = 0; i < 6; i++){
        for(var k = 0; k < 10; k++){
            context.fillText(rotations[i][k], xOffset + xTimeGap + 5 + (xGap * i), yOffset + 21 + (yGap * k));
        }
    }

    //Draw Date
    context.font = "regular 11pt Calibri";
    context.fillStyle = "#fff";
    context.fillText(getRotationDate().toLocaleString(DateTime.DATETIME_SHORT), 1050, 500);

    //Draw Timezone
    context.fillText(DateTime.local().toFormat("ZZZZ"), 892, 500);


    const buffer = canvas.toBuffer('image/png');
    fs.writeFile(`./data/rotations${urlID}.png`, buffer, (err)=>{
        if(err){
            throw new Error("Failed to save rotation image" + err);
        }
    });

}

function scheduleUpdateTasks(bot){
    const ruleImage = new schedule.RecurrenceRule();
    ruleImage.minute = new schedule.Range(0, 59, 3);

    //update rotation images
    schedule.scheduleJob("update rotation images", ruleImage, async ()=>{

        await generateImage();

        getGuilds().forEach((value, key) => {
            try {
                value.rotationChannelData.forEach(async (e) =>{

                    const guild = await bot.guilds.fetch(value.guildId);
                    const channel = guild.channels.resolve(e.channelId);

                    const rotationImage = await channel.messages.fetch(e.rotationImageId);

                    //update
                    rotationImage.edit(`${config.get("server.baseUrl")}:${config.get("server.port")}/data/rotations${urlID}.png`);

                });                
            } catch (err) {
                
            }
        });

        //Delete old image
        fs.unlink(`./data/rotations${prevUrlID}.png`, (err)=>{

        });


    });

    const ruleMessage = new schedule.RecurrenceRule();
    ruleMessage.second = new schedule.Range(0, 59, 10);

    schedule.scheduleJob("update rotation messages", ruleMessage, async ()=>{

        var nextChangeMinute = Math.floor(DateTime.local().minute / 3) * 3 + 3;
        var hour = DateTime.local().hour;

        if(nextChangeMinute >= 60){
            nextChangeMinute-=60;
            //better fix with plus function!!!!
            hour++;
        }

        const nextChangeTime = DateTime.fromObject({hour: hour, minute: nextChangeMinute, seconds: 0});

        const difference = nextChangeTime.diffNow();

        getGuilds().forEach((value, key) => {
            try {
                value.rotationChannelData.forEach(async (e) =>{

                    const guild = await bot.guilds.fetch(value.guildId);
                    const channel = guild.channels.resolve(e.channelId);

                    const rotationMessage = await channel.messages.fetch(e.rotationMessageId);
                    //update
                    const embed = new Discord.MessageEmbed()
                    .setColor("#FCA311")
                    .setTitle("PVE Rotations")
                    .setDescription(`Next maps in: ${difference.toFormat("mm:ss")} min \n\nAW rotations by ${config.get("options.rotationSourceUrl")}`);

                    rotationMessage.edit("", embed);

                });                
            } catch (err) {
                
            }
        });


    });
}

module.exports.setRotationDate = setRotationDate;
module.exports.getRotationDate = getRotationDate;
module.exports.setRotations = setRotations;
module.exports.getRotations = getRotations;
module.exports.setOffset = setOffset;
module.exports.generateImage = generateImage;
module.exports.scheduleUpdateTasks = scheduleUpdateTasks;