var KNNlib = require('ml-knn');

var _ = require('underscore');

class KNN {
    constructor() {
        this.data = [];
        this.X = [];
        this.y = [];
        this.trainingSetX = [];
        this.trainingSetY = [];
        this.testSetX = [];
        this.testSetY = [];
        this.seperationSize = 0;
        this.knn;
        this.correct = 0;
    }
    start(dataObj, numberForTraining) {
        delete this.data;
        this.X = [];
        this.y = [];
        this.trainingSetX = [];
        this.trainingSetY = [];
        this.testSetX = [];
        this.testSetY = [];
        this.seperationSize = 0;

        this.data = []
        this.data = dataObj;

        this.seperationSize = numberForTraining;
        this.dressData();
    }

    dressData() {
    
        let types = new Set(); // To gather UNIQUE classes
    
        this.data.forEach((row) => {
            types.add(row[0]); // add first column @TODO what if it is not always first?
        });
    
        // let typesArray = [...types]; // To save the different types of classes.
        this.data.forEach((row) => {
            let rowArray, typeNumber;
            rowArray = row.slice(1, (this.data[0].length))
            typeNumber = row[0]; 

            this.X.push(rowArray);
            this.y.push(typeNumber);
        });
    

        this.trainingSetX = this.X.slice(0, this.seperationSize);
        this.trainingSetY = this.y.slice(0, this.seperationSize);
        this.testSetX = this.X.slice(this.seperationSize);
        this.testSetY = this.y.slice(this.seperationSize);
    
        this.train();
    }

    train() {
        this.knn = new KNNlib(this.trainingSetX, this.trainingSetY, {k: (this.data[0].length + 2)});
        this.test();
    }

    test() {
        const result = this.knn.predict(this.testSetX);
        const testSetLength = this.testSetX.length;
        const predictionError = this.error(result, this.testSetY);
        var correct = testSetLength - predictionError;
        this.correct = correct;
        console.log("===== KNN =====")
        console.log(correct + "/" + testSetLength, (correct/testSetLength)*100 + "%", "accurate");
        console.log(`Test Set Size = ${testSetLength} and number of Misclassifications = ${predictionError}`);
        console.log("===============")
    }

    error(predicted, expected) {
        let misclassifications = 0;
        for (var index = 0; index < predicted.length; index++) {
            if (predicted[index] !== expected[index]) {
                misclassifications++;
            }
        }
        return misclassifications;
    }
    
}

module.exports = new KNN;