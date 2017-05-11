const d3 = require('d3');
const Tabletop = require('tabletop');
const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const InputSanitizer = require('./inputSanitizer');
const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const MalformedDataError = require('../exceptions/malformedDataError');
const SheetNotFoundError = require('../exceptions/sheetNotFoundError');
const ContentValidator = require('./contentValidator');
const Sheet = require('./sheet');
const TrelloHelper = require('./trelloHelper');
const ExceptionMessages = require('./exceptionMessages');


const TrelloBoard = function () {
    
    var self = {};
   
    self.build = function () {
        console.log("TrelloBoard build");
        createRadarFromTrello();
        
        function displayErrorMessage(exception) {
           // TBD
        }
        
        function createRadarFromTrello() {
            console.log("enteringcreateRadarFromTrello");
            try {
                var columnNames = ["name", "ring", "quadrant", "isNew", "description"];
                var contentValidator = new ContentValidator(columnNames);
                contentValidator.verifyContent();
                contentValidator.verifyHeaders();
                
                console.log(columnNames);
                
                //var trelloHelper = new TrelloHelper().build();
                var trelloHelper = new TrelloHelper();

                console.log(trelloHelper);
                //trelloHelper.compute();
                trelloHelper.build();
                var all = [];
                setTimeout(function(){
                    all = trelloHelper.getAll();
                    console.log("print all from factory " +all);

                    /*var all = [ { name: "Charlie", ring: "adopt", quadrant: "Unicorn", isNew: "TRUE", description: "yolo" }, 
                                { name: "Chaaaa", ring: "adopt", quadrant: "Unicorn2", isNew: "TRUE", description: "yolo2" }, 
                                { name: "The non beliver", ring: "ringolo", quadrant: "Unicorn3", isNew: "TRUE", description: "yolo3" }, 
                                { name: "The Unicorn", ring: "ringTest", quadrant: "Magic Trees", isNew: "FALSE", description: "Adequate" }
                                ];
                    */
                    var blips = _.map(all, new InputSanitizer().sanitize);
                    console.log(blips);
    
                    document.title = "My Trello Board as Radar";
                    d3.selectAll(".loading").remove();
    
                    var rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
                    var ringMap = {};
                    var maxRings = 4;
    
                    _.each(rings, function (ringName, i) {
                        if (i == maxRings) {
                            throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
                        }
                        ringMap[ringName] = new Ring(ringName, i);
                    });
    
                    var quadrants = {};
                    _.each(blips, function (blip) {
                        if (!quadrants[blip.quadrant]) {
                            quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
                        }
                        quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
                    });
    
                    var radar = new Radar();
                    _.each(quadrants, function (quadrant) {
                        radar.addQuadrant(quadrant)
                    });
    
                    var size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;
    
                    new GraphingRadar(size, radar).init().plot();
                }, 6000);
                
               

            } catch (exception) {
                displayErrorMessage(exception);
            }
        }
    };

    self.init = function () {
        console.log("TrelloBoard init");
        var content = d3.select('body')
            .append('div')
            .attr('class', 'loading')
            .append('div')
            .attr('class', 'input-sheet');

        set_document_title();

        plotLogo(content);

        var bannerText = '<h1>Building your radar...</h1><p>Your Technology Radar will be available in just a few seconds</p>';
        plotBanner(content, bannerText);
        plotFooter(content);
        
        return self;
    };
    
    return self;
};

/*const GoogleSheet = function (sheetReference, sheetName) {
    var self = {};
   
    self.build = function () {
        var sheet = new Sheet(sheetReference);
        sheet.exists(function(notFound) {
            if (notFound) {
                displayErrorMessage(notFound);
                return;
            }

            Tabletop.init({
                key: sheet.id,
                callback: createRadarFromData
            });
        });

        function displayErrorMessage(exception) {
            d3.selectAll(".loading").remove();
            var message = 'Oops! It seems like there are some problems with loading your data. ';

            if (exception instanceof MalformedDataError) {
                message = message.concat(exception.message);
            } else if (exception instanceof SheetNotFoundError) {
                message = exception.message;
            } else {
                console.error(exception);
            }

            message = message.concat('<br/>', 'Please check <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html#faq">FAQs</a> for possible solutions.');

            d3.select('body')
                .append('div')
                .attr('class', 'error-container')
                .append('div')
                .attr('class', 'error-container__message')
                .append('p')
                .html(message);
        }

        function createRadar(sheets, tabletop) {
            window.alert("function create radar");

            try {

                if (!sheetName) {
                    sheetName = Object.keys(sheets)[0];
                }
                var columnNames = tabletop.sheets(sheetName).column_names;

                var contentValidator = new ContentValidator(columnNames);
                contentValidator.verifyContent();
                contentValidator.verifyHeaders();

                var all = tabletop.sheets(sheetName).all();

                var blips = _.map(all, new InputSanitizer().sanitize);

                document.title = tabletop.googleSheetName;
                d3.selectAll(".loading").remove();

                var rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
                var ringMap = {};
                var maxRings = 4;

                _.each(rings, function (ringName, i) {
                    if (i == maxRings) {
                        throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
                    }
                    ringMap[ringName] = new Ring(ringName, i);
                });

                var quadrants = {};
                _.each(blips, function (blip) {
                    if (!quadrants[blip.quadrant]) {
                        quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
                    }
                    quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
                });

                var radar = new Radar();
                _.each(quadrants, function (quadrant) {
                    radar.addQuadrant(quadrant)
                });

                var size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;

                new GraphingRadar(size, radar).init().plot();

            } catch (exception) {
                displayErrorMessage(exception);
            }
        }
        
        
        function createRadarFromData() {

            try {

                var columnNames = ["name", "ring", "quadrant", "isNew", "description"];
                
                var contentValidator = new ContentValidator(columnNames);
                contentValidator.verifyContent();
                contentValidator.verifyHeaders();

                var all = [ { name: "Charlie", ring: "adopt", quadrant: "Unicorn", isNew: "TRUE", description: "yolo" }, 
                            { name: "Chaaaa", ring: "adopt", quadrant: "Unicorn2", isNew: "TRUE", description: "yolo2" }, 
                            { name: "The non beliver", ring: "ringolo", quadrant: "Unicorn3", isNew: "TRUE", description: "yolo3" }, 
                            { name: "The Unicorn", ring: "ringTest", quadrant: "Magic Trees", isNew: "FALSE", description: "Adequate" }
                            ];

                var blips = _.map(all, new InputSanitizer().sanitize);

                document.title = "My Title";
                d3.selectAll(".loading").remove();

                var rings = _.map(_.uniqBy(blips, 'ring'), 'ring');
                var ringMap = {};
                var maxRings = 4;

                _.each(rings, function (ringName, i) {
                    if (i == maxRings) {
                        throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS);
                    }
                    ringMap[ringName] = new Ring(ringName, i);
                });

                var quadrants = {};
                _.each(blips, function (blip) {
                    if (!quadrants[blip.quadrant]) {
                        quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
                    }
                    quadrants[blip.quadrant].add(new Blip(blip.name, ringMap[blip.ring], blip.isNew.toLowerCase() === 'true', blip.topic, blip.description))
                });

                var radar = new Radar();
                _.each(quadrants, function (quadrant) {
                    radar.addQuadrant(quadrant)
                });

                var size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;

                new GraphingRadar(size, radar).init().plot();

            } catch (exception) {
                displayErrorMessage(exception);
            }
            
            
        }
    };

    self.init = function () {
        var content = d3.select('body')
            .append('div')
            .attr('class', 'loading')
            .append('div')
            .attr('class', 'input-sheet');

        set_document_title();

        plotLogo(content);

        var bannerText = '<h1>Building your radar...</h1><p>Your Technology Radar will be available in just a few seconds</p>';
        plotBanner(content, bannerText);
        plotFooter(content);


        return self;
    };

    return self;
};*/

var QueryParams = function (queryString) {
    //console.log("queryParams");
    var decode = function (s) {
        return decodeURIComponent(s.replace(/\+/g, " "));
    };

    var search = /([^&=]+)=?([^&]*)/g;

    var queryParams = {};
    var match;
    while (match = search.exec(queryString))
        queryParams[decode(match[1])] = decode(match[2]);

    return queryParams
};


// ADDED TRELLO INPUT
const TrelloInput = function () {
    console.log("enteringTrelloInput");
    var self = {};

    self.build = function () {
        //var queryParams = QueryParams(window.location.search.substring(1));

        //if (queryParams.sheetId) {
            //
           // var dataTrello = TrelloBoard(queryParams.sheetId);
           console.log("enteringTrelloInput   build");
           var dataTrello = TrelloBoard();
           console.log("enteringTrelloInput   build dataTrello: " +dataTrello);
           dataTrello.init().build();
        /*} else {
            var content = d3.select('body')
                .append('div')
                .attr('class', 'input-sheet');

            set_document_title();

            plotLogo(content);

            var bannerText = '<h1>Build your own Charlie Trello radar</h1>';

            plotBanner(content, bannerText);

            plotForm(content);

            plotFooter(content);
            
            */

        
    };

    return self;
};

/*const GoogleSheetInput = function () {
    var self = {};

    self.build = function () {
        var queryParams = QueryParams(window.location.search.substring(1));
        window.alert(" query  " + queryParams.sheetId + "   -   " + queryParams.sheetName);

        if (queryParams.sheetId) {
            var sheet = GoogleSheet(queryParams.sheetId, queryParams.sheetName);
            sheet.init().build();
        } else {
            var content = d3.select('body')
                .append('div')
                .attr('class', 'input-sheet');

            set_document_title();

            plotLogo(content);

            var bannerText = '<h1>Build your own Charlie  radar</h1><p>Once BannerTEXT you\'ve <a href ="https://info.thoughtworks.com/visualize-your-tech-strategy.html">created your Radar</a>, you can use this service' +
                ' to generate an <br />interactive version of your Technology Radar. Not sure how? <a href ="https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html">Read this first.</a></p>';

            plotBanner(content, bannerText);

            plotForm(content);

            plotFooter(content);

        }
    };

    return self;
};*/


// Added Charlie
function set_document_title() {
    document.title = "Build your own Charlie Radar";
}

function plotLogo(content) {
    content.append('div')
        .attr('class', 'input-sheet__logo')
        .html('<a href="https://www.thoughtworks.com"><img src="/images/tw-logo.png" / ></a>');
}

function plotFooter(content) {
    content
        .append('div')
        .attr('id', 'footer')
        .append('div')
        .attr('class', 'footer-content')
        .append('p')
        .html('Powered by <a href="https://www.thoughtworks.com"> ThoughtWorks</a>. '
        + 'By using this service you agree to <a href="https://info.thoughtworks.com/visualize-your-tech-strategy-terms-of-service.html">ThoughtWorks\' terms of use</a>. '
        + 'You also agree to our <a href="https://www.thoughtworks.com/privacy-policy">privacy policy</a>, which describes how we will gather, use and protect any personal data contained in your public Google Sheet. '
        + 'This software is <a href="https://github.com/thoughtworks/build-your-own-radar">open source</a> and available for download and self-hosting.');



}

function plotBanner(content, text) {
    content.append('div')
        .attr('class', 'input-sheet__banner')
        .html(text);

}

function plotForm(content) {
    content.append('div')
        .attr('class', 'input-sheet__form')
        .append('p')
        .html('<strong>Enter the URL of your <a href="https://support.google.com/docs/answer/37579" target="_blank">published</a> Google Sheet below…</strong>');

    var form = content.select('.input-sheet__form').append('form')
        .attr('method', 'get');

    form.append('input')
        .attr('type', 'text')
        .attr('name', 'sheetId')
        .attr('placeholder', 'e.g. https://docs.google.com/spreadsheets/d/1--_uLSNf/pubhtml');

    form.append('button')
        .attr('type', 'submit')
        .append('a')
        .attr('class', 'button')
        .text('Build my radar');

    form.append('p').html("<a href='https://info.thoughtworks.com/visualize-your-tech-strategy-guide.html#faq'>Need help?</a>");
}

module.exports = TrelloInput;
