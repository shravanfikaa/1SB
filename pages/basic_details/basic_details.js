import { useState, useEffect } from "react";
import Skeleton from 'react-loading-skeleton';
import { useFormik } from "formik";
import { MARITAL_STATUS, BUTTON_NAME, imageURL, COMMON_CONSTANTS, AGENT, BASIC_DETAILS, FD_RENEWAL, VALIDATION_CONSTANT } from "../../constants";
import styles from '../../styles/customer_personal_details.module.css';
import { useRouter } from "next/router";
import { charInputWithSpace, getFullName, getUserType, handleEventLogger, isMobile } from "../../lib/util";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { FaUserAlt } from "react-icons/fa";

function BasicDetails(props) {
  const router = useRouter();
  const [basicDetails, setBasicDetails] = useState({ MaritalStatus: "", gender: "" });
  const [userProfileImage, setUserProfileImage] = useState("");
  const [personalDetails, setPersonalDetails] = useState();
  const [isUserTypeRM, setIsUserTypeRM] = useState(false);
  const [kycMode, setKycMode] = useState({});
  const [panNumber, setPanNumber] = useState("");
  const { t: translate } = useTranslation();

  const [selectedManufactureId, setSelectedManufactureId] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
      setSelectedManufactureId(selectedManufactureId)
    }
  }, [])
  const createSchema = (isCondition) => {
    // Define a base schema object
    let schemaData = yup.object();

    // If condition is true, add 'placeOfBirth' to the schema
    if (isCondition) {
      schemaData = schemaData.shape({
        placeOfBirth: yup
          .string()
          .min(3, translate(VALIDATION_CONSTANT.minThreeChar)) // Assuming translate is a translation function
          .required("Place of Birth is required"),
      });
    }

    // Return the schema (with or without placeOfBirth based on isCondition)
    return schemaData;
  };

  const validationSchema = createSchema(kycMode?.custInfoSource === "NTB" && selectedManufactureId?.toLowerCase() === "usfb");

  const formik = useFormik({
    initialValues: {
      married: false,
      unmarried: false,
      gender: "",
      placeOfBirth: ""
    },
    validationSchema
  });

  const { values, touched, errors, handleChange, setFieldValue } = formik;

  const handleMaritalStatusChange = (status) => {
    if (status === "married") {
      setFieldValue("married", true);
      setFieldValue("unmarried", false);
    } else {
      setFieldValue("married", false);
      setFieldValue("unmarried", true);
    }
  }

  const handleInputChange = (e, filedName) => {
    const filteredText = charInputWithSpace(e.target.value);
    setFieldValue(filedName, filteredText);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const role = getUserType();

    const productIdLocal = sessionStorage.getItem("selectedProductId");
    const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
    if (productData) {
      const { CkycApiData } = productData;
      if (CkycApiData && Object.keys(CkycApiData).length) {
        const { "PERSONAL DETAILS": personalData, pidData } = CkycApiData;
        if (personalData) {
          const { FirstName, MiddleName, LastName, pan_number } = personalData;
          const fullName = getFullName(FirstName, MiddleName, LastName);
          setPersonalDetails({ ...personalData, fullName: fullName });
          setPanNumber(pan_number);
        }
        if (pidData) {
          const { personalDetails } = pidData;
          if (personalDetails) {
            personalDetails?.gender ? (personalDetails?.gender === "M" || personalDetails?.gender.toLowerCase() === "male") ? setFieldValue("gender", "Male") : setFieldValue("gender", "Female") : "";
          }
          const { fname, mname, lname, fullname } = personalDetails;
          if (fullname) {
            setPersonalDetails({ ...personalData, fullName: fullname?.toLowerCase() });
          } else {
            const fullName = getFullName(fname, mname, lname);
            setPersonalDetails({ ...personalData, fullName: fullName?.toLowerCase() });
          }
        }
      }
    }

    const { basic_details } = productData ? productData : router.query;

    if (basic_details) {
      const { MaritalStatus, gender, placeOfBirth } = basic_details
      if (MaritalStatus) {
        if (MaritalStatus.toLowerCase() === "married")
          setFieldValue("married", true);
        else {
          setFieldValue("unmarried", true);
        }
      }
      gender && setFieldValue("gender", gender);
      placeOfBirth && setFieldValue("placeOfBirth", placeOfBirth);
    }

    const imageData = sessionStorage.getItem("imageData");
    imageData ?
      setUserProfileImage("data:image/png;base64," + imageData) :
      setUserProfileImage(imageURL.profilePicURL);

    if (role === "user") {
      setIsUserTypeRM(false);
    } else {
      setIsUserTypeRM(true);
      const rmCustomerData = JSON.parse(sessionStorage.getItem('rm_customer_data'));
      if (rmCustomerData && Object.keys(rmCustomerData).length) {
        rmCustomerData?.profile_image ? setUserProfileImage(`data:image/png;base64, ${rmCustomerData?.profile_image}`) : setUserProfileImage(null);
        const { first_name, last_name, middle_name } = rmCustomerData;
        const fullName = getFullName(first_name, middle_name, last_name)
        // const fullName = first_name + " " + last_name;
        setPersonalDetails({ ...personalDetails, fullName: fullName });
      }
    }

    const kycModeDetails = sessionStorage.getItem("kycMode");
    if (kycModeDetails) {
      setKycMode(JSON.parse(kycModeDetails));
    }
  }, []);

  useEffect(() => {
    if (values.married) {
      setBasicDetails({
        MaritalStatus: "Married",
        gender: values.gender,
        placeOfBirth: values.placeOfBirth
      })
    }
    else if (values.unmarried) {
      setBasicDetails({
        MaritalStatus: "Unmarried",
        gender: values.gender,
        placeOfBirth: values.placeOfBirth
      })
    }
  }, [values]);

  const handleBackButtonClick = () => {
    props.handle(props.prevPage, {}, { basic_details: basicDetails })
  }

  const handleContinueButtonClick = () => {
    handleEventLogger("basic_details", "buttonClick", "Invest_Click", {
      action: "Basic_Details_Completed",
      Screen_Name: "Basic Details page",
      Marital_Status: basicDetails.MaritalStatus,
      Platform: isMobile()
    });
    props.handle(props.nextPage, {}, { basic_details: basicDetails }, "basic_details", values)
  }

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
    <div >
      <div className="text-medium text-black text-3xl ">
        {translate(BASIC_DETAILS.basicDetails)}
      </div>
      <div className="text-regular text-xl mb-5 text-subcontent">
        {translate(BASIC_DETAILS.fdDetails)}
      </div>
      <div className="flex items-start flex-wrap gap-3 w-full lg:flex-nowrap mb-3 gap-3">
      
        {
          userProfileImage ? <img
            src={userProfileImage}
            alt="avatar"
            className="border-2 border-blue rounded-md  object-contain w-[10%] h-[auto]"
          /> :
            <FaUserAlt className="text-fd-primary" size={50} />
        }
       
        <div>
          <div className="flex flex-col w-full">
            <div className="text-regular text-2xl text-light-gray">
              {
                selectedManufactureId.toLowerCase() === "sib" ?
                  translate(FD_RENEWAL.nameAsPerAdhar) :
                  ""
              }
            </div>
            <div>
              {personalDetails?.fullName ? (
                <div className="flex text-black justify-start text-medium text-6xl capitalize">
                  {personalDetails.fullName}
                </div>
              ) : (
                <Skeleton width={200} />
              )}
            </div>
          </div>
          {
            selectedManufactureId.toLowerCase() === "pnbhfc" ? <div className="flex items-center mb-5 text-regular text-xl text-light-gray w-full">
              {BASIC_DETAILS.pnbNote}
            </div> : null
          }
        </div>
      </div>

      <div className="container">
        <div>
          <div className="text-regular text-2xl text-light-gray mb-3">{translate(FD_RENEWAL.maritalStatus)} <span className="text-red-50">*</span></div>
          <div className={`text-regular text-2xl text-light-gray mb-3 flex gap-3 ${styles.status_container}`}>
            {Object.keys(MARITAL_STATUS).map((statusName, index) => {
              return (
                <div
                  key={`${statusName + index}`}
                  className="border border-gray-300 text-black  p-3 rounded flex gap-2 items-center w-max"
                >
                  <input
                    type="radio"
                    onChange={(e) =>
                      handleMaritalStatusChange(statusName)
                    }
                    checked={values[statusName]}
                    value={values[statusName]}
                    name={statusName}
                    className="w-5 h-5 "
                  />
                  <label
                    className="align-top "
                    htmlFor={MARITAL_STATUS[statusName]}
                  >
                    {translate(MARITAL_STATUS[statusName])}
                  </label>
                </div>
              );
            })}
          </div>
          {kycMode?.custInfoSource === "NTB" || selectedManufactureId?.toLowerCase() === "sib" || selectedManufactureId?.toLowerCase() === "shriram" ? <>
            <div className="text-regular text-2xl text-light-gray mb-3">{translate(AGENT.gender)}</div>
            <div className={`text-regular text-2xl text-light-gray mb-3 flex gap-3 ${styles.status_container}`}>
              <div
                className="border border-gray-300 text-black  p-3 rounded flex gap-2 items-center w-max"
              >
                <input
                  type="radio"
                  onChange={handleChange}
                  value={"Male"}
                  name="gender"
                  checked={values.gender === "Male"}
                  className="w-5 h-5 "
                  disabled={selectedManufactureId?.toLowerCase() === "sib" && personalDetails?.gender ? true : false}
                />
                <label
                  className="align-top "
                  htmlFor={"gender"}
                >
                  {"Male"}
                </label>
              </div>
              <div
                className="border border-gray-300 text-black  p-3 rounded flex gap-2 items-center w-max"
              >
                <input
                  type="radio"
                  onChange={handleChange}
                  value={"Female"}
                  name="gender"
                  checked={values.gender === "Female"}
                  className="w-5 h-5 "
                  disabled={selectedManufactureId?.toLowerCase() === "sib" && personalDetails?.gender ? true : false}
                />
                <label
                  className="align-top "
                  htmlFor={"gender"}
                >
                  {"Female"}
                </label>
              </div>
            </div>
            {(kycMode?.custInfoSource === "NTB" && selectedManufactureId?.toLowerCase() === "usfb") && <div
              className={`text-regular text-2xl text-light-gray mb-3 ${styles.details_container}`}
            >
              <input
                type="text"
                className={"h-12 input-field text-black w-full"}
                placeholder="Place of Birth *"
                value={values.placeOfBirth}
                name="placeOfBirth"
                onChange={(e) => { handleInputChange(e, "placeOfBirth") }}
              />
              <div className="mb-3">
                {touched.placeOfBirth || errors.placeOfBirth ? (
                  <span className="text-base text-light-red">
                    {errors.placeOfBirth}
                  </span>
                ) : null}
              </div>
            </div>}
          </> : null}
        </div>
        <div className="flex justify-start mt-7 gap-5">
          {!isUserTypeRM ? <button
            className="button-passive border-fd-primary text-fd-primary"
            onClick={handleBackButtonClick}
          >
            {translate(BUTTON_NAME.back)}
          </button> : null}
          <button
            className={(!(values.married || values.unmarried) || Object.keys(errors).length) ? "button-active  button-transition  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " : "button-active  button-transition  btn-gradient text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "}
            onClick={handleContinueButtonClick}
            disabled={!(values.married || values.unmarried) || Object.keys(errors).length}
          >
            {translate(COMMON_CONSTANTS.continueLabel)}
          </button>
        </div>
      </div>
    </div >
  );
}

export default BasicDetails;