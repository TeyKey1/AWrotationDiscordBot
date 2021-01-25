const fs = require("fs");
const config = require("config");
const fetch = require("node-fetch");
const ini = require("js-ini");
const streamToString = require("stream-to-string");
const  {DateTime} = require("luxon");

const {setRotationDate, getRotationDate, setRotations} = require("../rotation");

const rotationFilePath = "./data/rotation.ini";
const brackets = Object.keys(config.get("options.rotationFile"));

async function downloadRotation(){
    const res = await fetch(config.get("options.rotationURL"), {
        method: 'GET',
        headers: {"Content-Type": "text/html; charset=utf-8"},
        body: null
    });

    const string = await streamToString(res.body);

    const rotationsDateLine = string.split("\n")[0];
    const rotationsDate = rotationsDateLine.substring(1).replace("\r", "");

    const date = DateTime.fromFormat(rotationsDate, "yyyy-MM-dd hh:mm");

    //Data up to date
    if(getRotationDate().equals(date)){
        return;
    }

    setRotationDate(date);

    //Save rotation to file
    fs.writeFile(rotationFilePath, string.replace(rotationsDateLine, ""), (err)=>{
        if(err){
            throw new Error("Failed to save rotation file: " + err);
        }

        updateRotation();  
    }); 
}

function updateRotation(){
    fs.readFile(rotationFilePath, "utf-8", (err, data)=>{
        if(err){
            throw new Error("Failed to read rotation file: " + err);
        }

        const rotation = ini.parse(data);
      
        var rotations = [[], [], [], [], [], []];

        for(var k = 0; k < 6; k++){
            for(var i = 1 ; i < 11 ; i++){
                rotations[k].push(rotation[config.get("options.rotationFile."+brackets[k])][i]);
            }
        }

        setRotations(rotations);

    });
}

module.exports.downloadRotation = downloadRotation;