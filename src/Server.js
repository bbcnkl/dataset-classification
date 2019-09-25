var http = require('http');
var formidable = require('formidable');
var url = require('url');
var fs = require('fs');
const path = require('path');

var csv = require("csvtojson");
var _ = require('underscore');
var randomForest = require("./modules/RandomForest");
var knn = require("./modules/KNN");
var svm = require("./modules/SVM");
// var nb = require("./modules/NaiveBayes");
var utils = require("./Utils");

const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
};


class Server {
    constructor() {
        this.port = 8080;
    }
    start() {
        http.createServer( (req, response) => {

            const parsedUrl = url.parse(req.url);
            const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
            let pathname = path.join(__dirname, sanitizePath);
            var dataToBind = {};
            if (req.url == '/models') { // PATH: /models

                dataToBind['data'] = JSON.stringify({});
                dataToBind['message'] = 'Treniranje mreže u toku...';
            
                var form = new formidable.IncomingForm();
                form.parse(req, (err, fields, files) => {

                  var headers = [];
                  var target = fields["target"];
                  for (var key in fields) {
                      if(key.includes("field")) {
                          headers.push(fields[key]);
                      }
                  }

                  // upload file
                  if (files.filetoupload == undefined) {
                    response.writeHead(302, { 'Location': '/#error' });
                    response.end();
                    return 0;
                  }
                  var oldpath = files.filetoupload.path;
                  if (!fs.existsSync('../uploads/')){
                    fs.mkdirSync('../uploads/');
                  }
                  var newPath = '../uploads/' + files.filetoupload.name;
                  fs.rename(oldpath, newPath, (err) => {
                    if (err) {
                      dataToBind['message'] = 'Error at uploading file';
                    }

                    // set options
                    if (headers.length > 0) {
                      var options = {
                          headers: headers
                      }
                    } else {
                      var options = {
                          noheader: false
                      }
                    }

                    // convert csv to json
                    csv(options).fromFile(newPath)
                        .on('error',(err) => {
                            dataToBind['message'] = 'CSV datoteka nije validna.';
                        })
                        .on('done',(error) => {})
                        .then((jsonObj) => {
                            var percentForTraining = Number(fields["training"]);
                            var numberForTest = 10;
                            if(percentForTraining > 0 && percentForTraining <= 100) {
                                numberForTest = jsonObj.length - Math.round(jsonObj.length * percentForTraining / 100)

                            } 
                            var numberForTraining = jsonObj.length - numberForTest;
                            dataToBind['data'] = JSON.stringify(jsonObj);

                            utils.convertJSONToNumberMatrix(jsonObj, target);

                            if (fields["algorithm"] == "rf") {
                                var numberOfTrees = fields["trees"] == undefined ? 10 : Number(fields["trees"]);
                                let set = randomForest.randomizeSet(jsonObj, numberForTest);
                                try {
                                    randomForest.start(set[0], set[1], target, numberOfTrees);
                                    dataToBind['correct'] = randomForest.correct;
                                } catch (err) {
                                    dataToBind['correct'] = 0;
                                }
                            }
                            if (fields["algorithm"] == "knn") {
                                knn.start(utils.matrix, numberForTraining);
                                dataToBind['correct'] = knn.correct;
                            }
                            if (fields["algorithm"] == "svm") {
                                svm.start(utils.matrix, numberForTraining, fields['svm-kernel'], fields['svm-reg']);
                                dataToBind['correct'] = svm.correct;
                            }

                            dataToBind['target'] = target;
                            dataToBind['numberForTest'] = numberForTest;

                            dataToBind['algorithm'] = fields["algorithm"];
                            dataToBind['message'] = 'Mreža je uspešno istrenirana.';
                           

                            this.loadTemplate(response, './templates/models.html', dataToBind);

                        })
            
                  });
                });
                
            } else if(req.url == '/') {  // PATH: /
                response.writeHead(200, {'Content-Type': 'text/html'});
                
                dataToBind['data'] = JSON.stringify({});
                dataToBind['message'] = 'Template loaded';
                this.loadTemplate(response, './templates/index.html', dataToBind);

            } else { // STATIC FILES
                fs.exists(pathname, function (exist) {
                    if(!exist) {
                        // if the file is not found, return 404
                        response.statusCode = 404;
                        response.end(`File ${pathname} not found!`);
                        return;
                    }
                
                    // if is a directory, then look for index.html
                    if (fs.statSync(pathname).isDirectory()) {
                        pathname += './templates/index.html';
                    }
                
                    // read file from file system
                    fs.readFile(pathname, function(err, data){
                        if(err){
                            response.statusCode = 500;
                            response.end(`Error getting the file: ${err}.`);
                        } else {
                            // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                            const ext = path.parse(pathname).ext;
                            // if the file is found, set Content-type and send data
                            response.setHeader('Content-type', mimeType[ext] || 'text/plain' );
                            response.end(data);
                        }
                    });
    
                });
            }
        }).listen(this.port);
    }

    loadTemplate(response, template, dataToAppend) {
        fs.readFile(template, 'utf8', (error, data) => {
            if (error) {
                response.writeHead(404);
                response.write('Whoops! File not found!');
            } else {
                data = this.bindData(data, dataToAppend);
                response.write(data);
            }
            response.end();
        });
    }

    bindData(data, dataToAppend) {
        for(var prop in dataToAppend)
            if( dataToAppend.hasOwnProperty(prop) )
                data = data.split('${'+prop+'}').join(dataToAppend[prop]);
        return data;
    }
}

module.exports = Server;
