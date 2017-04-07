/**
 * Created by LUCKY on 4/6/2017.
 */

const fs = require('graceful-fs');
const JSONStream = require('JSONStream');

const dir = "./output/";
const JSON_PATH = "output/schoolList.json";
const OUTPUT_PATH = "output/unFinished.json";

// Returns array of finished schools
function getCompletedSchool(callback) {
    var finishedSchools = [];
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
            finishedSchools.push(file);
        });
        return callback(finishedSchools);
    });
}

function getSchoolList(callback) {
    fs.createReadStream(JSON_PATH)
        .pipe(JSONStream.parse('school'))
        .on('data', function (schools) {
            return callback(schools)
        });
}

function getNewList(finishedSchool, schoolList, callback) {
    var newList = [];
    schoolList.forEach((school) => {
        if(finishedSchool.indexOf(school) === -1) {
            newList.push(school);
        }
    });
    return callback(newList);
}

function writeFile(list) {
    var obj = {
        school: list
    };
    var json = JSON.stringify(obj);
    fs.writeFile(OUTPUT_PATH, json, 'utf-8', () => {
        console.log('Write is finished');
    });
}

getCompletedSchool((finishedSchool) => {

    getSchoolList((schoolList) => {
        getNewList(finishedSchool, schoolList, (newList) => {
            // Analysis
            // console.log("Length of newList: " + newList.length);
            // console.log("Length of schoolList: " + schoolList.length);
            // console.log("Length of finishedSchool: " + finishedSchool.length);
            // console.log(newList);

            writeFile(newList);
        })

    })
});




