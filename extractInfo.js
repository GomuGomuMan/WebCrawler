const cheerio = require('cheerio');
const fs = require('graceful-fs');
const csv = require('csv');

const OUTPUT_PATH = 'test.csv'
const columns = {
  year: 'year',
  school: 'School',
  csdCode: 'CSDCode'
}

// Load html
var html = "";
fs.createReadStream('output/A. L. Conner Elementary/2015-16.html')
  .on('data', (chunk) => {
    html += chunk;
  })
  .on('end', () => {
    var $ = cheerio.load(html, {
      normalizeWhitespace: true
    });

    getData($, (schoolInfo) => {
      console.log(schoolInfo);
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
          fs.appendFile(OUTPUT_PATH, data, (err) => {
            if (err)
              console.log(`Error: ${err}`);
            console.log(data);
            console.log("Finished appending.");
          })
        });
      stringifier.write(schoolInfo);
      stringifier.end();

    })

    // console.log($('tr'));
  });
  // #div750 > li:nth-child(11) > table > tbody > tr:nth-child(2) > td:nth-child(2)

// const $ = cheerio.load('')

//TODO: Check if file exists
// if exists => create dir
// if not => append

isExists = (callback) => {
  // 'output/A. L. Conner Elementary/2015-16.html'
  // 'output/3 R Community Day/2015-16.html'
  fs.access('output/A. L. Conner Elementary/2015-16.html', (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`File does not exist`);
        return callback(false);
      }
    }
    else {
      console.log(`2015-16 html file exists`);
      return callback(true);
    }
  });
}

isExists((result) => {
  console.log(result);
});

getData = ($, callback) => {
  var schoolInfo = [];
  [1, 2, 3, 4, 5, 6].forEach((iter) => {
    var val = $('tr:nth-child(2) > td:nth-child(' + iter + ')').text();
    schoolInfo.push(val);
  })
  return callback(schoolInfo);
}
