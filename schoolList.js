/**
 * Created by LUCKY on 3/26/2017.
 */

var csv = require('csv');
var fs = require('graceful-fs');

const CSV_PATH = 'resources/pubschls.csv';
const JSON_PATH = 'output/schoolList.json';



function extractSchool(err, data) {
    if (err)
      console.log("Error: " + err);
    else {
      var jsonSchool = [];

      data.forEach(function (row) {
          //console.log("School: " + row.School);
          if (row.School)
            jsonSchool.push(row.School);
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
    }
}



function readCSV() {
    var readStream = fs.createReadStream(CSV_PATH);
    parser = csv.parse({columns: true}, extractSchool);
    readStream.pipe(parser);
}



if (require.main === module) {
    readCSV();
}