try {
    let data = '${data}';
} catch(err) {

}


$(document).ready(function(){
    if (window.location.hash == "#error") {
        $("#errorModal").modal("show");
        $('#errorModal').on('hidden.bs.modal', function () {  
            window.history.back();
            
        
        });
    }

    $('input[type=radio][name=algorithm]').prop('checked', false);

    if ($('input[type=radio][name=header]:checked').val() == "0") {
        showHeaderInputs();
    }

    $("#submit").on('click', function() {
        if (headers.length)
            sessionStorage.setItem("headerItems", JSON.stringify(headers))
        $(this).parent().parent().hide(300);
        $(".ok_message").addClass("active");
    });

    $(".ok_message").on('click', function() {
        $(this).removeClass("active");
        $(".form").removeClass("active").show();
    });

    // working with files and form
    $('input[type=radio][name=header]').change(function() {
        
        $("#submit").show();
        if (this.value == 1) {
            $("#attr-inputs").html("");
        }
        else if (this.value == 0) {
            showHeaderInputs();
        }
    });

    
    $('input[type=radio][name=algorithm]').change(function() {
        $("#file-choose").show();
        if (this.value == 'rf') {
            $("#num-of-trees").show();
            $("#svm-options").hide();
        }
        if (this.value == 'svm') {
            $("#num-of-trees").hide();
            $("#svm-options").show();
        }
        if (this.value == 'knn') {
            $("#num-of-trees").hide();
            $("#svm-options").hide();
        }
    });
    

    $("#training-number").bind("propertychange change click keyup input paste", function() {
        var trVal = Math.min(100, Number($("#training-number").val()));
        if (trVal < 1) {
            trVal = 1;
        }
        $("#test-number").val(100-trVal)
    });

});

var numberOfAttributes = 0;
var headers = JSON.parse(sessionStorage.getItem("headerItems")) || ["class", "age", "menopause", "tumor-size", "inv-nodes", "node-caps", "deg-malig", "breast", "breast-quad", "irradiat"]
  

function onFileLoad(elementId, event) {
    var data = event.target.result;
    var firstRow = data.split("\n")[0];
    numberOfAttributes = firstRow.split(",").length;
    $("#target").show();
    $("#check-header").show();
    $("#number-of-parameters-wrap").show();
    $("#training-percent").show();
    
    $("hr").show();
    $("#number-of-parameters").text(numberOfAttributes)
    $("#number-of-rows").text(data.split("\n").length)

}

function onChooseFile(event, onLoadFileHandler) {
    if (typeof window.FileReader !== 'function')
        throw ("The file API isn't supported on this browser.");
    let input = event.target;
    if (!input)
        throw ("The browser does not properly implement the event object");
    // if (!input.files)
    //     throw ("This browser does not support the `files` property of the file input.");
    // if (!input.files[0])
    //     return undefined;
    // console.log(input.files)
    let file = input.files[0];
    // let file = input.files.item(0)
    let fr = new FileReader();
    fr.onload = onLoadFileHandler;
    fr.readAsText(file);
}

function showHeaderInputs() {

    $("#attr-inputs").append("<p>Unesite zaglavlja u poljima ispod. <i>(Automatski su uneta zaglavlja za 'breast cancer dataset'. Za drugi dataset promeniti parametre.)</i> </p>")
    for(var i = 0; i < numberOfAttributes; i++) {
        $("#attr-inputs").append("<input type='text' name='field-" + (i + 1) + "' value='" + (headers[i] == undefined ? '' : headers[i]) + "' />")
    }
    $("#attr-inputs").show();
    $("#submit").show();
}