/**
 * Created by LUCKY on 3/26/2017.
 */

var csv = require('csv');
var fs = require('graceful-fs');

var JSON_PATH = 'output/schoolList.json'; //output/schoolList.json
var fileInfo = [{
    path: 'resources/achieve schools- final.csv',
    selector: 'el_school'}, {
    path: 'resources/pubschls.csv',
    selector: 'School'}];

const REG = /[\w^)]$/;

//TODO: Extract 2 files and do union



function adjustStr(str, callback)
{
    if(!str || REG.test(str)) // Check for empty input
        return callback(str);
    else
    {
        // console.log('Not match');
        adjustStr(str.substring(0, str.length - 1), callback);
    }
}


function readCSV(obj, callback) {
    var readStream = fs.createReadStream(obj.path);
    //TODO: Change column name

    parser = csv.parse({columns: true}, extractSchool);
    readStream.pipe(parser);

    function extractSchool(err, data) {
        if (err)
            console.log("Error: " + err);
        else {
            var jsonSchool = [];

            data.forEach(function (row) {
                // if (row.el_school)
                //   jsonSchool.push(row.el_school);
                adjustStr(row[obj.selector], populateJSON);
            });
            callback(jsonSchool);
            // console.log(set);
            // console.log(jsonSchool);

            //TODO: Print to json file
            // fs.writeFile(JSON_PATH, jsonSchool, logWrite);


            function populateJSON(str) {
                if (str)
                    jsonSchool.push(str);
            }

        }
    }
}


if (require.main === module) {
    var list = [];
    var itemProcessed = 0;

    fileInfo.forEach(function (obj) {
        readCSV(obj, function (set) {
            list.push(set);
            // console.log(list.length);
            ++itemProcessed;
            if (itemProcessed == fileInfo.length)
            {
                // console.log(list);
                findCommon(list, writeFile);
            }

        });


    });

    function findCommon(list, callback) {
        // Merge array and de-duplicate
        // TODO: Re-implement this to learn more
        Object.defineProperty(Array.prototype, 'unique', {
            enumerable: false,
            configurable: false,
            value: function () {
                var a = this.concat();
                for (var i = 0; i < a.length; ++i) {
                    for (var j = i + 1; j < a.length; ++j) {
                        if (a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }
                return a;
            }
        });

        var uniqueList = list[0].concat(list[1]).unique();
        console.log(uniqueList);
        return callback(uniqueList);
    }

    function writeFile(list) {
        var obj = {
            school: list
        };
        var json = JSON.stringify(obj);
        fs.writeFile(JSON_PATH, json, 'utf-8', logWrite);
    }

    function logWrite(err) {
        if (err)
            console.log("Error: " + err);
        else
            console.log("schoolList write is done!");
    }
}
