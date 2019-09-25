var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
 };
var backgroundColorArray = [];
for (var bg = 0; bg < 100; bg++) {
    backgroundColorArray.push(dynamicColors())
}
var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: keys,
        datasets: [{
            label: targetParam,
            data: dataLength,
            backgroundColor: backgroundColorArray,
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

var idCounter = 1;
for(var k in keys) {
    var activeKey = keys[k];
    $("#all").append("<div style='width:" + 100/keys.length + "%;' id='wrap-" + k + "'></div>");
    for(var m in bigGroup[activeKey]) {
        var tmpMap = bigGroup[activeKey][m];
        var tmpKeys = [];
        var tmpLength = [];
        tmpMap.forEach((item, key) => {
            if (key != '?') {
                tmpKeys.push(key);
                tmpLength.push(item.length);
            }
        });
        $("#wrap-" + k).append("<hr><canvas id='cnv-" + idCounter + "' height='300'></canvas>");
        var ctx  = $("#cnv-" + idCounter);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: tmpKeys,
                datasets: [{
                    label: m + "(" + activeKey + ")",
                    data: tmpLength,
                    backgroundColor: backgroundColorArray,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                // maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        idCounter++;
    }
    
}