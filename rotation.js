const fs = require("fs");
const  {DateTime, Duration} = require("luxon");
const {createCanvas, loadImage} = require("canvas");


var updatedAt = DateTime.local({year: 2000, day: 1, month: 1});
var rotations = [[], [], [], [], [], []];

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

async function generateImage(){
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

    var time;
    var position;
    if(DateTime.local().minute >= 30){
        position = Math.round((DateTime.local().minute - 30) / 9 * 3);
        time = DateTime.fromObject({hour: DateTime.local().hour, minutes: 30});
    }else{
        position = Math.round((DateTime.local().minute) / 9 * 3);
        time = DateTime.fromObject({hour: DateTime.local().hour, minutes: 0});
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


    const buffer = canvas.toBuffer('image/png');
    fs.writeFile('./data/image.png', buffer, (err)=>{
        if(err){
            throw new Error("Failed to save rotation image" + err);
        }
    });

}

module.exports.setRotationDate = setRotationDate;
module.exports.getRotationDate = getRotationDate;
module.exports.setRotations = setRotations;
module.exports.getRotations = getRotations;
module.exports.generateImage = generateImage;