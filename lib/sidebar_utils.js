import { getLocalStorageData } from "./review_utils"
let optionalComponent = ""
let previousComponent = ""

function navigationUserJourney(ToPage, sideBarList) {
  // debugger;
  for (let i = 0; i < sideBarList.length; i++) {
    if (sideBarList[i].link == ToPage) {
      previousComponent = sideBarList[i].previousPage
      optionalComponent = sideBarList[i].optional
    }
  }

  if (previousComponent == "customer_personal_details") {
    previousComponent = "CkycApiData"
  }

  let previousComponentData;
  if (previousComponent === "add_nominee") {
    previousComponentData = Array.isArray(getLocalStorageData("", "nominee_details")) ?
      { nominee: getLocalStorageData("", "nominee_details") } : {}
  } else {
    previousComponentData = getLocalStorageData("", previousComponent);
  }

  const firstPageData = getLocalStorageData("", "CkycApiData");

  let navigationCondition = true;
  const url = new URL(window.location.href);
  const hasVkycJourney = url.searchParams.has('vkycJourney');
  if (window.location.href.toLowerCase().includes("diy")) {
    optionalComponent = Object.keys(firstPageData).length > 0 ? optionalComponent : false;
    navigationCondition = (Object.keys(previousComponentData).length > 0 || ToPage == "customer_personal_details") || optionalComponent;
  } else {
    const firstPageData = getLocalStorageData("", "basic_details");
    optionalComponent = Object.keys(firstPageData).length > 0 ? optionalComponent : false;
    navigationCondition = (Object.keys(previousComponentData).length > 0 || ToPage == "basic_details") || optionalComponent;
  }
  if(hasVkycJourney){
    navigationCondition = true;
  }

  return { navigationCondition, previousComponentData }
}
export { navigationUserJourney }