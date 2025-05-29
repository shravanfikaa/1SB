function setDataToLocalStorage(componentName, componentData, jsonData) {
    let temp = sessionStorage.getItem('' + "renewalData")
    temp = JSON.parse(temp) ? JSON.parse(temp) : {}

    let data = {}
    if (temp.hasOwnProperty(componentName)) {
        temp[componentName] = jsonData[componentName]
        data = temp
    } else {
        data["renewalData"] = { ...temp, ...jsonData }
        data = data["renewalData"]
    }

    sessionStorage.setItem("renewalData", JSON.stringify(data));
}

export default setDataToLocalStorage;