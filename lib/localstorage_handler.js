class LocalStorageHandler {
    constructor() {
    }
    setLocalStorage(componentName, componentData, overwrite = true) {
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

export { LocalStorageHandler }