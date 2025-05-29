// To handle sessionStorage
// This storage will be preserved in your local browser and it wont be auto-cleaned
import { getProductId } from "./review_utils"
class LocalStorageHandler {
    constructor() {
    }
    setLocalStorage(selectedProductId, componentName, componentData, overwrite = true) {

        if (selectedProductId == "0") {

            selectedProductId = typeof window !== "undefined" ? sessionStorage.getItem("selectedProductId") : 0
        }
        if (typeof window !== "undefined") {
            let temp = sessionStorage.getItem('' + selectedProductId)

            temp = JSON.parse(temp) ? JSON.parse(temp) : {}
            let data = {}

            if (temp.hasOwnProperty(componentName)) {
                temp[componentName] = componentData[componentName]
                data = temp
            } else {

                data[selectedProductId] = { ...temp, ...componentData }
                data = data[selectedProductId]
            }

            sessionStorage.setItem(selectedProductId, JSON.stringify(data))
        }
    }
    setSessionStorageItem(itemName, item, overwrite = true) {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(itemName, JSON.stringify(item))
        }
    }
    setLocalStoragePlainItem(itemName, item, overwrite = true) {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(itemName, item)
        }
    }
    getLocalStorage(componentName) {
        if (componentName == undefined) {
            componentName = getProductId()
            if (typeof window === "undefined") {
                return {}
            }
        }
        if (typeof window !== "undefined") {
            try {
                return JSON.parse(sessionStorage.getItem(componentName))
            }
            catch (error) { console.log("Exception :", error); return {} }
        }
    }
    getLocalStorageItem(itemName) {
        if (typeof window !== "undefined") {
            return sessionStorage.getItem(itemName)

        }
    }
    clearLocalStorage() {
        if (typeof window !== "undefined") {
            sessionStorage.clear()
            return true;
        }
        return false;
    }

}
// To handle sessionStorage
// Persists data for only current active tab of the application.
// Data is reset for new tab in same window.
// Data is cleared when current window is closed.
class SessionStorageHandler {
    constructor() {
    }
    setLocalStorage(selectedProductId, componentName, componentData, overwrite = true) {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(componentName, JSON.stringify(componentData))
        }
    }
    getLocalStorage(componentName) {
        if (typeof window !== "undefined") {
            try {
                return JSON.parse(sessionStorage.getItem(componentName))
            }
            catch (error) { console.log("Exception :", error); return {} }
        }
    }

}

export { LocalStorageHandler, SessionStorageHandler }