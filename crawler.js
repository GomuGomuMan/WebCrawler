/**
 * Created by LUCKY on 3/26/2017.
 */
//TODO: Finish crawler's skeleton
var Horseman = require('node-horseman');
var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var JSONStream = require('JSONStream');
var async = require('async');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
const URL_PART1 = 'http://data1.cde.ca.gov/dataquest/SearchName.asp?rbTimeFrame=oneyear&rYear=2015-16&cName=';
const URL_PART2 = '&Topic=LC&Level=School&submit1=Submit';
const SELECTOR_FEP = 'input[value="Redesig4"]';
const SELECTOR_SUBMIT = '#submit1';
const JSON_PATH = "output/unFinished.json";

const MIN_TIME = 5000;
const MAX_TIME = 10000;
const OPERATION_NUM = 2;

var yearRange = generateYearRange();
var failedSelector = [];


function configHorseman(Horseman) {
    var horseman = new Horseman({
        loadImages: false,
        timeout: 20000
    });

    return horseman;
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
function generateURL(yearRange, url, searchTerm) {
    // var urlTemplate = url.substring(0, url.length - 7);
    // yearRange.forEach(function (year) {
    //     var urlGen = urlTemplate + year;
    //     //TODO:Crawl each of these
    //     crawlYearRange(urlGen, searchTerm);
    // });

    var urlTemplate = url.substring(0, url.length - 7);

    async.eachLimit(yearRange, OPERATION_NUM, processData, function (err) {
        if (err)
            console.log("Error: " + err);
    });

    function processData(year, callback) {
        setTimeout(function () {
            var urlGen = urlTemplate + year;
            //TODO:Crawl each of these
            crawlYearRange(urlGen, searchTerm, function (err) {
                callback(err);
            });
            // return callback(null);
        }, getRandomInt());
    }
}

function crawlYearRange(url, searchTerm, callback) {
    var horseman = configHorseman(Horseman);
    //TODO: Create delay to prevent server overload
    horseman
        .userAgent(USER_AGENT)
        .open(url)
        .wait(5000) // faking human delay
        .then(function (err) {
            if (err) { // Handle unknown error from horseman
                console.log(err);
                callback(null);
                return horseman.close();
            }
            else {
                horseman
                    .status()
                    .then(function (status) {
                        if (status !== 200) {
                            console.log("--Error--");
                            console.log("Status: " + status);
                            horseman
                                .url()
                                .then(function (url) {
                                    console.log("URL: " + url);
                                    serializeFailedURL(searchTerm, url, status);
                                })
                        }

                    })
                    // .screenshot('test.png')
                    .html()
                    .then(function (html) {
                        serializeHtml(html, url, searchTerm);
                        callback(null);
                        return horseman.close();
                    });
            }
        })

}



function makeDir(searchTerm) {
    var dirOutput = 'output' + '/' + searchTerm + '/';

    mkdirp(dirOutput, function (err) {
        if (err) {
            throw err;
        }
        else {
            console.log('Made directory!');
        }
    });

    return true;
}

function readJSON(callback) {
    fs.createReadStream(JSON_PATH)
        .pipe(JSONStream.parse('school'))
        .on('data', function (schools) {
            // schools.forEach(function (data) {
            //     return callback(data);
            // })
            return callback(schools);
        });
}

function serializeFailedURL(school, url, status) {
    var text = school + ", " + url + ", " + status;
    fs.writeFile("output/failedUrl.txt", text, function (err) {
        if (err)
            return console.log(err);
        return console.log("Wrote to failedList");
    });
}

/*
* Reduces searchTerm to length 25 or less
* */
function shortenTerm(searchTerm) {
    // var idx = 24;
    // while(idx >= 0)
    // {
    //     if (/\s/.test(searchTerm.charAt(idx))) {
    //         // console.log("IDX: " + idx);
    //         // console.log(searchTerm.substring(0, idx));
    //         break;
    //     }
    //     --idx;
    // }
    // return searchTerm.substring(0, idx);

    // Return substr up to 25 length
    //TODO: Replace substr's space with +


    return searchTerm.substr(0, 25).replace(/\s/g, '+');
}


function fsmHorseman(searchTerm, callback) { // Finite State Machine Horseman
    var horseman = configHorseman(Horseman);
    var shortenedTerm = shortenTerm(searchTerm);

    horseman
        .userAgent(USER_AGENT)
        .open(URL_PART1 + shortenedTerm + URL_PART2)
        .wait(2000)
        .status()
        .then(checkStatus)
        //1st page
        // Check FEP
        .exists(SELECTOR_FEP)
        .then(function (isSelectorExist) {
            if (!isSelectorExist) {
                console.log("--Error--");
                console.log('Selector does not exist!');
                //TODO: Serialize failed url
                horseman
                    .url()
                    .then(function (url) {
                        console.log("selector NOT found at " + url);
                        var obj = {
                            school: searchTerm,
                            url: url,
                            error: 'selectorNotFound'
                        };
                        failedSelector.push(obj);
                        // console.log(failedSelector);
                    })
                    .close();
                return callback(null, null, null);
            }
            else {
                horseman
                    .click(SELECTOR_FEP)
                    // Click submit btn
                    .exists(SELECTOR_SUBMIT)
                    .then(checkSelectorExist)
                    .click(SELECTOR_SUBMIT)
                    // .waitForNextPage()
                    .wait(5000) // Wait 10 sec instead
                    .status()
                    .then(checkStatus)
                    //result page
                    .screenshot('test.png') // Success!!
                    .html()
                    .then(function (html) {
                        horseman
                            .url()
                            .then(function (url) {
                                console.log("--Processing--");
                                console.log("word: " + searchTerm);
                                console.log("url: " + url);
                                callback(html, url, searchTerm);

                                return horseman.close();
                            });
                    });
            }

        });
    // return callback(finalHtml, finalUrl, searchTerm);

    //TODO: Serialize failed search


    function checkStatus(status) {
        if (status !== 200) {
            console.log("--Error--");
            console.log("Status: " + status);
            horseman
                .url()
                .then(function (url) {
                    console.log("URL: " + url);
                    //TODO: Better option is csv or json?
                    serializeFailedURL(searchTerm, url, status);
                })
        }
    }
}

function checkSelectorExist(isSelectorExist) {
    if(!isSelectorExist) {
        horseman.close(); //TODO:Check
        console.log('Selector does not exist!');
        return 1;
    }
    return 0;
}

function serializeHtml(html, url, searchTerm) {
    //TODO: Serialize html pages
    var yearRange = url.substring(url.length - 7);
    var customFileName = 'output/' + searchTerm + '/' + yearRange + '.html';

    // Use writeStream to write big file to disk
    var writeStream = fs.createWriteStream(customFileName);
    writeStream.write(html);
    writeStream.end();

    //TODO: Open file and check if it exists already or not.

}

/*
* Return a random delay time between MIX_TIME and MAX_TIME
* */
function getRandomInt() {
    return Math.floor(Math.random() * (MAX_TIME - MIN_TIME)) + MIN_TIME;
}

if (require.main === module) {

    //TODO: Trying async
    readJSON(function (data) {
        async.eachLimit(data, OPERATION_NUM, processData, function (err) {
            if (err)
                console.log("Error: " + err);
        })
    });

    /*Wrap in set time out function to prevent stack overflow*/
    function processData(searchTerm, callback) {

        // console.log(getRandomInt());
        setTimeout(function () {
            // var searchTerm = 'T. S. MacQuiddy Elementary';



            var isCreated = makeDir(searchTerm);
            if (isCreated) {
                fsmHorseman(searchTerm, function assignTask(html, url, searchTerm) {
                    if (html === null || url === null || searchTerm === null)
                    {
                        return callback(null);
                    }

                    serializeHtml(html, url, searchTerm);

                    //TODO: Serialize crawl url
                    generateURL(yearRange, url, searchTerm);
                    return callback(null);
                });
                // return callback(null);
            }

        }, getRandomInt());

    }

}

