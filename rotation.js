const fs = require("fs");
const { DateTime, Duration } = require("luxon");
const { createCanvas, loadImage, registerFont } = require("canvas");
const Discord = require("discord.js");
const config = require("config");
const { v1: uuidV1 } = require("uuid");
const {logger} = require("./utility/logger");



var updatedAt = DateTime.local({ year: 2000, day: 1, month: 1 });
var rotations = [[], [], [], [], [], []];
var offset = Duration.fromObject({minutes: 0, seconds: 0});
var urlID = "";
var prevUrlID = "";

registerFont("./assets/ntailu.ttf", { family: "Microsoft New Tai Lue" });


function setRotationDate(date) {
    updatedAt = date;
}

function getRotationDate() {
    return updatedAt;
}

function setRotations(rotationArray) {
    rotations = rotationArray;
    generateImage();
}

function getRotations() {
    return rotations;
}

function setOffset(minutes, seconds) {
    offset = Duration.fromObject({minutes: minutes, seconds: seconds}).shiftTo("minutes", "seconds");
}

function getOffset(){
    return offset;
}

function getUrlId(){
    return {urlID: urlID, prevUrlID: prevUrlID}
}

async function generateImage() {

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
    context.font = "regular 20pt Microsoft New Tai Lue";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#000000";

    var currentTime = DateTime.local();

    //Calculate current bracket position & timetable
    var tableStartTime;
    var position;
    if (currentTime >= currentTime.set({minute: 30, second: 0}).plus(offset)) {

        position = Math.round(currentTime.minus(offset.plus({minutes: 30})).minute / 9 * 3) % 10;
        tableStartTime = currentTime.set({minute: 30, second: 0}).plus(offset);

    } else {

        position = Math.round(currentTime.minus(offset).minute / 9 * 3) % 10;
        tableStartTime = currentTime.set({minute: 0, second: 0}).plus(offset);

    }

    //Debug
    logger.debug(`Offset: ${offset.minutes}min ${offset.seconds}sec`);
    logger.debug(`Timetable start: ${tableStartTime.minute}`);

    logger.debug(DateTime.local().toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS));

    logger.debug(`Position ${position}`);
    

    //Active Bracket
    context.drawImage(activeBracket, xOffset, yOffset + (position * yGap));
    context.fillText("Active", xOffset + (xTimeGap / 2), yOffset + 21 + (position * yGap));

    const end = position + 10;
    position++;

    //Times
    for (position; position < end; position++) {

        context.fillText(tableStartTime.plus({ minutes: 3 * position }).toLocaleString(DateTime.TIME_24_SIMPLE), xOffset + (xTimeGap / 2), yOffset + 21 + ((position % 10) * yGap));

    }


    //Draw Missions
    context.font = "regular 17.5pt Microsoft New Tai Lue";
    context.textAlign = "start";

    for (var i = 0; i < 6; i++) {
        for (var k = 0; k < 10; k++) {
            if(rotations[i][k]===""){
                context.fillText("Updating...", xOffset + xTimeGap + 5 + (xGap * i), yOffset + 21 + (yGap * k));
            }else{
                context.fillText(rotations[i][k], xOffset + xTimeGap + 5 + (xGap * i), yOffset + 21 + (yGap * k));
            }
        }
    }

    //Draw Date
    context.font = "regular 11pt Microsoft New Tai Lue";
    context.fillStyle = "#fff";
    context.fillText(getRotationDate().toFormat("d/M/y HH:ss"), 1050, 501);

    //Draw Timezone
    context.fillText(DateTime.local().toFormat("ZZZZ"), 892, 502);


    const buffer = canvas.toBuffer('image/png');
    fs.writeFile(`./data/public/rotations${urlID}.png`, buffer, (err) => {
        if (err) {
            throw new Error("Failed to save rotation image" + err);
        }
    });

}

async function createRotationMessages(rotationChannel){
    const messageEmbed = new Discord.MessageEmbed()
        .setColor("#FCA311")
        .setTitle("PVE Rotations")
        .setDescription(`Next maps in: 00:00 min \n\nAW rotations by ${config.get("options.rotationSourceUrl")}`);

    const rotationMessage = await rotationChannel.send("", messageEmbed);
    const rotationImage = await rotationChannel.send(`${config.get("server.baseUrl")}:${config.get("server.port")}/data/rotations${urlID}.png`);

    return({rotationMessage: rotationMessage, rotationImage: rotationImage});
}

module.exports.setRotationDate = setRotationDate;
module.exports.getRotationDate = getRotationDate;
module.exports.setRotations = setRotations;
module.exports.getRotations = getRotations;
module.exports.setOffset = setOffset;
module.exports.getOffset = getOffset;
module.exports.getUrlId = getUrlId;
module.exports.generateImage = generateImage;
module.exports.createRotationMessages = createRotationMessages;