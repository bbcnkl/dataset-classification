class Utils {
    constructor() {
        this.jsonObject = null;
        this.keys = [];
        this.paramsMap = {};
        this.matrix = [];
        this.maxKey = 1;
    }

    convertJSONToNumberMatrix(objectJSON, target) {
        // reset
        this.matrix = [];
        this.jsonObject = null;
        this.keys = [];
        this.paramsMap = {};

        // saving parameters
        this.jsonObject = objectJSON;

        for(var k in objectJSON[0]) {
            this.keys.push(k);
            this.allPossibleValues(k);
        }

        this.convertToMatrix(target);
        this.changeRangeForClass();
        
    }

    allPossibleValues(param) {
        this.paramsMap[param] = {}
        var counter = 1;
        this.jsonObject.forEach((item) => {
            if (!(item[param] in this.paramsMap[param]) ) {
                this.paramsMap[param][item[param]] = counter;
                counter++;
            }
        });
    }

    convertToMatrix(mainParam) {
        this.jsonObject.forEach((item) => {
            var tmpArray = [];
            for(var key in item) {
                var val = item[key]; 
                tmpArray.push(this.paramsMap[key][val]);
                if(key == mainParam) {
                    this.maxKey = Math.max(this.maxKey, this.paramsMap[key][val])
                }
            }
            this.matrix.push(tmpArray);
        });
    }

    changeRangeForClass() {
        var step = 0;
        if( this.maxKey > 1)
            step = 2 / (this.maxKey - 1);

        for(var i = 0; i < this.matrix.length; i++) {
            var val = this.matrix[i][0]; // @TODO get by class key
            var newVal =  -1 - step + val * step;
            this.matrix[i][0] = newVal;
        }
    }

    groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
             const key = keyGetter(item);

             const collection = map.get(key);
             if (!collection) {
                 map.set(key, [item]);
             } else {
                 collection.push(item);
             }
        });
        return map;
    }
}

module.exports = new Utils;