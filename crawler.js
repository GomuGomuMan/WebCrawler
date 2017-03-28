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
const HTML_PATH = 'output/doc.html';


function configHorseman(Horseman) {
    var horseman = new Horseman({
        loadImages: false,
        timeout: 10000
    });

    return horseman;
    // fsmHorseman(horseman);
}

function fsmHorseman(horseman, callback) { // Finite State Machine Horseman
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
        .url() // Get final url
        .html()
        .then(function (html) {
            callback(html);
        })
        // .log()
        .close();

    //TODO: Serialize crawl url


    //TODO: Serialize failed search
    return 0;
}

function checkStatus(status) {
    if (status !== 200)
    {
        console.log("1st page does not load!");
        horseman.close();
        return 1;
    }
    return 0;
}

function checkSelectorExist(isSelectorExist) {
    if(!isSelectorExist) {
        horseman.close();
        console.log('Selector does not exist!');
        return 1;
    }
    return 0;
}

function serializeHtml(html) {
    //TODO: Serialize html pages
    // Use writeStream to write big file to disk
    var writeStream = fs.createWriteStream(HTML_PATH);
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
    yearRange = [];
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

if (require.main === module) {
    var yearRange = generateYearRange();
    var horseman = configHorseman(Horseman);
    fsmHorseman(horseman, serializeHtml);
}
//http://data1.cde.ca.gov/dataquest/SearchName.asp?rbTimeFrame=oneyear&rYear=2015-16&cName=Franklin+Elementary&Topic=LC&Level=School&submit1=Submit
