let name = ""
let PAN = ""
function kycName(name1) {
    var nameRegex = /^[a-zA-Z-,](\s{0,1}[a-zA-Z-, ])*[^\s]$/;


    if (nameRegex.test(name1)) {
        name = name1
    }
    validNamePan(name1, PAN)
}

function kycPAN(panNumber) {
    var panRegex = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
    if (panRegex.test(panNumber.toUpperCase())) {
        PAN = panNumber
    }
    validNamePan(name, panNumber)

}

var nameFlag = false;
var panFlag = false;
var dobFlag = false
function validateKYCForm(value, label) {

    if (label == "name") {
        var nameRegex = /^[a-zA-Z-,](\s{0,1}[a-zA-Z-, ])*[^\s]$/;

        if (nameRegex.test(value)) {
            nameFlag = nameRegex.test(value)
        }
        return nameFlag
    }

    if (label == "pan") {
        var panRegex = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;

        if (panRegex.test(value.toUpperCase())) {
            panFlag = panRegex.test(value.toUpperCase())
        }
    }
    // return nameFlag && panFlag
}

function isNameValid(){
    return nameFlag;
}

export { kycName, kycPAN, validateKYCForm, isNameValid };
