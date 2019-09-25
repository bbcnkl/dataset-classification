var RandomForestClassifier = require('random-forest-classifier').RandomForestClassifier;
var _ = require('underscore');

class RandomForest {
    constructor() {
        this.prediction = null;
        this.expected = null;
        this.correct = 0;
    }


    start(trainingDataset, testDataset, targetParameter, numberOfTrees) {
        var rf = new RandomForestClassifier({
            n_estimators: numberOfTrees
        });

        // fit data
        rf.fit(trainingDataset, null, targetParameter, (err, trees) => {
          if (err) {
            var dataToBind = {}
            dataToBind['message'] = err;
          }
      
          var expected =  _.pluck(testDataset, targetParameter);
      
          var newTestSet = testDataset;
          var newOut = [];
          newTestSet.map(function(item) {
              newOut.push(item[targetParameter])
              delete item[targetParameter];
              return item;
          });
      
          var pred = rf.predict(newTestSet, trees);
          this.expected = expected;
          var correct = 0;
          for (var i=0; i< pred.length; i++){
            if (pred[i]==expected[i]){
              correct++;
            }
          }
          console.log(correct + "/" + pred.length, (correct/pred.length)*100 + "%", "accurate");
          this.prediction = pred;
          this.correct = correct;
        });
    }

    randomizeSet(data, numberForTest) {
        var testData = [];
        var trainingData = data;
        for (var i=0; i < numberForTest; i++){
            var ran_num = Math.floor(Math.random() * (data.length - 0 + 1));
            testData.push(data[ran_num]);
            trainingData = _.without(trainingData, trainingData[ran_num]);
        }
        return [trainingData, testData];
      
    }
}

module.exports = new RandomForest;