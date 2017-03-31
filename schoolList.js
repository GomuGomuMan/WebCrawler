/**
 * Created by LUCKY on 3/26/2017.
 */

var csv = require('csv');
var fs = require('graceful-fs');

const CSV_PATH = 'resources/achieve schools- final.csv'; //resources/pubschls.csv
const JSON_PATH = 'output/schoolList1.json'; //output/schoolList.json
var school_col = 'el_school'; //School
const REG = /[\w^)]$/;

function extractSchool(err, data) {
    if (err)
      console.log("Error: " + err);
    else {
      var jsonSchool = [];

      data.forEach(function (row) {
          // if (row.el_school)
          //   jsonSchool.push(row.el_school);
          adjustStr(row[school_col], populateJSON);
      });
      console.log(jsonSchool);

      //TODO: Print to json file
      fs.writeFile(JSON_PATH, jsonSchool, logWrite);

        function logWrite(err) {
            if (err)
                console.log("Error: " + err);
            else
                console.log("schoolList write is done!");
        }

        function populateJSON(str) {
            jsonSchool.push(str);
        }

    }
}

function adjustStr(str, callback)
{
    if(!str || REG.test(str)) // Check for empty input
    {
        return callback(str);
    }
    else
    {
        // console.log('Not match');
        adjustStr(str.substring(0, str.length - 1), callback);
    }
}


function readCSV() {
    var readStream = fs.createReadStream(CSV_PATH);
    parser = csv.parse({columns: true}, extractSchool);
    readStream.pipe(parser);
}



if (require.main === module) {
    readCSV();
    // readDatadump();
    // var test = adjustStr('Cleminson Elementary', function (str) {
    //     console.log(str);
    // });
}
