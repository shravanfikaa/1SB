import { useEffect, useState } from 'react'
import SideBar from '../../sidebar/sidebar';
import CorporatePlan from '../../corporate_plan/corporate_plan';
import ComponentHolder from '../../component_holder/component_holder';
import { LocalStorageHandler } from '../../../lib/storage_handler';
import { getProductId } from '../../../lib/review_utils';
import { navigationUserJourney } from '../../../lib/sidebar_utils';
import NavBarMain from '../../navbar/NavBarMain';
import { getSideBarList, sideBarList, getFMSideBarList } from '../../../lib/sidebar_items';
import DataHandler from '../../../utils/journey_handler';
import { getJourneyType, getUserRole, setSessionStorageItem } from '../../../lib/util';
import appConfig from '../../../app.config';
import { useTranslation } from 'react-i18next';
import { useRouter } from "next/router";
import { fetchManufacturerProperties } from '../../../utils/manufaturerProfile';
import { fetchDynamicFieldDetails } from '../../../utils/dynamicFieldDetails';
import { fetchProductDetails } from '../../../utils/productDetails';
import { featureFlagApi } from '../../../lib/application_setup';

function BaseComponent() {
  const [componentName, setComponentName] = useState("");
  const [journeyType, setJourneyType] = useState("");
  const [sideBarListA, setSideBarList] = useState();
  const [journeyDraft, setJourneyDraft] = useState();
  const [componentDraftData, setComponentDraftData] = useState();
  const [currentJourneyId, setCurrentJourneyId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFamilyMember, setIsFamilyMember] = useState(false);
  const [productName, setProductName] = useState("");
  const [productLogo, setProductLogo] = useState("");
  const [productType, setProductType] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");

  const { t: translate } = useTranslation();
  const apiUrl = appConfig?.deploy?.baseUrl + appConfig?.deploy?.pauseAndResumeJourney;
  const dataHandler = new DataHandler(apiUrl);
  const router = useRouter();

  // Create nested objects for manufacturerId, productId, and productType if journey is not exist
  const findExistingDraft = ({ id, productId, productType, manufacturerId, userId }) => {
    // Retrieve and parse existing journey data from localStorage
    const existingDraft = localStorage.getItem("FD_JOURNEY_DATA");
    const draft = JSON.parse(existingDraft);

    // Check and update nested objects for userId, manufacturerId, productId, and productType
    if (draft?.[userId]?.[manufacturerId]) {
      if (draft[userId][manufacturerId][productId]) {
        if (draft[userId][manufacturerId][productId][productType]) {
          // Add id to existing product type array
          draft[userId][manufacturerId][productId][productType] = id;
        } else {
          // Create product type and assign id
          draft[userId][manufacturerId][productId][productType] = id;
        }
      } else {
        // Initialize product and product type with id
        draft[userId][manufacturerId][productId] = {};
        draft[userId][manufacturerId][productId][productType] = id;
      }
    } else {
      // Initialize user, manufacturer, product, and product type with id
      setCurrentJourneyId(id);
      draft[userId] = {};
      draft[userId][manufacturerId] = {};
      draft[userId][manufacturerId][productId] = {};
      draft[userId][manufacturerId][productId][productType] = id;
    }

    // Store updated draft data in localStorage
    localStorage.setItem("FD_JOURNEY_DATA", JSON.stringify(draft));
  }

  const generateDraft = ({ id, productId, productType, manufacturerId, userId }) => {
    // Initialize journeyData with userId as the key
    const journeyData = JSON.parse(`{"${userId}": {}}`);

    // Create nested objects for manufacturerId, productId, and productType
    journeyData[userId][manufacturerId] = {};
    journeyData[userId][manufacturerId][productId] = {};
    journeyData[userId][manufacturerId][productId][productType] = id;

    // Store journeyData in localStorage
    localStorage.setItem("FD_JOURNEY_DATA", JSON.stringify(journeyData));
    setCurrentJourneyId(id);
  }

  // Save data
  async function handleSaveData(componentName, dataToSave) {
    const userRole = getUserRole();
    const productId = sessionStorage.getItem("selectedProductId");
    const productType = sessionStorage.getItem("selectedProductType");
    const manufacturerId = sessionStorage.getItem("selectedManufactureId");
    const userId = sessionStorage.getItem("userId");
    let agentId = "";
    let journeyType = getJourneyType();
    if (journeyType == "RM") {
      const id = sessionStorage.getItem("agentId");
      agentId = id ? id : "";
    }

    const requestPayload = {
      "agentId": agentId,
      "userId": userId ? userId : "",
      "pageName": componentName,
      "productId": productId,
      "productType": productType,
      "manufacturerId": manufacturerId,
      "payload": {
        ...dataToSave
      },
      "fdApplicationNumber": currentJourneyId ? currentJourneyId : ""
    }
    if (dataToSave) {
      const responseData = await dataHandler.saveData(requestPayload);
      const existingDraft = localStorage.getItem("FD_JOURNEY_DATA");
      const { data: { data } } = responseData;

      if (existingDraft && !currentJourneyId) {
        findExistingDraft({
          id: data.fdApplicationNumber, productId, productType, manufacturerId, userId
        });
      } else if (!currentJourneyId) {
        generateDraft({
          id: data.fdApplicationNumber, productId, productType, manufacturerId, userId
        });
      }
    }
  }

  //fetch Data
  async function handleFetchData(label) {
    const userRole = getUserRole();
    if (currentJourneyId) {
      const requestPayload = {
        page_name: label ? label : "",
        fdApplicationNumber: currentJourneyId ? currentJourneyId : ""
      }
      const responseData = await dataHandler.fetchData(requestPayload);
      const { data: { data } } = responseData;
      if (data && userRole?.toLowerCase() !== "familyhead") {
        !label && setJourneyDraft(data);
        if (componentName === "customer_personal_details" && !label) {
          data[componentName] && setComponentDraftData({ customer_personal_details: data[componentName] });
        }
        label && setComponentDraftData(data);
      }
    }
  }

  function handleRouting(label, e, componentCache, componentName, dataToSave) {
    journeyType !== "RM" && handleFetchData(label);
    const productId = getProductId();
    journeyType !== "RM" && dataToSave && handleSaveData(componentName, dataToSave)
    sessionStorage.removeItem(componentName);

    if (componentCache != undefined) {
      new LocalStorageHandler().setLocalStorage('' + productId, componentName, componentCache, true)
    }
    label && setComponentName(label);
  }

  // Temporary disabled the sidebar items click for tipson because address details change FD-2742
  function sideBarHandler(label, e) {
    let returnData = navigationUserJourney(label, sideBarListA);
    journeyType !== "RM" && handleFetchData(label);
    returnData = returnData ? returnData : null
    if (returnData.navigationCondition) {
      setComponentName(label);
    }
  }

  const updatePages = (pages) => {
    const updatedPages = pages.filter(page => page.link !== "customer_address");

    const basicDetails = updatedPages.find(page => page.link === "basic_details");
    const parentsSpouseDetails = updatedPages.find(page => page.link === "parents_spouse_details");

    if (basicDetails) {
      basicDetails.nextPage = "parents_spouse_details";
    }

    if (parentsSpouseDetails) {
      parentsSpouseDetails.previousPage = "basic_details";
    }

    return updatedPages;
  };

  const getManufacturerDetails = async (selectedManufactureId) => {
    const response = await fetchManufacturerProperties(selectedManufactureId);
    if (response) {
      if (response?.data?.data) {
        const { onboardingMode, manufacturerName } = response?.data?.data;
        if (onboardingMode) {
          sessionStorage.setItem(
            "onboardingMode",
            JSON.stringify(onboardingMode)
          );
        }
        if (manufacturerName) {
          sessionStorage.setItem("selectedProductName", manufacturerName);
          setProductName(manufacturerName);
        }
      }
    }
  };

  const getDynamicFieldDetails = async (selectedManufactureId) => {
    const response = await fetchDynamicFieldDetails(selectedManufactureId);
    if (response) {
      if (response?.data?.errors?.length) {
        sessionStorage.removeItem("shouldRenderProfessionalDetails");
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { dynamicFields } = response.data.data;
        const keys = Object.keys(dynamicFields);
        if (keys.length) {
          keys.includes("ProfessionalDetails")
            ? sessionStorage.setItem("shouldRenderProfessionalDetails", true)
            : sessionStorage.setItem(
              "shouldRenderProfessionalDetails",
              false
            );
        } else {
          sessionStorage.removeItem("shouldRenderProfessionalDetails");
        }
      }
    }
  }

  const getProductInfo = async (productManufacturerId, productType, productID) => {
    const response = await fetchProductDetails(productManufacturerId, productType, productID);
    if (response) {
      if (response?.data?.errors?.length) {
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { fd_details } = response.data.data;
        setSessionStorageItem("MaxNominee", fd_details["maxFdNomineeLimit"]);
        setSessionStorageItem("selectedProductTnCUrl", fd_details.tncUrl);
        setSessionStorageItem("selectedProductLogo", fd_details.logoUrl || "");
        fd_details.logoUrl && setProductLogo(fd_details.logoUrl);
      }
    }
  }

  const getFeatureFlagData = async () => {
    const featureFlag = await featureFlagApi();
  }

  useEffect(() => {
    const { query } = router;
    if (Object.keys(query).includes("manufacturerId")) {
      setSessionStorageItem("isLoggedIn", JSON.stringify({ loggedIn: false }));
      setSessionStorageItem("isAlreadyLoggedIn", JSON.stringify({ isAlreadyLoggedIn: false }));
      setSessionStorageItem("selectedFlowType", query.flowType);
      setSessionStorageItem("selectedManufactureId", query.manufacturerId);
      setSessionStorageItem("selectedProductId", query.productId);
      setSessionStorageItem("selectedProductType", query.productType);
      setProductType(query.productType);
      setManufacturerId(query.manufacturerId)
      getProductInfo(query.manufacturerId, query.productType, query.productId);
      getFeatureFlagData();
    }
  }, [router]);

  useEffect(() => {
    localStorage.setItem("FD_JOURNEY_ID", currentJourneyId);
    journeyType !== "RM" && handleFetchData();
  }, [currentJourneyId]);

  useEffect(() => {
    const productId = sessionStorage.getItem("selectedProductId");
    const productType = sessionStorage.getItem("selectedProductType");
    const manufacturerId = sessionStorage.getItem("selectedManufactureId");
    let journeyId = "";
    let userId = sessionStorage.getItem("userId");
    const journeyData = JSON.parse(localStorage.getItem("FD_JOURNEY_DATA"));
    if (journeyData && journeyData[userId]) {
      if (journeyData?.[userId]?.[manufacturerId]?.[productId]?.[productType]?.length)
        journeyId = journeyData[userId][manufacturerId][productId][productType];
    }
    setCurrentJourneyId(journeyId);
  })

  useEffect(() => {
    if (manufacturerId) {
      getManufacturerDetails(manufacturerId);
      getDynamicFieldDetails(manufacturerId);
    }
  }, [manufacturerId])

  useEffect(() => {
    if (window.location.href.toLowerCase().includes("diy")) {
      const url = new URL(window.location.href);
      const hasVkycJourney = url.searchParams.has('vkycJourney');
      setJourneyType("DIY");
      if(hasVkycJourney){
        setComponentName("review_invest");
      }
      else{
        if(sessionStorage.getItem("CurruntPage")){
          const CurruntPage=(sessionStorage.getItem("CurruntPage"))
          setComponentName(CurruntPage)
        }
        else{
          setComponentName("customer_personal_details");
        }
       
      }
    } 
    else {
      setJourneyType("RM");
      setComponentName("basic_details");
    }
    const list = getSideBarList()
    setSideBarList(list);
  }, []);

  useEffect(() => {
    const selectedUserId = sessionStorage.getItem("selectedUserId");

    if (selectedUserId) {
      const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
      if (familyDetails?.payload?.investorDetails) {
        const investorDetails = familyDetails.payload.investorDetails.find(details => details.userId === Number(selectedUserId));
        if (investorDetails) {
          if (!investorDetails.isFamilyHead) {
            setIsFamilyMember(true);
          } else {
            setIsFamilyMember(false);
          }
        }
      }
    }
  });

  useEffect(() => {
    if (isFamilyMember) {
      const list = getFMSideBarList()
      setSideBarList(list);
    } else {
      const list = getSideBarList()
      setSideBarList(list);
    }
  }, [isFamilyMember]);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isAlreadyLoggedIn");
    if (isLoggedIn) {
      const { isAlreadyLoggedIn } = JSON.parse(isLoggedIn);
      setIsLoggedIn(isAlreadyLoggedIn);
    }
  })

  return (
    <div>
      {isLoggedIn ? <NavBarMain /> : <NavBarMain />}
      <div className="page-background text-apercu-medium view-container view_container_sm">
        <CorporatePlan journeyType={journeyType} type={productType} logo={productLogo} name={productName} />
        <div className="flex gap-5">
          {
            componentName && sideBarListA ? <>
              <div className="w-[35%] sidebarContainer  h-100">
                <SideBar compName={componentName} handle2={sideBarHandler} sideBarList={sideBarListA} />
              </div>
              <div className="w-full">
                <ComponentHolder parameter={componentName} handle={handleRouting} journeyType={journeyType} sideBarList={sideBarListA} journeyData={componentDraftData} />
              </div>
            </> : null
          }
        </div>
      </div>
    </div>
  )
}

export default BaseComponent;
