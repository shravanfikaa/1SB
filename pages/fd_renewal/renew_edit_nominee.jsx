import { AiOutlinePlusCircle } from "react-icons/ai";
import { populateNomineesDropdown } from "../../lib/add_nominee_utils";
import { useEffect, useState, useRef } from "react";
import appConfig from "../../app.config";
import { GetApiHandler } from "../api/apihandler";
import { getLocalStorageData } from "../../lib/review_utils";
import { nomineeDateFormat } from "../../lib/util";
import NomineeCard from "../nomination/nominee_card";
import { v4 as uuidv4 } from "uuid";
import { ADDRESS_DETAILS, COMMON_CONSTANTS, FD_RENEWAL, MAX_NOMINEE_LIMIT_MESSAGE } from "../../constants";
import NomineeMultiSelectDropdown from "../nomination/nominee_multiSelectDropDown";
import NominationPopUp from "../nomination/nomination_popup";
import { IoMdClose } from "react-icons/io";
import ErrorModal from "../common/errorPopup";
import { useTranslation } from "react-i18next";

function FDRenewAddEditNominee(props) {
  const [nomineeData, setNomineeData] = useState([]);
  const [selectedNomineeIds, setSelectedNomineeIds] = useState([]);
  const [selectedTotalNomineeShare, setSelectedTotalNomineeShare] =
    useState("");
  const [addNomineeFlag, setAddNomineeFlag] = useState(false);
  const [nomineeDropdownData, setNomineeDropdownData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedNomineeData, setSelectedNomineeData] = useState([]);
  const [maxNominee, setMaxNominee] = useState(5);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isValidData, setIsValidData] = useState([]);
  const [userPanNumber, setUserPanNumber] = useState("");
  const [nomineeLocalStorageData, setNomineeLocalStorageData] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiErrorMessage, setapiErrorMessage] = useState("");
  const [outsideClick, setOutsideClick] = useState(false);
  const {t:translate} = useTranslation();
  const ref = useRef(null);

  const getOutsideClick = () => {
    setOutsideClick(false);
  };

  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const toggleModal = () => setShowModal((state) => !state);
  function cancelHandler() {
    props.closeNomineeModal(false);
  }
  const componentName = "nominee_details";
  const handleContinueBtnClick = () => {
    let val = 0;
    setNomineeCheckBoxFlag();
    for (const i in selectedNomineeData) {
      val += Number(selectedNomineeData[i]["nominee_percentage"]);
    }
    setSelectedTotalNomineeShare(
      `You have entered nominee share  ${JSON.stringify(val)} %.`
    );
    if (val != 100 && val != 0) {
      setShowModal(true);
    } else if (val == 0) {
      props.getDataFromInvestAndNominee(componentName, selectedNomineeData);
      cancelHandler();
    } else {
      setShowModal(false);
      props.getDataFromInvestAndNominee(componentName, selectedNomineeData);
      cancelHandler();
    }
  };
  const getNomineeDetails = (nomineeCard, id, isValid) => {
    const nomineeData = [...selectedNomineeData];
    const validateData = [...isValidData];
    if (validateData.length) {
      const validateIndex = validateData.findIndex((data) => data.id === id);
      if (validateIndex !== -1) {
        validateData[validateIndex].isValid = isValid;
      } else {
        validateData.push({ id: id, isValid: isValid });
      }
      setIsValidData(validateData);
    } else {
      setIsValidData([...isValidData, { id: id, isValid: isValid }]);
    }

    const index = nomineeData.findIndex((nominee) => nominee.id === id);
    if (index !== -1 && nomineeData[index]) {
      if (nomineeData[index]) {
        Object.keys(nomineeData[index]).forEach((key) => {
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
  };

  const toggleOptionNominee = (id) => {
    if (selectedNomineeIds.includes(id)) {
      removeSelectedNominee(id);
    } else {
      if (selectedNomineeData.length < maxNominee) {
        setSelectedNomineeIds([...selectedNomineeIds, id]);
        addSelectedNominee(id);
      }
    }
  };

  const addSelectedNominee = (id) => {
    const addNominee = nomineeData.filter((data) => data.id === id);
    if (addNominee.length) {
      const addNomineeData = [...selectedNomineeData, addNominee[0]];
      setSelectedNomineeData(addNomineeData);
    }
  };

  const removeSelectedNominee = (id) => {
    props.getAddEditNomineeData.forEach((propsitem) => {
      nomineeData.forEach((item) => {
        if (
          propsitem.nominee_pan_number === item.nominee_pan_number &&
          propsitem.nominee_first_name === item.nominee_first_name
        ) {
          if (selectedNomineeIds.includes(id) && !propsitem.id === id) {
            setSelectedNomineeIds(
              selectedNomineeIds.filter((filterId) => filterId !== id)
            );
            setSelectedNomineeData(
              selectedNomineeData.filter((data) => data.id !== propsitem.id)
            );
          } else if (propsitem.id !== id && item.id !== id) {
            setSelectedNomineeIds(
              selectedNomineeIds.filter((item) => item !== id)
            );
            setSelectedNomineeData(
              selectedNomineeData.filter((data) => data.id !== id)
            );
          } else {
            setSelectedNomineeIds(
              selectedNomineeIds.filter((filterId) => filterId !== item.id)
            );
            setSelectedNomineeData(
              selectedNomineeData.filter((data) => data.id !== propsitem.id)
            );
          }
        }
      });
    });
    setIsValidData(isValidData.filter((data) => data.id !== id));
  };

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
          nominee_percentage: "",
          nominee_pan_number: "",
          nominee_guardian_first_name: "",
          nominee_guardian_middle_name: "",
          nominee_guardian_last_name: "",
          nominee_guardian_pan_number: "",
          nominee_guardian_date_of_birth: "",
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
    } else {
      setapiErrorMessage(MAX_NOMINEE_LIMIT_MESSAGE);
      setShowErrorModal(true);
    }
  };

  const getNomineeData = () => {
    
    const selectedUserId = sessionStorage.getItem("selectedUserId")
    const baseUrl = appConfig?.deploy?.baseUrl;
    const getNominee = appConfig?.deploy?.getNominee;
    const userIdSegment = selectedUserId ? selectedUserId : "";
    const url = `${baseUrl}${getNominee}${userIdSegment}`;
    GetApiHandler(url, "GET")
      .then((response) => {
        const { data } = response;
        data?.data && setNomineeData(data.data);
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };
  const setNomineeCheckBoxFlag = () => {
    if (props.nominee) {
      sessionStorage.setItem(
        "nomineeCheckbox",
        JSON.stringify({ addNomineeFlag: true })
      );
    }
  };

  const getNomineeCheckBoxFlag = () => {
    const nomineeCheckbox = JSON.parse(
      sessionStorage.getItem("nomineeCheckbox")
    );
    if (nomineeCheckbox?.addNomineeFlag) {
      setAddNomineeFlag(nomineeCheckbox.addNomineeFlag);
    } else {
      setAddNomineeFlag(false);
    }
  };

  useEffect(() => {
    const isErrors = isValidData.filter((data) => !data.isValid).length;
    isErrors ? setIsDisabled(true) : setIsDisabled(false);
  }, [isValidData]);

  useEffect(() => {
    if (nomineeData.length) {
      setNomineeDropdownData(populateNomineesDropdown(nomineeData));
    }
  }, [nomineeData]);

  useEffect(() => {
    if (addNomineeFlag && !nomineeData.length) {
      getNomineeData();
    }
  }, [addNomineeFlag]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const maxNomineeCount = sessionStorage.getItem("MaxNominee");
    maxNomineeCount && setMaxNominee(parseInt(maxNomineeCount));
    getNomineeCheckBoxFlag();
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
    if (productData) {
      const { CkycApiData } = productData;
      if (CkycApiData) {
        setUserPanNumber(props.userPanNumber);
      }
    }

    setNomineeLocalStorageData(
      JSON.parse(sessionStorage.getItem("renewalData")).nominee_details.length
    );
  }, []);

  useEffect(() => {
    getNomineeCheckBoxFlag();
    const dataLocal = props.nominee;
    if (dataLocal && dataLocal.length) {
      const selectedNomineeLocal = [];
      dataLocal.forEach((data) => {
        data.id && selectedNomineeLocal.push(data.id);
      });
      setSelectedNomineeData(dataLocal);
    }
  }, [props.nominee]);

  function getLocalStorage(componentName) {
    if (componentName == undefined) {
      return {};
    }
    if (typeof window !== "undefined") {
      try {
        setNomineeLocalStorageData(
          JSON.parse(sessionStorage.getItem("renewalData")).nominee_details
            .length
        );
        return JSON.parse(sessionStorage.getItem("renewalData"));
      } catch (error) {
        console.log("Exception :", error);
        return {};
      }
    }
  }

  useEffect(() => {
    const renewalData = JSON.parse(sessionStorage.getItem("renewalData"));

    if (renewalData.nominee_details.length > 0) {
      let temp = getLocalStorage(componentName);
      setSelectedNomineeData(temp.nominee_details);
    }

    getNomineeCheckBoxFlag();
    setNomineeCheckBoxFlag();
    const dataLocal = JSON.parse(
      sessionStorage.getItem("renewalData")
    ).nominee_details;
    if (dataLocal.length) {
      const selectedNomineeLocal = [];
      dataLocal.forEach((data) => {
        data.id && selectedNomineeLocal.push(data.id);
      });
      setSelectedNomineeData(dataLocal);
    }
    setNomineeLocalStorageData(
      JSON.parse(sessionStorage.getItem("renewalData")).nominee_details.length
    );
  }, [nomineeLocalStorageData]);

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
    const selectedIndex = [];

    props.getAddEditNomineeData.forEach((propsitem) => {
      const idx = nomineeData.findIndex(
        (nomineeDataItem) =>
          nomineeDataItem.nominee_pan_number === propsitem.nominee_pan_number
      );
      selectedIndex.push(
        nomineeData && nomineeData[idx] && nomineeData[idx].id
      );
    });

    setSelectedNomineeIds(selectedIndex);
  }, [nomineeData, props.getAddEditNomineeData]);

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div
        className="fixed inset-0 h-auto bg-black opacity-25"
        onClick={cancelHandler}
      ></div>
      <ErrorModal
        canShow={showErrorModal}
        updateModalState={toggleErrorModal}
        errorMessage={apiErrorMessage}
      />
      <div className="flex justify-center items-center min-h-screen ">
        <div className={`relative w-min mx-3 bg-white rounded-md`}>
          <div className="p-4 h-full">
            <div className="flex flex-col justify-start w-auto text-left">
              <div className="flex justify-between">
                <div className="text-medium text-6xl  text-black">{translate(FD_RENEWAL.nomination)}</div>
                <div onClick={cancelHandler}>
                  <IoMdClose />
                </div>
              </div>
              <div className="text-regular text-xl mb-5 text-subcontent ">
                {translate(FD_RENEWAL.enterNomineeDetails)}
              </div>
            </div>
            <NominationPopUp
              canShow={showModal}
              updateModalState={toggleModal}
              errorMessage={selectedTotalNomineeShare}
            />
            <div className="mt-3 flex gap-3 items-center">
              <input
                id="flexCheckChecked"
                onChange={(e) => setAddNomineeFlag(e.target.checked)}
                className="h-5 w-5 border-2 border-primary-green rounded-lg accent-primary-green bg-white checked:bg-primary-green checked:border-primary-green focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer"
                type="checkbox"
                checked={addNomineeFlag}
                defaultChecked={addNomineeFlag}
              />
              <label
                className="hover:cursor-pointer text-regular text-2xl inline-block"
                htmlFor="flexCheckChecked"
              >
                     {translate(FD_RENEWAL.addNominee)}
              </label>
            </div>
            {addNomineeFlag ? (
              <div className="flex flex-row pt-4 gap-3">
                {nomineeDropdownData && nomineeDropdownData.length ? (
                  <>
                    <NomineeMultiSelectDropdown
                      options={nomineeDropdownData}
                      selected={selectedNomineeIds}
                      toggleOption={toggleOptionNominee}
                      shouldShowDropDown={outsideClick}
                      getOutsideClick={getOutsideClick}
                      name="Choose Nominee"
                      ref={ref}
                    />
                  </>
                ) : null}
                <button
                  onClick={addNewNominee}
                  className="flex gap-2 content-end text-lg items-center p-2 rounded"
                >
                  <AiOutlinePlusCircle className="text-fd-primary" />
                  <span className="text-bold text-2xl text-fd-primary">
              {translate(FD_RENEWAL.addNew)}
                  </span>
                </button>
              </div>
            ) : null}
            {selectedNomineeData.length
              ? selectedNomineeData.map((nominee, index) => {
                  return (
                    <NomineeCard
                      key={nominee["id"] + 1}
                      index={index}
                      isSelectedFromDropdown={
                        nomineeDropdownData.filter(
                          (data) => data.title === nominee.nominee_first_name
                        ).length === 1
                      }
                      nominee={nominee}
                      userPanNumber={userPanNumber}
                      removeSelectedNominee={removeSelectedNominee}
                      addNewNominee={addNewNominee}
                      getNomineeDetails={getNomineeDetails}
                    />
                  );
                })
              : null}
            <div className="flex justify-center mt-7 gap-5">
              <button
                className="block button-passive border-fd-primary text-fd-primary"
                onClick={cancelHandler}
              >
                {translate(COMMON_CONSTANTS.cancel)}
              </button>
              <button
                className= {(isDisabled) ? "block button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "block button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" }
                onClick={handleContinueBtnClick}
                disabled={isDisabled}
              >
                {translate(ADDRESS_DETAILS.save)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FDRenewAddEditNominee;
