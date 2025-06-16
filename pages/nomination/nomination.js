import { AiOutlinePlusCircle } from "react-icons/ai";
import { populateNomineesDropdown } from "../../lib/add_nominee_utils";
import { useEffect, useState, useRef } from "react";
import appConfig from "../../app.config";
import { GetApiHandler } from "../api/apihandler";
import NomineeMultiSelectDropdown from "./nominee_multiSelectDropDown";
import { getLocalStorageData } from "../../lib/review_utils";
import { nomineeDateFormat, dd_mm_yyyy_format, handleEventLogger,isMobile } from "../../lib/util";
import NominationPopUp from "./nomination_popup";
import NomineeCard from "./nominee_card";
import { v4 as uuidv4 } from "uuid";
import { ADDRESS_DETAILS, BUTTON_NAME, COMMON_CONSTANTS, FD_RENEWAL, MAX_NOMINEE_LIMIT_MESSAGE, MAX_SELECT_MESSAGE, MY_PROFILE, nomineeMapping } from "../../constants";
import ErrorModal from "../common/errorPopup";
import styles from "../../styles/customer_personal_details.module.css";
import { useTranslation } from "react-i18next";

function AddNominee(props) {
  const [nomineeData, setNomineeData] = useState([]);
  const [selectedNomineeIds, setSelectedNomineeIds] = useState([]);
  const [selectedTotalNomineeShare, setSelectedTotalNomineeShare] = useState("");
  const [addNomineeFlag, setAddNomineeFlag] = useState(false);
  const [nomineeDropdownData, setNomineeDropdownData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedNomineeData, setSelectedNomineeData] = useState([]);
  const [maxNominee, setMaxNominee] = useState(2);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isValidData, setIsValidData] = useState([]);
  const [userPanNumber, setUserPanNumber] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiErrorMessage, setapiErrorMessage] = useState("");
  const [outsideClick, setOutsideClick] = useState(false);
  const [isNomineeRequired, setIsNomineeRequired] = useState(false);
  const [isConsentEnabled, setIsConsentEnabled] = useState(false);
  const [isAddNomineeEnabled, setIsAddNomineeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nomineeDescAndConsent, setNomineeDescAndConsent] = useState({
    consent: "",
    description: ""
  });
  const [selectedManufactureId, setSelectedManufactureId] = useState("");
  const [nomineeConsent, setNomineeConsent] = useState(false);
  const [nomineeNamePrint, setNomineeNamePrint] = useState(false);
  const { consent, description } = nomineeDescAndConsent;
  const { t: translate } = useTranslation();

  const ref = useRef(null);

  const getOutsideClick = () => {
    setOutsideClick(false);
  };

  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const toggleModal = () => setShowModal((state) => !state);
  const toggleLoading = (state) => setLoading(state);

  const handleContinueBtnClick = (e) => {
    handleEventLogger("add_nominee", "buttonClick", "Invest_Click", {
      action: "Nomination_Details_Completed",
      Screen_Name: "Nomination page",
      Add_Nominee: selectedNomineeData.length === 0 ? "No" : "Yes",
      Platform:isMobile()
    });
    let val = 0;
    setNomineeCheckBoxFlag();
    for (const i in selectedNomineeData) {
      val += Number(selectedNomineeData[i]["nominee_percentage"]);
    }
    setSelectedTotalNomineeShare(`You have entered nominee share  ${JSON.stringify(val)} %.`);
    if (val != 100 && val != 0) {
      setShowModal(true);
    } else if (val == 0) {
      props.handle(props.nextPage, e, { nominee_details: [] }, "add_nominee", []);
    } else {
      setShowModal(false);
      sessionStorage.setItem("nomineeNamePrint", JSON.stringify(nomineeNamePrint))
      props.handle(
        props.nextPage,
        e,
        { nominee_details: selectedNomineeData },
        "add_nominee", selectedNomineeData
      );
    }
  }

  const handleSaveBtnClick = (e) => {
    let val = 0;
    setNomineeCheckBoxFlag();
    for (const i in selectedNomineeData) {
      val += Number(selectedNomineeData[i]["nominee_percentage"]);
    }
    setSelectedTotalNomineeShare(`You have entered nominee share  ${JSON.stringify(val)} %.`);
    if (val != 100 && val != 0) {
      setShowModal(true);
    } else if (val == 0) {
      props.handleSaveDetails({ nomineeDetails: [] });
    } else {
      setShowModal(false);
      props.handleSaveDetails({ nomineeDetails: selectedNomineeData });
    }
  }

  const getNomineeDetails = (nomineeCard, id, isValid) => {
    const nomineeData = [...selectedNomineeData];
    const validateData = [...isValidData];
    if (validateData.length) {
      const validateIndex = validateData.findIndex(data => data.id === id);
      if (validateIndex !== -1) {
        validateData[validateIndex].isValid = isValid;
      } else {
        validateData.push({ id: id, isValid: isValid })
      }
      setIsValidData(validateData);
    } else {
      setIsValidData([...isValidData, { id: id, isValid: isValid }]);
    }

    const index = nomineeData.findIndex(nominee => nominee.id === id);
    if (index !== -1 && nomineeData[index]) {
      if (nomineeData[index]) {
        Object.keys(nomineeData[index]).forEach(key => {
          nomineeData[index][key] = nomineeCard[key];
          if (key.includes("date") && nomineeCard[key]) {
            nomineeData[index][key] = nomineeDateFormat(nomineeCard[key]);
          }
        });
        if (nomineeData[index].sameAddress === undefined) {
          nomineeData[index].sameAddress = nomineeCard.sameAddress;
        }
      }

      nomineeData[index].id = id;
      setSelectedNomineeData(nomineeData);
    }
  }

  const getManufacturerDetails = () => {
    setIsDisabled(true);
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    const manufacturerProfile = appConfig?.deploy?.baseUrl + appConfig?.deploy?.manufacturerProfile + selectedManufactureId;
    GetApiHandler(manufacturerProfile, "GET").then(
      (response) => {
        setIsDisabled(false);
        if (response?.data?.data) {
          const { manufacturerProperties: { isNomineeRequired }, onboardingMode: { nomineeDescriptionText, nomineeConsentText } } = response.data.data;
          if (isNomineeRequired !== undefined) {
            setIsNomineeRequired(isNomineeRequired);
            if (nomineeDescriptionText || nomineeConsentText) {
              setNomineeDescAndConsent({
                consent: nomineeConsentText || "",
                description: nomineeDescriptionText || ""
              });
            }
          }
        }
      }
    );
  }

  const handleBackBtnClick = (e) => {
    setNomineeCheckBoxFlag();
    props.handle(
      props.prevPage,
      e,
      { nominee_details: selectedNomineeData },
      true
    );
  }

  const toggleOptionNominee = (id) => {
    if (selectedNomineeIds.includes(id)) {
      removeSelectedNominee(id);
    } else {
      if (selectedNomineeData.length < maxNominee) {
        setSelectedNomineeIds([...selectedNomineeIds, id]);
        addSelectedNominee(id);
      } else {
        setapiErrorMessage(MAX_SELECT_MESSAGE);
        setShowErrorModal(true);
      }
    }
  };

  const addSelectedNominee = (id) => {
    const addNominee = nomineeData.filter((data) => data.id === id);
    if (addNominee.length) {
      const addNomineeData = [...selectedNomineeData, addNominee[0]];
      setSelectedNomineeData(addNomineeData);
    }
  }

  const removeSelectedNominee = (id) => {
    setSelectedNomineeIds(selectedNomineeIds.filter(
      (item) => item !== id
    ));
    setSelectedNomineeData(selectedNomineeData.filter(
      (data) => data.id !== id
    ));
    setIsValidData(isValidData.filter((data) => data.id !== id));
  }

  const addNewNominee = () => {
    if (selectedNomineeData.length < maxNominee) {
      setSelectedNomineeData([
        ...selectedNomineeData,
        {
          id: uuidv4(),
          user_id: "",
          nominee_title: "",
          nominee_first_name: "",
          nominee_middle_name: "",
          nominee_last_name: "",
          nominee_relation: "",
          nominee_date_of_birth: "",
          nominee_percentage: 100,
          nominee_pan_number: "",
          nominee_guardian_first_name: "",
          nominee_guardian_middle_name: "",
          nominee_guardian_last_name: "",
          nominee_guardian_pan_number: "",
          nominee_guardian_date_of_birth: "",
          nominee_guardian_relation: "",
          nominee_guardian_relationship: "",
          nominee_address_line1: "",
          nominee_address_line2: "",
          nominee_pincode: "",
          nominee_city: "",
          nominee_state: "",
          nominee_country: "",
          sameAddress: false,
          is_nominee_minor: false,
        },
      ]);
    }
    else {
      setapiErrorMessage(MAX_NOMINEE_LIMIT_MESSAGE);
      setShowErrorModal(true);
    }
  }

  const fetchNomineeDetails = () => {
    const selectedUserId = sessionStorage.getItem("selectedUserId")
    const baseUrl = appConfig?.deploy?.baseUrl;
    const getNominee = appConfig?.deploy?.getNominee;
    const userIdSegment = selectedUserId ? selectedUserId : "";
    const url = `${baseUrl}${getNominee}${userIdSegment}`;
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    setIsDisabled(true);

    GetApiHandler(url, "GET")
      .then((response) => {
        const { data } = response;
        setIsDisabled(false);
        if (selectedManufactureId?.toUpperCase() === "USFB") {
          const nomineeDetails = [...data.data];
          nomineeDetails.forEach(detail => {
            detail.nominee_percentage = 100;
          });

          nomineeDetails && setNomineeData(nomineeDetails);
        } else {
          data?.data && setNomineeData(data.data);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }

  const getNomineeData = () => {
    const selectedPan = sessionStorage.getItem("selectedPan");

    if (selectedPan) {
      const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
      if (familyDetails?.payload?.investorDetails) {
        const investorDetails = familyDetails.payload.investorDetails.find(details => details.customerInformation.customerPan === selectedPan);
        if (investorDetails?.nomineeDetails?.length) {
          setNomineeData(investorDetails.nomineeDetails);
        } else {
          fetchNomineeDetails();
        }
      }
    } else {
      fetchNomineeDetails();
    }
  }

  const setNomineeCheckBoxFlag = () => {
    if (selectedNomineeData.length === 0) {
      sessionStorage.setItem("nomineeCheckbox", JSON.stringify({ addNomineeFlag: false }));
    } else {
      sessionStorage.setItem("nomineeCheckbox", JSON.stringify({ addNomineeFlag: addNomineeFlag }));
    }
  }

  const getNomineeCheckBoxFlag = () => {
    const nomineeCheckbox = JSON.parse(sessionStorage.getItem("nomineeCheckbox"));
    if (nomineeCheckbox?.addNomineeFlag) {
      setAddNomineeFlag(nomineeCheckbox.addNomineeFlag);
    } else {
      setAddNomineeFlag(false);
    }
  }

  useEffect(() => {
    if (nomineeData.length) {
      setNomineeDropdownData(populateNomineesDropdown(nomineeData));
    }
  }, [nomineeData]);

  useEffect(() => {
    let disable = false;

    // Check if there are invalid data entries
    const hasErrors = isValidData.some(data => !data.isValid);
    if (hasErrors) disable = true;


    // Check nominee consent conditions
    if (consent && !nomineeConsent && !addNomineeFlag) {
      disable = true;
    }

    // Check if nominee is required and none are selected
    if (isNomineeRequired && !selectedNomineeData.length) {
      disable = true;
    }
    setIsDisabled(disable);
  }, [
    isValidData,
    addNomineeFlag,
    nomineeData,
    consent,
    nomineeConsent,
    isNomineeRequired,
    selectedNomineeData
  ]);


  useEffect(()=>{
    if (addNomineeFlag) {
      if (!nomineeData.length) {
        setIsDisabled(true);
      } else if (!selectedNomineeData.length) {
        setIsDisabled(true);
      }
    }
    else if(!addNomineeFlag)
      {
        selectedNomineeData.length = 0;
        selectedNomineeIds.length = 0;
      }
  },[
    addNomineeFlag,
  ])
  
  useEffect(() => {
    isNomineeRequired && setAddNomineeFlag(isNomineeRequired);
  }, [isNomineeRequired]);

  useEffect(() => {
    getNomineeData();
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    setSelectedManufactureId(selectedManufactureId)
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const maxNomineeCount = sessionStorage.getItem("MaxNominee");
    maxNomineeCount && setMaxNominee(parseInt(maxNomineeCount));
    getNomineeCheckBoxFlag();
    getManufacturerDetails();
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
    if (productData) {
      const { nominee_details, CkycApiData } = productData;

      if (CkycApiData && Object.keys(CkycApiData).length) {
        const { pan_number } = CkycApiData["PERSONAL DETAILS"];
        setUserPanNumber(pan_number);
      }
      if (nominee_details?.length) {
        setSelectedNomineeData(nominee_details);
      }

      if (props.isOnboardingUser) {
        // const getNomineeDetails = () => {
        //   const nomineeDetails = [];

        //   if (props.componentData?.length) {
        //     props.componentData.forEach(nominee => {
        //       const editedNominee = {}

        //       Object.keys(nomineeMapping).forEach((value) => {
        //         if (value.includes("date")) {
        //           editedNominee[value] = dd_mm_yyyy_format(nominee[nomineeMapping[value]]);
        //         } else {
        //           editedNominee[value] = nominee[nomineeMapping[value]];
        //         }
        //       });
        //       nomineeDetails.push(editedNominee);
        //     })
        //   }

        //   return nomineeDetails;
        // }
        // const nomineeData = getNomineeDetails();
        props.componentData && setSelectedNomineeData(props.componentData);
      }
    }
  }, []);

  useEffect(() => {
    const MOUSE_UP = "mouseup";
    const handleOutsideClick = (event) => {
      if (
        event.target !== ref.current &&
        !ref.current?.contains(event.target) &&
        event.target.localName !== "li"
      ) {
        setOutsideClick(true);
      }
    };
    document.addEventListener(MOUSE_UP, handleOutsideClick);

    return () => document.removeEventListener(MOUSE_UP, handleOutsideClick);
  });

  useEffect(() => {
    if (props?.journeyData && Object.keys(props?.journeyData).length) {
      const { journeyData: { payload } } = props;
      const payloadData = payload ? payload : {};
      const nominee_data = [];
      Object.keys(payloadData).length && Object.keys(payloadData).forEach((key) => {
        nominee_data.push(payloadData[key]);

      });
      if (nominee_data.length) {
        const selectedNomineeLocal = [];
        nominee_data.forEach((data) => {
          data.id && selectedNomineeLocal.push(data.id);
        })
        setSelectedNomineeIds(selectedNomineeLocal);
        setSelectedNomineeData(nominee_data);
      }
    }
  }, [props]);

  return (
    <div className={`${props.isOnboardingUser ? "h-full" : "h-full "}`}>
      <div className="flex flex-col">
        <div className="text-medium text-6xl mb-2 text-black">{translate(FD_RENEWAL.nomination)} {isNomineeRequired && <span >*</span>}</div>
        <div className={`text-regular text-xl mb-5 text-subcontent ${props.isOnboardingUser ? "w-[550px] text-black" : "text-black"} ${styles.details_container}`}>
          { selectedManufactureId?.toLowerCase() != "sib"  ? translate(FD_RENEWAL.enterNomineeDetailsMFS) : null}
        </div>
        {
          description ? <div className={`text-regular text-xl mb-5 text-subcontent ${props.isOnboardingUser ? "w-[550px] text-black" : "text-black"} ${styles.details_container}`}>
            {description}
          </div> : null
        }
      </div>
      <ErrorModal canShow={showErrorModal} updateModalState={toggleErrorModal} errorMessage={apiErrorMessage} />
      <NominationPopUp
        canShow={showModal}
        updateModalState={toggleModal}
        errorMessage={selectedTotalNomineeShare}
      />
      <div className="mt-3 flex gap-3 items-center">
        <input
          id="flexCheckChecked"
          onChange={(e) => {
            setIsConsentEnabled(e.target.checked)
            setAddNomineeFlag(e.target.checked)
          }}
          className="accent-primary-green h-4 w-4 hover:cursor-pointer"
          type="checkbox"
          checked={addNomineeFlag}
          defaultChecked={addNomineeFlag}
          disabled={isAddNomineeEnabled}
        />
        <label
          className="hover:cursor-pointer text-regular text-xl inline-block text-black"
          htmlFor="flexCheckChecked"
        >
          {translate(FD_RENEWAL.addNominee)}
        </label>
      </div>
      {addNomineeFlag ? (
        <div className="flex flex-row pt-4 gap-3">
          {nomineeDropdownData.length ?
            <NomineeMultiSelectDropdown
              options={nomineeDropdownData}
              selected={selectedNomineeIds}
              toggleOption={toggleOptionNominee}
              shouldShowDropDown={outsideClick}
              getOutsideClick={getOutsideClick}
              name={translate(FD_RENEWAL.chooseNominee)}
              ref={ref}
            /> : null}
          <button
            onClick={addNewNominee}
            className="flex gap-2 content-end bg-dark-gray text-lg items-center p-2 rounded"
            disabled={selectedNomineeData.length === maxNominee}
          >
            <AiOutlinePlusCircle
              className="text-black"
            />
            
            <span className="text-bold text-2xl text-black">{translate(FD_RENEWAL.addNew)}</span>
          </button>
        </div>
      ) : null}
      {addNomineeFlag && selectedNomineeData.length
        ? selectedNomineeData.map((nominee, index) => {
          return (
            <NomineeCard
              key={nominee["id"] + 1}
              index={index}
              isSelectedFromDropdown={nomineeDropdownData.filter(data => data.id === nominee.id).length === 1}
              nominee={nominee}
              userPanNumber={userPanNumber}
              removeSelectedNominee={removeSelectedNominee}
              addNewNominee={addNewNominee}
              getNomineeDetails={getNomineeDetails}
              toggleLoading={toggleLoading}
            />
          );
        })
        : null}
      {
        consent ? <div className={`my-3 flex items-start gap-3 ${styles.details_container}`}>
          <div>
            <input
              type="checkbox"
              className="accent-primary-green h-4 w-4 hover:cursor-pointer"
              checked={nomineeConsent}
              onChange={(e) => {
                setNomineeConsent(e.target.checked)
                setIsAddNomineeEnabled(e.target.checked)

              }}
              name="declarationCheck"
              disabled={isConsentEnabled}
            />
          </div>
          <div className="text-regular text-xl text-black">
            {consent}
          </div>
        </div> : null
      }
      {
        selectedNomineeData.length && (selectedManufactureId?.toLowerCase() === "bajaj" || selectedManufactureId?.toLowerCase() === "shriram") ? <div className={`my-3 flex items-start gap-3 ${styles.details_container}`}>
          <div className="form-check mb-3 flex gap-3">
            <div className="text-regular text-xl  w-full text-slate-900">
              {/* {translate(PERSONAL_DETAILS.taxResidency)} */}
              {translate(`Do you want the nominee's name to be mentioned in the FD receipt? (Yes/No)`)}
            </div>
            <label className="relative inline-flex cursor-pointer text-black">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked={nomineeNamePrint}
                name="nomineeNamePrint"
                value={nomineeNamePrint}
                role="switch"
                checked={nomineeNamePrint}
                onChange={(e) => setNomineeNamePrint(prevState => !prevState)}
              />
              <div className="w-9 h-5 bg-blue-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:accent-primary-green dark:peer-focus:accent-primary-green rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[5px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-green"></div>
            </label>
            <div className="text-regular text-xl  text-slate-900">{nomineeNamePrint ? "YES" : "NO"}</div>

          </div>
        </div> : null
      }
      {props.isOnboardingUser ? (
        <div className="flex justify-center mt-7 gap-5">
          <button
            className={(isDisabled) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
            onClick={handleSaveBtnClick}
            // onClick={() =>
            //   props.handleSaveDetails({ nominee_details: selectedNomineeData })
            // }
            disabled={isDisabled}
          >
            {translate(ADDRESS_DETAILS.save)}
          </button>
          <button className="button-passive border-fd-primary text-fd-primary" onClick={props.handleClose}>
            {translate(ADDRESS_DETAILS.close)}
          </button>
        </div>
      ) :
        (<div className="flex justify-start mt-7 gap-5">
          <button
            className="block button-passive border-fd-primary text-fd-primary"
            onClick={handleBackBtnClick}
          >
            {translate(BUTTON_NAME.back)}
          </button>
          <button
            className={(isDisabled || loading || (addNomineeFlag && selectedNomineeData.length==0)) ? "block button-active  button-transition  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit" : "block button-active  button-transition btn-gradient text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit"}
            onClick={handleContinueBtnClick}
            disabled={isDisabled || loading || (addNomineeFlag && selectedNomineeData.length==0)}
          >
            {translate(COMMON_CONSTANTS.continueLabel)}
          </button>
        </div>)}
    </div>
  );
}

export default AddNominee;
