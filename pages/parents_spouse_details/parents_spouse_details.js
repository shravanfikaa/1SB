import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from 'yup';
import styles from '../../styles/parents_spouse_details.module.css';
import { charInput, handleEventLogger, trimText,isMobile } from "../../lib/util";
import appConfig from "../../app.config";
import { ADDRESS_DETAILS, AGENT, COMMON_CONSTANTS, PARENT_DETAILS_PAYMENT, VALIDATION_CONSTANT } from "../../constants";
import { useTranslation } from "react-i18next";
import { handleInput } from "../../lib/util";

function ParentsSpouseDetails(props) {
  const [parentSpouseData, setParentSpouseData] = useState({});
  const [showSpouseDetails, setShowSpouseDetails] = useState(false);
  const [shouldEnableBtn, setShouldEnableBtn] = useState(false);
  const [isFatherNameSelected, setIsFatherNameSelected] = useState({
    fatherFirstName: false,
    fatherMiddleName: false,
    fatherLastName: false,
  });

  const [isMotherNameSelected, setIsMotherNameSelected] = useState({
    motherFirstName: false,
    motherMiddleName: false,
    motherLastName: false,
  });
  const [isSpouseNameSelected, setIsSpouseNameSelected] = useState({
    spouseFirstName: false,
    spouseMiddleName: false,
    spouseLastName: false,
  });
  const [selectedManufactureId, setSelectedManufactureId] = useState("");
  const [selectedUserId,setSelectedUserId]= useState("");
   const [familyDetails,setFamilyDetails]= useState("");
  const { distributorId } = appConfig;
  const { t: translate } = useTranslation();

  const initialValues = {
    fatherFirstName: "",
    fatherMiddleName: "",
    fatherLastName: "",
    motherFirstName: "",
    motherMiddleName: "",
    motherLastName: "",
    spouseFirstName: "",
    spouseMiddleName: "",
    spouseLastName: "",
  }
  const validationSchema = yup.object({
    spouseFirstName: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.validSpouseFirstName)),
    spouseMiddleName: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.validSpouseMiddleName)),
    spouseLastName: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.validSpouseLastName)),
    fatherLastName: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.validFatherLastName)),
    motherLastName: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.validMotherLastName)),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
    validateOnChange: true
  });

  const { values, errors, setFieldValue, handleChange } = formik;

  const handleBackBtnClick = (e) => {
    const selectedUserId = sessionStorage.getItem("selectedUserId");
    if (selectedUserId) {
      const data = { parents_spouse_details: {} };
      data.parents_spouse_details[selectedUserId] = values;
      data.parents_spouse_details = { ...data.parents_spouse_details, ...values };
      props.handle(props.prevPage, e, data, true);
    } else {
      props.handle(props.prevPage, e, {
        parents_spouse_details: values,
      }, true);
    }
  }

  const handleContinueBtnClick = (e) => {
    handleEventLogger("parents_spouse_details", "buttonClick", "Invest_Click", {
      action: "Parents_Spouse_Details_Completed",
      Screen_Name: "Parent_Spouse page",
      Platform:isMobile()
    });
    const selectedUserId = sessionStorage.getItem("selectedUserId");
    if (selectedUserId) {
      const data = { parents_spouse_details: {} };
      data.parents_spouse_details[selectedUserId] = values;
      data.parents_spouse_details = { ...data.parents_spouse_details, ...values }
      props.handle(props.nextPage, e, data, true);
    } else {
      props.handle(props.nextPage, e, {
        parents_spouse_details: values,
      }, true);
    }
  }

  const handleInputChange = (e, filedName) => {
    const filteredText = charInput(e.target.value);
    setFieldValue(filedName, filteredText);
  }

  const getEnableFields = () => {
    const investorDetails = JSON.parse(sessionStorage.getItem("investorDetails"));
    if (investorDetails) {
      return investorDetails?.isFamilyHead;
    } else {
      return true;
    }
  }

  useEffect(() => {
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    let enteredDetails = {};
    if (parentSpouseData) {
      const selectedUserId = sessionStorage.getItem("selectedUserId");
      const id = sessionStorage[productIdLocal];
      if (id) {
        const { parents_spouse_details } = JSON.parse(id);
        if (parents_spouse_details && Object.keys(parents_spouse_details).length) {
          if (selectedUserId) {
            if (parents_spouse_details[selectedUserId])
              enteredDetails = { ...parents_spouse_details[selectedUserId] };
          } else {
            enteredDetails = { ...parents_spouse_details };
          }
        }
      }
    }

    if (Object.keys(parentSpouseData).length) {
      const { "Father Details": fatherDetails,
        "Mother Details": motherDetails,
        "Spouse Details": spouseDetails,
      } = parentSpouseData;
      if (Object.keys(enteredDetails).length) {
        const { fatherFirstName, fatherMiddleName, fatherLastName } = enteredDetails;
        fatherFirstName && setFieldValue("fatherFirstName", fatherFirstName);
        fatherMiddleName && setFieldValue("fatherMiddleName", fatherMiddleName);
        fatherLastName && setFieldValue("fatherLastName", fatherLastName);
      } else {
        if (fatherDetails) {
          const { "Frist Name": firstName, "Middle Name": middleName, "Last Name": lastName } = fatherDetails;
          firstName && setFieldValue("fatherFirstName", firstName);
          middleName && setFieldValue("fatherMiddleName", middleName);
          lastName && setFieldValue("fatherLastName", lastName);
        }
      }
      if (Object.keys(enteredDetails).length) {
        const { motherFirstName, motherLastName, motherMiddleName } = enteredDetails;
        motherFirstName && setFieldValue("motherFirstName", motherFirstName);
        motherMiddleName && setFieldValue("motherMiddleName", motherMiddleName);
        motherLastName && setFieldValue("motherLastName", motherLastName);
      } else {
        if (motherDetails) {
          const { "Frist Name": firstName, "Middle Name": middleName, "Last Name": lastName } = motherDetails;
          firstName && setFieldValue("motherFirstName", firstName);
          middleName && setFieldValue("motherMiddleName", middleName);
          lastName && setFieldValue("motherLastName", lastName);
        }
      }
      if (Object.keys(enteredDetails).length) {
        const { spouseFirstName, spouseMiddleName, spouseLastName } = enteredDetails;
        spouseFirstName && setFieldValue("spouseFirstName", spouseFirstName);
        spouseMiddleName && setFieldValue("spouseMiddleName", spouseMiddleName);
        spouseLastName && setFieldValue("spouseLastName", spouseLastName);
      } else {
        if (spouseDetails) {
          const { "Frist Name": firstName, "Middle Name": middleName, "Last Name": lastName } = spouseDetails;
          if (firstName || middleName || lastName) {
            firstName && setFieldValue("spouseFirstName", firstName);
            middleName && setFieldValue("spouseMiddleName", middleName);
            lastName && setFieldValue("spouseLastName", lastName);
          }
        }
      }
    }
  }, [parentSpouseData]);

  useEffect(() => {
    if (familyDetails && selectedUserId) {
      console.log("famili",familyDetails)
      const investorDetails = familyDetails?.payload?.investorDetails.filter((investor) => investor.userId == Number(selectedUserId));
      if (investorDetails.length) {
        const { fatherFirstName, fatherLastName, fatherMiddleName, motherFirstName,motherLastName,motherMiddleName,spouseFirstName,spouseLastName,spouseMiddleName } = investorDetails[0].parentsSpouseDetail;
        console.log("customerPan", fatherFirstName, fatherLastName, fatherMiddleName, motherFirstName,motherLastName,motherMiddleName,spouseFirstName,spouseLastName,spouseMiddleName)
        fatherFirstName ? setFieldValue('fatherFirstName', fatherFirstName) : setFieldValue('fatherFirstName', "");
        fatherLastName ? setFieldValue('fatherLastName', fatherLastName) : setFieldValue('fatherLastName', "");
        fatherMiddleName ? setFieldValue('fatherMiddleName', fatherMiddleName) : setFieldValue('fatherMiddleName', "");
        motherFirstName ? setFieldValue('motherFirstName', motherFirstName) : setFieldValue('motherFirstName', "");
        motherLastName ? setFieldValue('motherLastName', motherLastName) : setFieldValue('motherLastName', "");
        motherMiddleName ? setFieldValue('motherMiddleName', motherMiddleName) : setFieldValue('motherMiddleName', "");
        spouseFirstName ? setFieldValue('spouseFirstName', spouseFirstName) : setFieldValue('spouseFirstName', "");
        spouseLastName ? setFieldValue('spouseLastName', spouseLastName) : setFieldValue('spouseLastName', "");
        spouseMiddleName ? setFieldValue('spouseMiddleName', spouseMiddleName) : setFieldValue('spouseMiddleName', ""); 
      }
    }
  }, [selectedUserId]);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      if(sessionStorage.getItem("selectedUserId")){
           setSelectedUserId(sessionStorage.getItem("selectedUserId"));
         setFamilyDetails(JSON.parse(sessionStorage.getItem("familyDetails")))

      }
      const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
      setSelectedManufactureId(selectedManufactureId);
      const productIdLocal = sessionStorage.getItem("selectedProductId");
      if (props.isOnboardingUser) {
        props?.componentData?.maritalStatus === "married" ? setShowSpouseDetails(true) : setShowSpouseDetails(false);

        props.componentData && Object.keys(props.componentData).forEach((key) => {
          setFieldValue(key, props.componentData[key]);
        });
      } else {
        if (productIdLocal && sessionStorage[productIdLocal]) {
          const { CkycApiData, basic_details, parents_spouse_details } = JSON.parse(sessionStorage[productIdLocal]);
          if (basic_details) {
            const { MaritalStatus } = basic_details;
            MaritalStatus === "Married" && setShowSpouseDetails(true);
          }
          if (CkycApiData) {
            const { "PARENT & SPOUSE DETAILS": ckycParentSpouseData } = CkycApiData;
            setParentSpouseData(ckycParentSpouseData);
          } else if (parents_spouse_details) {
            parents_spouse_details && Object.keys(parents_spouse_details)?.forEach((key) => {
              setFieldValue(key, parents_spouse_details[key]);
            });
          }
        }
      }

      const validateCustomerInfo = sessionStorage.getItem("validateCustomerInfo");
      const shouldEnableFields = getEnableFields();
      if (validateCustomerInfo && shouldEnableFields) {
        const { responseFlags } = JSON.parse(validateCustomerInfo);
        if (responseFlags) {
          const { fatherSpouseFirstName,
            fatherSpouseFlag,
            fatherSpouseFullName,
            fatherSpouseLastName,
            fatherSpouseMiddleName,
            motherFirstname,
            motherFullName,
            motherLastName,
            motherMiddlename,
          } = responseFlags;
          if (!fatherSpouseFlag) {
            setIsFatherNameSelected({
              fatherFirstName: fatherSpouseFirstName,
              fatherMiddleName: fatherSpouseMiddleName,
              fatherLastName: fatherSpouseLastName,
            });
          } else {
            setIsSpouseNameSelected({
              spouseFirstName: fatherSpouseFirstName,
              spouseMiddleName: fatherSpouseMiddleName,
              spouseLastName: fatherSpouseLastName,
            });
          }
          setIsMotherNameSelected({
            motherFirstName: motherFirstname,
            motherMiddleName: motherMiddlename,
            motherLastName: motherLastName,
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    if (selectedManufactureId?.toUpperCase() === "PNBHFC") {
      setShouldEnableBtn(false);
    } else {
      if (values.fatherFirstName !== "" &&
        values.motherFirstName !== "" &&
        values.fatherLastName !== "" &&
        values.motherLastName !== "") {
        setShouldEnableBtn(false);
      } else {
        setShouldEnableBtn(true);
      }
    }
    // else if (distributorId?.toLowerCase() === "tipson") {
    //   if (values.fatherFirstName === "" ||
    //     values.motherFirstName === "" ||
    //     values.fatherLastName === "" ||
    //     values.motherLastName === "") {
    //     setShouldEnableBtn(true);
    //   } else {
    //     setShouldEnableBtn(false);
    //   }
    // } else {
    //   setShouldEnableBtn(false);
    // }
  }, [values])

  useEffect(() => {
    if (props?.journeyData && Object.keys(props?.journeyData).length) {
      const { journeyData: { payload } } = props;
      const payloadData = payload ? payload : {};
      Object.keys(payloadData).length && Object.keys(payloadData).forEach((key) => {
        setFieldValue(key, payloadData[key]);
      })
    }
  }, [props]);

  return (
    <div>
      <div className="text-medium text-6xl  text-black">
        {translate(PARENT_DETAILS_PAYMENT.parentSpouseDetails)}
      </div>
      <div className="text-regular text-xl mb-5 text-subcontent">
        {translate(PARENT_DETAILS_PAYMENT.enterParentSpouseName)}
      </div>
      <div className={`flex gap-5 flex-wrap ${styles.details_container}`}>
        <div className="text-regular text-2xl text-light-gray mb-3 w-full">
          <div className="mb-3">{translate(PARENT_DETAILS_PAYMENT.fathersName)}</div>
          <label className={`flex gap-2 rounded input-field w-full ${styles.status_container}`}>
            <input
              className={isFatherNameSelected?.fatherFirstName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
              placeholder={
                selectedManufactureId?.toLowerCase() !== "pnbhfc" ?
                  `${translate(AGENT.firstName)} *` : `${translate(AGENT.firstName)}`
              }
              onInput={handleInput}
              name="fatherFirstName"
              onChange={(e) => { handleInputChange(e, "fatherFirstName") }}
              value={values.fatherFirstName}
              disabled={isFatherNameSelected?.fatherFirstName}
              maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 18 : 30}
            />
            <input
              className={isFatherNameSelected?.fatherMiddleName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
              placeholder={`/${translate(AGENT.middleName)}`}
              onInput={handleInput}
              name="fatherMiddleName"
              onChange={(e) => { handleInputChange(e, "fatherMiddleName") }}
              value={values.fatherMiddleName}
              disabled={isFatherNameSelected?.fatherMiddleName}
              maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 14 : 30}
            />
            <input
              className={isFatherNameSelected?.fatherLastName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
              placeholder={
                selectedManufactureId?.toLowerCase() !== "pnbhfc" ?
                  `/ ${translate(AGENT.lastName)} *` : `/ ${translate(AGENT.lastName)}`
              }
              onInput={handleInput}
              name="fatherLastName"
              onChange={(e) => { handleInputChange(e, "fatherLastName") }}
              value={values.fatherLastName}
              disabled={isFatherNameSelected?.fatherLastName}
              maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 18 : 30}
            />
          </label>
        </div>
        <div className="text-regular text-2xl text-light-gray mb-3 w-full">
          <div className="mb-3">{translate(PARENT_DETAILS_PAYMENT.mothersName)}</div>
          <label className={`flex gap-2 rounded input-field w-full ${styles.status_container}`}>
            <input
              className={isMotherNameSelected?.motherFirstName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
              placeholder={
                selectedManufactureId?.toLowerCase() !== "pnbhfc" ?
                  `${translate(AGENT.firstName)} *` : translate(AGENT.firstName)
              }
              onInput={handleInput}
              name="motherFirstName"
              onChange={(e) => { handleInputChange(e, "motherFirstName") }}
              value={values.motherFirstName}
              disabled={isMotherNameSelected?.motherFirstName}
              maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 18 : 30}
            />
            <input
              className={isMotherNameSelected?.motherMiddleName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
              placeholder={`/${translate(AGENT.middleName)}`}
              onInput={handleInput}
              name="motherMiddleName"
              onChange={(e) => { handleInputChange(e, "motherMiddleName") }}
              value={values.motherMiddleName}
              disabled={isMotherNameSelected?.motherMiddleName}
              maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 14 : 30}
            />
            <input
              className={isMotherNameSelected?.motherLastName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
              placeholder={
                selectedManufactureId?.toLowerCase() !== "pnbhfc" ?
                  `/ ${translate(AGENT.lastName)} *` : `/ ${translate(AGENT.lastName)}`
              }
              onInput={handleInput}
              name="motherLastName"
              onChange={(e) => { handleInputChange(e, "motherLastName") }}
              value={values.motherLastName}
              disabled={isMotherNameSelected?.motherLastName}
              maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 18 : 30}
            />
          </label>
        </div>
        {
          showSpouseDetails &&
          <div className="text-regular text-2xl text-light-gray mb-3 w-full">
            <div className="mb-3">{translate(PARENT_DETAILS_PAYMENT.spousesName)}</div>
            <label className={`flex gap-2 rounded input-field w-full ${styles.status_container}`}>
              <input
                className={isSpouseNameSelected.spouseFirstName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
                placeholder={`${translate(AGENT.firstName)}`}
                onInput={handleInput}
                disabled={isSpouseNameSelected.spouseFirstName}
                name="spouseFirstName"
                value={values.spouseFirstName}
                onChange={(e) => { handleInputChange(e, "spouseFirstName") }}
                maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 18 : 30}
              />
              <input
                className={isSpouseNameSelected.spouseMiddleName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
                placeholder={`/${translate(AGENT.middleName)}`}
                onInput={handleInput}
                disabled={isSpouseNameSelected.spouseMiddleName}
                name="spouseMiddleName"
                value={values.spouseMiddleName}
                onChange={(e) => { handleInputChange(e, "spouseMiddleName") }}
                maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 14 : 30}
              />
              <input
                className={isSpouseNameSelected.spouseLastName ? "text-black bg-neutral-200 p-1 cursor-not-allowed" : "text-black p-2 border rounded w-full"}
                placeholder={`/ ${translate(AGENT.lastName)}`}
                onInput={handleInput}
                disabled={isSpouseNameSelected.spouseLastName}
                name="spouseLastName"
                value={values.spouseLastName}
                onChange={(e) => { handleInputChange(e, "spouseLastName") }}
                maxLength={selectedManufactureId?.toLowerCase() === "usfb" ? 18 : 30}
              />
            </label>
            <div>
              {errors.spouseFirstName ? (
                <div className="text-base text-light-red m-[3px]">
                  {errors.spouseFirstName}
                </div>
              ) : null}
              {errors.spouseMiddleName ? (
                <div className="text-base text-light-red m-[3px]">
                  {errors.spouseMiddleName}
                </div>
              ) : null}
              {errors.spouseLastName ? (
                <div className="text-base text-light-red m-[3px]">
                  {errors.spouseLastName}
                </div>
              ) : null}
            </div>
          </div>
        }
      </div>
      {props.isOnboardingUser ? (
        <div className="flex justify-center mt-7 gap-5">
          <button
            className={(!formik.isValid) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
            onClick={() =>
              props.handleSaveDetails({
                parentsSpouseDetail: values
              })
            }
            disabled={!formik.isValid}
          >
            {translate(ADDRESS_DETAILS.save)}
          </button>
          <button className="button-passive border-fd-primary text-fd-primary" onClick={props.handleClose}>
            {translate(ADDRESS_DETAILS.close)}
          </button>
        </div>
      ) :
        <div className="flex justify-start mt-7 gap-5">
          <button
            className="button-passive border-fd-primary text-fd-primary"
            onClick={handleBackBtnClick}
            disabled={!formik.isValid}
          >
            {translate(ADDRESS_DETAILS.back)}
          </button>
          <button
            className= {(shouldEnableBtn) ? "button-active  button-transition  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " : "button-active  button-transition btn-gradient text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "}
            onClick={handleContinueBtnClick}
            disabled={shouldEnableBtn}
          >
            {translate(COMMON_CONSTANTS.continueLabel)}
          </button>
        </div>}
    </div>
  );
}

export default ParentsSpouseDetails;
