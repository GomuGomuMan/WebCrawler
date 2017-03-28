/**
 * Created by LUCKY on 3/26/2017.
 */
//TODO: Finish crawler's skeleton
var Horseman = require('node-horseman');
var fs = require('graceful-fs');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
const URL = 'http://data1.cde.ca.gov/dataquest/page2.asp?level=School&subject=LC&submit1=Submit';
const SELECTOR_SCHOOL = 'input[name="cName"]';
const SELECTOR_FEP = 'input[value="Redesig4"]';
const SELECTOR_SUBMIT = '#submit1';

var yearRange = generateYearRange();


function configHorseman(Horseman) {
    var horseman = new Horseman({
        loadImages: false,
        timeout: 10000
    });

    return horseman;
    // fsmHorseman(horseman);
}

function fsmHorseman(horseman, callback) { // Finite State Machine Horseman
    var url = '';
    horseman
        .userAgent(USER_AGENT)
        .open(URL)
        .status()
        .then(checkStatus)
        //1st page
        .exists(SELECTOR_SCHOOL)
        .then(checkSelectorExist)
        .type(SELECTOR_SCHOOL, 'Franklin Elementary') // input school //TODO: limit to 25 char and text from json
        .keyboardEvent('keypress', 16777221) // type enter
        .waitForNextPage() // wait for loading
        .status()
        .then(checkStatus)
        //2nd page
        // Check FEP
        .exists(SELECTOR_FEP)
        .then(checkSelectorExist)
        .click(SELECTOR_FEP)
        // Click submit btn
        .exists(SELECTOR_SUBMIT)
        .then(checkSelectorExist)
        .click(SELECTOR_SUBMIT)
        .waitForNextPage()
        .status()
        .then(checkStatus)
        //result page
        .screenshot('test.png') // Success!!
        .html()
        .then(function (html) {
            horseman
                .url()
                .then(function (url) {
                    callback(html, url);
                })
                .close();
                // .close();

                // .then(function (url) {
                //     console.log(url);
                // });
            // callback(html, url);
            // callback(html);
        });




    //TODO: Serialize failed search
    return 0;
}

function checkStatus(status) {
    if (status !== 200)
    {
        console.log("1st page does not load!");
        horseman.close(); // TODO:Check
        return 1;
    }
    return 0;
}

function checkSelectorExist(isSelectorExist) {
    if(!isSelectorExist) {
        horseman.close(); //TODO:Check
        console.log('Selector does not exist!');
        return 1;
    }
    return 0;
}

function serializeHtml(html, url) {
    //TODO: Serialize html pages
    // Create customized file name NAME_RANGE (NAME=test for now)
    var yearRange = url.substring(url.length - 7);
    var customFileName = 'output/' + 'test' + '_' + yearRange + '.html';

    // Use writeStream to write big file to disk
    var writeStream = fs.createWriteStream(customFileName);
    // writeStream
    //     .on('open', function () {
    //         console.log('---Writing HTML---');
    //         writeStream.write(html);
    //     })
    //     .on('end', function() {
    //         console.log('Finished writing HTML');
    //     });// Not printing
    writeStream.write(html);
    writeStream.end();

    //TODO: Open file and check if it exists already or not.
    // wx: write + execute
    // fs.open(HTML_PATH, 'wx', function (err, fd) {
    //     if(err) {
    //       if (err.code === 'EEXIST') {
    //           console.error('File already exists');
    //       }
    //       else
    //           throw err;
    //     }

    // })
}

/*
* Generate appropriate year range
* */
function generateYearRange() {
    var yearRange = [];
    for (var i = 2000; i <= 2014; ++i) {
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

// Generate url over yearRange
function generateURL(yearRange, url) {
    var urlTemplate = url.substring(0, url.length - 7);
    yearRange.forEach(function (year) {
        var urlGen = urlTemplate + year;
        //TODO:Crawl each of these
        crawlYearRange(urlGen);
        // return;
    });
    // console.log(yearRange);

}

function crawlYearRange(url) {
    var horseman = configHorseman(Horseman);
    //TODO: Create delay to prevent server overload
    horseman
        .userAgent(USER_AGENT)
        .open(url)
        .wait(5000)
        .status()
        // .then(function (status) {
        //     console.log('url: ' + url);
        //     console.log('status:' + status);
        // })
        .then(checkStatus)
        // .screenshot('test.png')
        .html()
        .then(function (html) {
            serializeHtml(html, url);
        })
        .close();
    return;
}

function assignTask(html, url) {
    // console.log(html);
    // console.log(url);
    serializeHtml(html, url);

    //TODO: Serialize crawl url
    generateURL(yearRange, url);
}

if (require.main === module) {

    var horseman = configHorseman(Horseman);
    // fsmHorseman(horseman, serializeHtml);
    fsmHorseman(horseman, assignTask);
}

