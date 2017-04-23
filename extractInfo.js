const cheerio = require('cheerio');
const fs = require('graceful-fs');
const csv = require('csv');
const async = require('async');

const OUTPUT_PATH = './analysis/test.csv'
const NUM_OPERATION = 100;

const columns = ['year', 'School', 'CDS Code', 'Enrollment', 'English Learners',
  'Fluent-English Proficient Students', 'Students Redesginated FEP'];
const dir = "./output/"; //output

var rowList = [];

  // #div750 > li:nth-child(11) > table > tbody > tr:nth-child(2) > td:nth-child(2)
// *[@id="div750"]/li[2]/table/tbody/tr[2]/td[1]

/*
* Returns school path list
*/
getCompletedSchools = (callback) => {
    var finishedSchools = [];
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
            // finishedSchools.push(dir + file + '/');
            finishedSchools.push(file);
        });
        return callback(finishedSchools);
    });
}

/*
* Check if file exists
* return true if exists
* return false if doesn't
*/
isExists = (path, callback) => {
  // 'output/A. L. Conner Elementary/2015-16.html'
  // 'output/3 R Community Day/2015-16.html'
  fs.access(path, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`${path} does not exist`);
        return callback(false);
      }
    }
    else {
      console.log(`${path} exists`);
      return callback(true);
    }
  });
}

getData = ($, year, school, callback) => {
  var schoolInfo = [year, school];
  [2, 3, 4, 5, 6].forEach((iter) => {
    var val = $('li > table > tbody > tr:nth-child(2) > td:nth-child('
      + iter + ')').text();
    if (val)
      schoolInfo.push(val);
  })
  return callback(schoolInfo);
}

/*
* Process path list:
* Check 2015-26 first.
* If exists => Check every other year
*/
processList = (schoolList) => {
  // async
  // pathList.forEach(process2015_16);

  async.eachLimit(schoolList, NUM_OPERATION, process2015_16, (err) => {
    // console.log(`data: ${rowList}`)s;

    var writeStream = fs.createWriteStream('test.csv');
    writeStream.on('error', (err) => {
      console.log(err);
    });

    var firstRow = columns.join() + '\n';
    writeStream.write(firstRow);
    rowList.forEach((row) => {
      // console.log(row);
      writeStream.write(row);
    })
    writeStream.end();
  });
}


/*
* Try if 2015-16 exists
*/
process2015_16 = (school, callback) => {
  console.log(`Processing ${school}...`); // Log

  var itemsProcessed = 0;
  var arrLength = yearRange.length;
  yearRange.forEach((year) => {

    var yearPath = dir + school + '/' + year + '.html';
    // console.log(yearPath);
    isExists(yearPath, (isExist) => {
      if (isExist) {
        // Load html
        var html = "";
        fs.createReadStream(yearPath)
          .on('data', (chunk) => {
            html += chunk;
          })
          .on('end', () => {
            var $ = cheerio.load(html, {
              normalizeWhitespace: true
            });

            getData($, year, school, (schoolInfo) => {
              // console.log(schoolInfo);
              if (schoolInfo.length > 2) {
                data = '';
                var stringifier = csv.stringify({});
                stringifier
                  .on('readable', () => {
                    while(row = stringifier.read()) {
                      data += row;
                    }
                  })
                  .on('error', (err) => {
                    console.log(`Error: ${err}`);
                  })
                  .on('finish', () => {
                    // console.log(data);
                    rowList.push(data);
                  })

                stringifier.write(schoolInfo);
                stringifier.end();
              }



            });
          });
      }

      // Check for right timing to return callback
      ++itemsProcessed;
      if (itemsProcessed === arrLength)
        return callback(null);

    });
  });
}

/*
* Generate appropriate year range
* */
generateYearRange = () => {
    var yearRange = [];
    for (var i = 2000; i <= 2015; ++i) {
        var currYear = i + '-';
        var nextYear = i % 100 + 1;
        var rangeFormat = '';
        if (nextYear < 10)
            rangeFormat = currYear + '0' + nextYear;
        else
            rangeFormat = currYear + nextYear;
        yearRange.push(rangeFormat);
    }
    // console.log(yearRange);
    return yearRange;
}
var yearRange = generateYearRange();

if (require.main === module) {
  //TODO: Write headers

  // var firstRow = columns.join() + '\n';
  // // console.log(firstRow);
  // var writeStream = fs.createWriteStream('test.csv');
  // writeStream.on('error', (err) => {
  //   console.log(err);
  // });
  // writeStream.write(firstRow);
  // writeStream.end();

  getCompletedSchools(processList);
}
