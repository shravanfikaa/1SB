import { useFormik } from "formik";
import * as yup from "yup";
import { RxCrossCircled } from "react-icons/rx";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import React, { useEffect, useState } from "react";
import appConfig from "../../app.config";
import {
  charInput,
  charWithNumberInput,
  getCustomerAddressDetails,
  numberInput,
  handleInput,
  handleInputAddress,
  getJourneyType
} from "../../lib/util";
import { GetApiHandler } from "../api/apihandler";
import { calculateAge } from "../../lib/util";
import { ADDRESS_DETAILS, AGENT, MONTHS, MY_PROFILE, NOMINEE_RELATION, FD_RENEWAL, VALIDATION_CONSTANT, REDIRECTION_MSG, COMMON_CONSTANTS } from "../../constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/nomination.module.css";
import { useTranslation } from "react-i18next";

function NomineeCard({
  index,
  nominee,
  userPanNumber,
  addNewNominee,
  getNomineeDetails,
  removeSelectedNominee,
  isSelectedFromDropdown,
  toggleLoading
}) {

  const years = range(getYear(new Date()) - 101, getYear(new Date()) + 1, 1);
  const [pinCodeLoading, setPinCodeLoading] = useState(false);
  const [nomineeRelation, setNomineeRelation] = useState([]);
  const [guardianRelation, setGardianRelation] = useState([]);
  const [manufacturerId, setManufacturerId] = useState("");
  const [isNomineePanReq, setIsNomineePanReq] = useState(true);
  const [isFamilyMember, setIsFamilyMember] = useState(false);
  const [touch, setTouch] = useState(false);
  const { t: translate } = useTranslation();
  const [showSameAddress, setShowSameAddress] = useState(false);

  const initialValues = {
    user_id: "",
    nominee_title: "",
    nominee_guardian_title: "",
    nominee_first_name: "",
    nominee_middle_name: "",
    nominee_last_name: "",
    nominee_relation: "",
    nominee_guardian_relationship: "",
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
  };

  const validationSchema = yup.object().shape({
    nominee_guardian_date_of_birth: yup.date().nullable().test(
      "Is guardian minor",
      translate(VALIDATION_CONSTANT.invalidGardianDOB),
      (value) => {
        if (!value) return true;
        const age = calculateAge(value);
        if (age < 18) {
          return false;
        } else {
          return true;
        }
      }
    ).required(""),
    nominee_date_of_birth: yup
      .date()
      .nullable()
      .when([], {
        is: () => manufacturerId?.toLowerCase() === 'pnbhfc', // Condition to apply the validation
        then: yup.date()
          .test(
            "Is guardian minor",
            translate(VALIDATION_CONSTANT.invalidNomineeDOB),
            (value) => {
              if (!value) return true;
              const age = calculateAge(value);
              if (age < 18) {
                return false;
              } else {
                return true;
              }
            }
          )
          .required(""),
        otherwise: yup.date().nullable(),
      }),

    nominee_first_name: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.enterValidnomineeFN))
      .required(""),
    nominee_middle_name: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.enterValidnomineeMN)),
    nominee_last_name: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.enterValidnomineeLN))
      .required(""),
    nominee_relation: yup.string().required(""),
    nominee_guardian_relationship: yup.string().required(""),
    nominee_guardian_first_name: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.enterValidGuardianFN))
      .required(""),
    nominee_guardian_middle_name: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.enterValidGuardianMN)),
    nominee_guardian_last_name: yup
      .string()
      .matches(/^[a-zA-Z]+$/, translate(VALIDATION_CONSTANT.enterValidGuardianLN))
      .required(""),
    nominee_pan_number: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.invalidPAN))
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, translate(VALIDATION_CONSTANT.invalidPAN))
      .test(
        "Is pan details same as user",
        translate(VALIDATION_CONSTANT.nomineePanError),
        (value) => {
          if (userPanNumber !== "" && value !== "") {
            if (userPanNumber === value) {
              return false;
            }
          }
          return true;
        }
      )
      .when("isRequired", {
        is: () => {
          if (calculateAge(values.nominee_date_of_birth) < 18) {
            setIsNomineePanReq(false);
            return false

          }
          const { distributorId } = appConfig;
          if (distributorId?.toLowerCase() === "tipson") {
            setIsNomineePanReq(false);
            return false;
          } else {
            if (manufacturerId?.toLowerCase() === "usfb" || manufacturerId?.toLowerCase() === "unity") {
              setIsNomineePanReq(false);
              return false;
            } else {
              setIsNomineePanReq(true);
              return true;
            }
          }
          return true;
        },
        then: yup.string().required(""),
        otherwise: yup.string().notRequired(),
      }),
    nominee_guardian_pan_number: yup
  .string()
  .when('is_nominee_minor', {
    is: true,
    then: (schema) =>
      schema
        .required(translate(VALIDATION_CONSTANT.guardianPANRequired))
        .max(10, translate(VALIDATION_CONSTANT.guardianPANError))
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, translate(VALIDATION_CONSTANT.guardianPANError))
        .test(
          "Is pan details same as nominee",
          translate(VALIDATION_CONSTANT.guardianPANError),
          function (value) {
            const { nominee_pan_number } = this.parent;
            if (nominee_pan_number && value) {
              return nominee_pan_number !== value;
            }
            return true;
          }
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
   nominee_percentage: yup
  .string()
  .matches(
    /^(100(\.0{1,2})?|([1-9]?[0-9])(\.[0-9]{1,2})?|0?\.[1-9][0-9]?)$/,
    translate(VALIDATION_CONSTANT.nomineeShareError)
  )
  .test(
    "is-valid-percentage",
    translate(VALIDATION_CONSTANT.nomineeShareError),
    (value) => {
      if (!value) return true;
      const numeric = parseFloat(value);
      return numeric >= 0.01 && numeric <= 100;
    }
  )
  .when("isRequired", {
    is: true,
    then: yup.string().required(translate(VALIDATION_CONSTANT.required)),
    otherwise: yup.string().notRequired(),
  }),
    nominee_pincode: yup
      ?.string()
      .matches(/^[1-9][0-9]{5}$/, translate(VALIDATION_CONSTANT.nomineePINError))
      .min(6, translate(VALIDATION_CONSTANT.nomineePINError))
      .test("Is pin code valid", translate(REDIRECTION_MSG.InvalidZIPcode), (value) => {
        if (value?.length === 6 && values.nominee_city === null) {
          return false;
        } else {
          return true;
        }
      })
      .required(""),
    nominee_address_line1: yup.string().required(""),
    nominee_address_line2: yup.string(),
    combinedLength: yup
      .string()
      .test(
        "min-length-combined",
        translate(VALIDATION_CONSTANT.commbineLengthError),
        function () {
          const { nominee_address_line1, nominee_address_line2 } = this.parent;
          return (nominee_address_line1?.length || 0) + (nominee_address_line2?.length || 0) >= 15;
        }
      ),
  invester_nominee_name_different: yup.string().test("invester_nominee_name_different",
  translate(VALIDATION_CONSTANT.nomineeAndInvesterNameShouldNotMatch),
 function () {
    if (manufacturerId?.toLowerCase() !== "unity") return true;

    const { nominee_first_name, nominee_middle_name, nominee_last_name} = this.parent;
    let userInfo={};
 if (typeof window !== 'undefined') {
    if (sessionStorage.getItem("userInfo")) {
       userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    }}
   let nomineeFull ="";
    let investerFull = "";

    if(nominee_middle_name === undefined || nominee_middle_name === ''){
        nomineeFull = `${nominee_first_name}${nominee_last_name}`.toLowerCase().replace(/\s/g, "");
        let user = userInfo.customer_name.split(" ");

  // Remove the second part of the name (middle name or second name)
         user.splice(1, 1);

  // Join the remaining parts of the name and make it lowercase, then remove spaces
    investerFull = user.join('').toLowerCase().replace(/\s/g, "");
      
    }
    else{
          nomineeFull = `${nominee_first_name}${nominee_middle_name}${nominee_last_name}`.toLowerCase().replace(/\s/g, "");
   
          investerFull = `${userInfo.customer_name}`.toLowerCase().replace(/\s/g, "");
    }
   

    return nomineeFull !== investerFull;
  }
),    
  guardian_nominee_name_different: yup.string().test("guardian-nominee-name-different",
  translate(VALIDATION_CONSTANT.nomineeAndGuardianNameShouldNotMatch),
  function () {
    if (manufacturerId?.toLowerCase() !== "unity") return true;
     let userInfo={};
      if (typeof window !== 'undefined') {
    if (sessionStorage.getItem("userInfo")) {
       userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    }}

    const { nominee_first_name, nominee_middle_name, nominee_last_name, nominee_guardian_first_name, nominee_guardian_middle_name = "", nominee_guardian_last_name } = this.parent;
     
       let nomineeFull ="";
       let guardianFull = "";

    if(nominee_middle_name === undefined || nominee_middle_name === "" ){
        nomineeFull = `${nominee_first_name}${nominee_last_name}`.toLowerCase().replace(/\s/g, "");
        let user = userInfo.customer_name.split(" ");

  // Remove the second part of the name (middle name or second name)
         user.splice(1, 1);

  // Join the remaining parts of the name and make it lowercase, then remove spaces
     guardianFull = `${nominee_guardian_first_name}${nominee_guardian_last_name}`.toLowerCase().replace(/\s/g, "");
      
    }
    else{
          nomineeFull = `${nominee_first_name}${nominee_middle_name}${nominee_last_name}`.toLowerCase().replace(/\s/g, "");
   
         guardianFull = `${nominee_guardian_first_name}${nominee_guardian_middle_name}${nominee_guardian_last_name}`.toLowerCase().replace(/\s/g, "");
    }
    return nomineeFull !== guardianFull;
  }
)
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
  });

  const { values, errors, isValid, setFieldValue, handleChange } = formik;

  const getZipCodeDetails = (pinCode) => {
    toggleLoading(true);
    const url =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.zipCode + pinCode;
    setPinCodeLoading(true);
    GetApiHandler(url, "GET")
      .then((response) => {
        toggleLoading(false);
        if (response.data && response.data.data) {
          const { city, state, country } = response.data.data;
          setFieldValue("nominee_city", city);
          setFieldValue("nominee_state", state);
          setFieldValue("nominee_country", country);
        }
      })
      .finally(() => setPinCodeLoading(false));
  };

  const handleAddressCheckboxClick = (e) => {
    setFieldValue("sameAddress", e.target.checked);
    if (e.target.checked) {
      const { permanent_address1, permanent_zip, permanent_city, permanent_state, permanent_country } =
        getCustomerAddressDetails();
      setFieldValue("nominee_address_line1", permanent_address1);
      setFieldValue("nominee_address_line2", "");
      setFieldValue("nominee_pincode", permanent_zip);
      setFieldValue("nominee_city", permanent_city);
      setFieldValue("nominee_state", permanent_state);
      setFieldValue("nominee_country", permanent_country);
    } else {
      setFieldValue("nominee_address_line1", "");
      setFieldValue("nominee_address_line2", "");
      setFieldValue("nominee_pincode", "");
      setFieldValue("nominee_city", "");
      setFieldValue("nominee_state", "");
      setFieldValue("nominee_country", "");
    }
  };

  const handleInputChange = (e, filedName) => {
    const filteredText = charInput(e.target.value);
    setFieldValue(filedName, filteredText);
  };

  useEffect(() => {
    const { nominee_address_line1, nominee_pincode, sameAddress } = values;
    const { permanent_address1, permanent_zip } = getCustomerAddressDetails();
    if (nominee_address_line1 && nominee_pincode) {
      if (
        nominee_address_line1 === permanent_address1 &&
        nominee_pincode === permanent_zip
      ) {
        sameAddress && setFieldValue("sameAddress", true);
      }
    }
  }, [values.nominee_address_line1, values?.nominee_pincode]);

  useEffect(() => {
    if (values?.nominee_pincode?.length === 6 && !values.sameAddress) {
      getZipCodeDetails(values?.nominee_pincode);
    }
    if (values?.nominee_pincode === "") {
      setFieldValue("nominee_city", "");
      setFieldValue("nominee_state", "");
      setFieldValue("nominee_country", "");
    }
  }, [values?.nominee_pincode,nominee["nominee_pincode"]]);

  useEffect(() => {
    formik.validateField("nominee_pincode");
  }, [values.nominee_city]);

  useEffect(() => {
    if (!values.nominee_percentage && !nominee?.nominee_percentage) {
      setFieldValue("nominee_percentage", "100");
    }
  }, [values.nominee_percentage]);

  useEffect(() => {
    Object.keys(nominee).forEach((key) => {
      if (!key.includes("date")) {
        nominee[key] && setFieldValue(key, nominee[key]);
      } else {
        nominee[key] && setFieldValue(key, new Date(nominee[key]));
      }
    });
  }, [nominee]);

  useEffect(() => {
    const age = calculateAge(values.nominee_date_of_birth);
    if (values.nominee_date_of_birth) {
      if (age < 18) {
        setIsNomineePanReq(false)
        setFieldValue("is_nominee_minor", true);
      } else {
        setFieldValue("is_nominee_minor", false);
        Object.keys(values).forEach((value) => {
          if (value.includes("guardian")) {
            setFieldValue(value, "");
          }
        });
      }
    }
  }, [values.nominee_date_of_birth,nominee["nominee_date_of_birth"]]);

  useEffect(() => {
    const { nominee_relation } = values;
    const relationArr = ["daughter", "wife", "mother"];
    if (nominee_relation) {
      if (relationArr.includes(nominee_relation.toLocaleLowerCase())) {
        setFieldValue("nominee_title", "Ms");
      } else {
        setFieldValue("nominee_title", "Mr");
      }
    }
  }, [values.nominee_relation]);


  useEffect(() => {
    const { nominee_guardian_relationship } = values;
    const relationArr = ["daughter", "wife", "mother"];
    if (nominee_guardian_relationship) {
      if (relationArr.includes(nominee_guardian_relationship.toLocaleLowerCase())) {
        setFieldValue("nominee_title", "Ms");
      } else {
        setFieldValue("nominee_guardian_title", "Mr");
      }
    }
  }, [values.nominee_guardian_relationship]);

  useEffect(() => {
    const age = calculateAge(values.nominee_date_of_birth);
    if (values.nominee_date_of_birth && age >= 18) {
      getNomineeDetails(
        values,
        nominee.id,
        Object.keys(errors).filter((val) => val.includes("guardian")).length ===
        Object.keys(errors).length
      );
    } else {
      getNomineeDetails(values, nominee.id, isValid);
    }
  }, [values, errors]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const investorDetails = JSON.parse(sessionStorage.getItem("investorDetails"));
      if (investorDetails && !investorDetails?.isFamilyHead) {
        setIsFamilyMember(true);
      }
    }

    toggleLoading(true);
    const nomineeRelationURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.nomineeRelationship;

    if (typeof window !== 'undefined') {
      const manufacturerId = sessionStorage.getItem("selectedManufactureId");
      setManufacturerId(manufacturerId);
    }

    GetApiHandler(nomineeRelationURL, "GET").then((response) => {
      toggleLoading(false);
      if (response.data && response.data.data) {
        setNomineeRelation(response.data.data);
      }
    });
  }, []);

  useEffect(() => {

    if(manufacturerId.toLocaleLowerCase() === 'unity')
    {
         const { permanent_address1, permanent_zip, permanent_city, permanent_state, permanent_country } =
        getCustomerAddressDetails();
      if(permanent_address1 && permanent_zip && permanent_city && permanent_state && permanent_country)
      {
          setShowSameAddress(true)
      }
    }
   
    toggleLoading(true);
    const gardianRelationURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.gardianRelationship;
    GetApiHandler(gardianRelationURL, "GET").then((response) => {
      toggleLoading(false);
      if (response.data && response.data.data) {
        setGardianRelation(response.data.data)
      }
    })
  }, [])

  return (
    <div
      className={`flex flex-row w-auto text-regular text-2xl mt-5 ${styles.status_container}`}
    >
      <div className="page-background rounded-xl w-full">
        <div className="p-5 flex flex-col gap-3">
          {index !== undefined && (
            <div className="flex flex-row items-center justify-between mb-3">
              <div className="text-regular text-2xl text-black">{translate(AGENT.nomineeDetails1)}</div>
              <div className="flex justify-between gap-2">
                <button
                  className="text-rose-500 flex flex-row text-2xl h-5 h-fit"
                  onClick={(e) => removeSelectedNominee(nominee.id)}
                >
                  <RxCrossCircled className="text-red-700" />
                </button>
              </div>
            </div>
          )}
          <div>
            <label
              className={`flex gap-2 input-field w-fit  rounded p-4 bg-white w-full ${styles.status_container}`}
            >
              <input
                type="text"
                name="nominee_first_name"
                placeholder={`${translate(AGENT.firstName)}*`}
                onInput={handleInput}
                className={
                  isSelectedFromDropdown
                    ? "p-2 bg-dark-gray text-black rounded border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed rounded text-black"
                    : "p-2 text-black border w-full"
                }
                onChange={(e) => handleInputChange(e, "nominee_first_name")}

                value={values.nominee_first_name}
                disabled={isSelectedFromDropdown}
              />
              <input
                type="text"
                name="nominee_middle_name"
                className={
                  isSelectedFromDropdown
                    ? "p-2  text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed rounded text-black"
                    : "p-2 text-black border w-full"
                }
                onInput={handleInput}
                placeholder={`/${translate(AGENT.middleName)}`}
                onChange={(e) => handleInputChange(e, "nominee_middle_name")}
                value={values.nominee_middle_name}
                disabled={isSelectedFromDropdown}
              />
              <input
                type="text"
                name="nominee_last_name"
                className={
                  isSelectedFromDropdown
                    ? "p-2  text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed rounded text-black"
                    : "p-2 text-black border w-full"
                }
                placeholder={`/ ${translate(AGENT.lastName)} *`}
                onInput={handleInput}
                onChange={(e) => handleInputChange(e, "nominee_last_name")}
                value={values.nominee_last_name}
                disabled={isSelectedFromDropdown}
              />
            </label>
            {errors.nominee_first_name ? (
              <div className="text-base text-light-red">
                {errors.nominee_first_name}
              </div>
            ) : null}
            {errors.nominee_middle_name ? (
              <div className="text-base text-light-red">
                {errors.nominee_middle_name}
              </div>
            ) : null}
            {errors.invester_nominee_name_different ? (
              <div className="text-base text-light-red">
                {errors.invester_nominee_name_different}
              </div>
            ) : null}
            {errors.nominee_last_name ? (
              <div className="text-base text-light-red">
                {errors.nominee_last_name}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-5">
            <div className={`${styles.input_container} w-full flex gap-5`}>
              <div className={`${styles.details_container}`}>
                <select
                  placeholder={translate(MY_PROFILE.relationship + "*")}
                  className={
                    isSelectedFromDropdown
                      ? "bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  "
                      : "bg-white text-black rounded border-0 cursor-not-allowed w-full py-2 input-field text-2xl "
                  }
                  aria-label="Default select example"
                  name="nominee_relation"
                  onChange={handleChange}
                  value={values.nominee_relation}
                  disabled={isSelectedFromDropdown}
                  selected={values.nominee_relation}
                >
                  <option value="" disabled selected hidden>
                    {translate(MY_PROFILE.relationship)} *
                  </option>
                  {nomineeRelation?.length &&
                    nomineeRelation.map((item, i) => {
                      return (
                        <>
                          <option className="text-black capitalize">
                            {item}
                          </option>
                        </>
                      );
                    })}
                </select>
              </div>
              <div className={`${styles.details_container}`}>
                <DatePicker
                  placeholderText={translate(FD_RENEWAL.nomineeDob) + "*"}
                  defaultValue={values.nominee_date_of_birth}
                  disabled={isSelectedFromDropdown}
                  selected={values.nominee_date_of_birth}
                  maxDate={new Date()}
                  dateFormat={[
                    "dd-MMM-yyyy",
                    "dd-MM-yyyy",
                    "dd/MMM/yyyy",
                    "dd/MM/yyyy",
                  ]}
                  onSelect={(e) => setFieldValue("nominee_date_of_birth", e)}
                  onChange={(e) => setFieldValue("nominee_date_of_birth", e)}
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex justify-center">
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                      >
                        &nbsp;{"< "}&nbsp;
                      </button>
                      <select
                        value={MONTHS[getMonth(date)]}
                        onChange={({ target: { value } }) =>
                          changeMonth(MONTHS.indexOf(value))
                        }
                      >
                        {MONTHS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <select
                        value={getYear(date)}
                        onChange={({ target: { value } }) => changeYear(value)}
                      >
                        {years.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                      >
                        &nbsp; {" > "} &nbsp;
                      </button>
                    </div>
                  )}
                  className={
                    isSelectedFromDropdown
                      ? "bg-white text-black rounded border-0 cursor-not-allowed w-full py-2 input-field text-2xl "
                      : "bg-white text-black rounded border-0 cursor-not-allowed w-full py-2 input-field text-2xl "
                  }
                />
                {errors.nominee_date_of_birth ? (
                  <div className="text-base text-light-red m-[3px]">
                    {errors.nominee_date_of_birth}
                  </div>
                ) : null}
              </div>
            </div>
            {
              manufacturerId?.toLowerCase() !== "usfb" && manufacturerId?.toLowerCase() != "unity" ?
                <div className={`${styles.input_container} w-full flex gap-5`}>
                  <div className={`${styles.details_container}`}>
                    <input
                      type="text"
                      name="nominee_pan_number"
                      value={values.nominee_pan_number}
                      disabled={isSelectedFromDropdown && !(!nominee.nominee_pan_number)}
                      maxLength={10}
                      onChange={(e) => {
                        const filteredText = charWithNumberInput(e.target.value);
                        setFieldValue(
                          "nominee_pan_number",
                          filteredText.toUpperCase()
                        );
                      }}
                      className={
                        isSelectedFromDropdown && !(!nominee.nominee_pan_number)
                          ? "bg-white text-black rounded border-0 cursor-not-allowed w-full py-2 input-field text-2xl "
                          : "bg-white text-black rounded border-0 cursor-not-allowed w-full py-2 input-field text-2xl "
                      }
                      placeholder={
                        isNomineePanReq ? translate(FD_RENEWAL.nomineePan) + "*" : translate(FD_RENEWAL.nomineePan)
                      }
                    />
                    {errors.nominee_pan_number ? (
                      <div className="text-base text-light-red m-[3px]">
                        {errors.nominee_pan_number}
                      </div>
                    ) : null}
                  </div>
                { manufacturerId?.toLowerCase() != "unity" ?  <div className={`${styles.details_container}`}>
                    <label className="rt-input-input w-full">
                      <input
                        type="text"
                        name="nominee_percentage"
                        value={values.nominee_percentage}
                        onChange={(e) => {
                          const filteredText = numberInput(e.target.value);
                          setFieldValue("nominee_percentage", filteredText);
                        }}
                        className="bg-white text-black rounded border-0 cursor-not-allowed w-full py-2 input-field text-2xl "
                        placeholder={translate(AGENT.nomineeShare) + "*"}
                        maxLength={3}
                      />
                    </label>
                    {errors.nominee_percentage ? (
                      <div className="text-base text-light-red m-[3px]">
                        {errors.nominee_percentage}
                      </div>
                    ) : null}
                  </div> : null}
                </div>
                : null
            }
          </div>
          {values.is_nominee_minor ? (
            <>
              <div className={`flex flex-col gap-3`}>
                <label
                  className={`flex rounded gap-2 text-black  input-field w-full bg-white ${styles.status_container}`}
                >
                  <input
                    type="text"
                    name="nominee_guardian_first_name"
                    value={values.nominee_guardian_first_name}
                    disabled={isSelectedFromDropdown}
                    onChange={(e) =>
                      handleInputChange(e, "nominee_guardian_first_name")
                    }
                    className={
                      isSelectedFromDropdown
                        ? "bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed"
                        : "p-2"
                    }
                    placeholder={`${translate(COMMON_CONSTANTS.GuardianFirstName)}` + " " + "*"}
                    onInput={handleInput}
                  />
                  <input
                    type="text"
                    name="nominee_guardian_middle_name"
                    value={values.nominee_guardian_middle_name}
                    disabled={isSelectedFromDropdown}
                    onChange={(e) =>
                      handleInputChange(e, "nominee_guardian_middle_name")
                    }
                    className={
                      isSelectedFromDropdown
                        ? "bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed"
                        : "p-2"
                    }
                    placeholder={`/${translate(AGENT.middleName)}`}
                    onInput={handleInput}
                  />
                  <input
                    type="text"
                    name="nominee_guardian_last_name"
                    value={values.nominee_guardian_last_name}
                    disabled={isSelectedFromDropdown}
                    onChange={(e) =>
                      handleInputChange(e, "nominee_guardian_last_name")
                    }
                    className={
                      isSelectedFromDropdown
                        ? "bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed"
                        : "p-2"
                    }
                    placeholder={`/ ${translate(AGENT.lastName)} *`}
                  />
                </label>
                   
                   {errors.guardian_nominee_name_different ? (
              <div className="text-base text-light-red">
                {errors.guardian_nominee_name_different}
              </div>
            ) : null}
                {errors.nominee_guardian_first_name ? (
                  <div className="text-base text-light-red">
                    {errors.nominee_guardian_first_name}
                  </div>
                ) : null}
                {errors.nominee_guardian_middle_name ? (
                  <div className="text-base text-light-red">
                    {errors.nominee_guardian_middle_name}
                  </div>
                ) : null}
                {errors.nominee_guardian_last_name ? (
                  <div className="text-base text-light-red">
                    {errors.nominee_guardian_last_name}
                  </div>
                ) : null}
              </div>
              <div className={`${styles.input_container} w-full flex gap-5`}>
                {
                  manufacturerId?.toLowerCase() !== "usfb" ?
                    <div className={`${styles.details_container}`}>
                      <input
                        type="text"
                        name="nominee_guardian_pan_number"
                        value={values.nominee_guardian_pan_number}
                        maxLength={10}
                        disabled={isSelectedFromDropdown}
                        onChange={(e) => {
                          const filteredText = charWithNumberInput(e.target.value);
                          setFieldValue(
                            "nominee_guardian_pan_number",
                            filteredText.toUpperCase()
                          );
                        }}
                        className={
                          isSelectedFromDropdown
                            ? "w-full py-2 bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed input-field text-2xl border border-solid border-gray-300"
                            : "w-full py-2 input-field text-2xl border border-solid border-gray-300 text-black"
                        }
                        placeholder={translate(COMMON_CONSTANTS.GuardianPAN) + "*"}
                      />
                      {errors.nominee_guardian_pan_number ? (
                        <div className="text-base text-light-red m-[3px]">
                          {errors.nominee_guardian_pan_number}
                        </div>
                      ) : null}
                    </div> : null}
                <div className={`${styles.details_container}`}>
                  <DatePicker
                    placeholderText={translate(COMMON_CONSTANTS.GuardianDOB) + " " + "*"}
                    defaultValue={values.nominee_guardian_date_of_birth}
                    disabled={isSelectedFromDropdown}
                    selected={values.nominee_guardian_date_of_birth}
                    maxDate={new Date()}
                    dateFormat={[
                      "dd-MMM-yyyy",
                      "dd-MM-yyyy",
                      "dd/MMM/yyyy",
                      "dd/MM/yyyy",
                    ]}
                    onSelect={(e) =>
                      setFieldValue("nominee_guardian_date_of_birth", e)
                    }
                    onChange={(e) =>
                      setFieldValue("nominee_guardian_date_of_birth", e)
                    }
                    renderCustomHeader={({
                      date,
                      changeYear,
                      changeMonth,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div className="flex justify-center">
                        <button
                          onClick={decreaseMonth}
                          disabled={prevMonthButtonDisabled}
                        >
                          &nbsp;{"< "}&nbsp;
                        </button>
                        <select
                          value={MONTHS[getMonth(date)]}
                          onChange={({ target: { value } }) =>
                            changeMonth(MONTHS.indexOf(value))
                          }
                        >
                          {MONTHS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <select
                          value={getYear(date)}
                          onChange={({ target: { value } }) =>
                            changeYear(value)
                          }
                        >
                          {years.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={increaseMonth}
                          disabled={nextMonthButtonDisabled}
                        >
                          &nbsp; {" > "} &nbsp;
                        </button>
                      </div>
                    )}
                    className={
                      isSelectedFromDropdown
                        ? "bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed w-full py-2 input-field text-2xl border border-solid border-gray-300"
                        : "w-full py-2 input-field text-2xl border border-solid border-gray-300 text-black"
                    }
                  />
                  {errors.nominee_guardian_date_of_birth ? (
                    <div className="text-base text-light-red m-[3px]">
                      {errors.nominee_guardian_date_of_birth}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={`${styles.details_container}`}>
                <select
                  placeholder={translate(MY_PROFILE.guardianRelationship + "*")}
                  className={
                    isSelectedFromDropdown
                      ? "w-full text-regular bg-white cursor-not-allowed text-2xl text-black font-extrabold border border-gray-300 p-2 rounded"
                      : "w-full text-regular text-2xl text-black border border-gray-300 p-2 rounded"
                  }
                  aria-label="Default select example"
                  name="nominee_guardian_relationship"
                  onChange={handleChange}
                  value={values.nominee_guardian_relationship}
                  disabled={isSelectedFromDropdown}
                  selected={values.nominee_guardian_relationship}
                >
                  <option value="" disabled selected hidden>
                    {translate(MY_PROFILE.guardianRelationship)} *
                  </option>
                  {guardianRelation?.length &&
                    guardianRelation.map((item, i) => {
                      return (
                        <>
                          <option className="text-black capitalize">
                            {item}
                          </option>
                        </>
                      );
                    })}
                </select>
              </div>
            </>
          ) : null}
          {
            (getJourneyType() !== "RM"  && showSameAddress ) ?
            <div className="form-check flex items-center my-2">
              <input
                type="checkbox"
                onChange={handleAddressCheckboxClick}
                checked={values.sameAddress}
                value={values.sameAddress}
                disabled={pinCodeLoading || isSelectedFromDropdown || isFamilyMember}
                name="sameAddress"
                className={
                  pinCodeLoading || isSelectedFromDropdown || isFamilyMember
                    ? "cursor-not-allowed  h-4 w-4 mr-2"
                    : " h-4 w-4 mr-2 hover:cursor-pointer"
                }
              />
              <div className="text-regular text-2xl text-black">
                {translate(MY_PROFILE.nomineeAddressSameAsPrimaryAddress)}
              </div>
            </div>
            : null
          }
          <div className="flex flex-col gap-3">
            <div className="flex justify-between flex-wrap sm:flex-nowrap gap-3 w-full">
              <label className="w-full">
                <input
                  type="text"
                  name="nominee_address_line1"
                  value={values.nominee_address_line1}
                  onChange={handleChange}
                  onFocus={() => setTouch(true)}
                  className={
                    values.sameAddress || isSelectedFromDropdown
                      ? "bg-white text-black w-full border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed py-2 w-full input-field text-2xl"
                      : "w-full input-field text-2xl p-2 text-black border w-full"
                  }
                  placeholder={`${translate(ADDRESS_DETAILS.communicationAddressLine)} 1 *`}
                  onInput={handleInputAddress}
                  disabled={values.sameAddress || isSelectedFromDropdown}
                />
              </label>

              <label className="w-full">
                <input
                  type="text"
                  name="nominee_address_line2"
                  value={values.nominee_address_line2}
                  onChange={handleChange}
                  onFocus={() => setTouch(true)}
                  className={
                    values.sameAddress || isSelectedFromDropdown
                      ? "bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed py-2 w-full input-field text-2xl"
                      : " w-full input-field text-2xl p-2 text-black border w-full"
                  }
                  placeholder={`${translate(ADDRESS_DETAILS.communicationAddressLine)} 2`}
                  onInput={handleInputAddress}
                  disabled={values.sameAddress || isSelectedFromDropdown}
                />
              </label>
            </div>
            {errors.combinedLength && touch ? (
              <div className="text-base text-light-red">
                {errors.combinedLength}
              </div>
            ) : null}
            <div
              className={`flex justify-between gap-3 w-full ${styles.status_container}`}
            >
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  name="nominee_pincode"
                  value={values?.nominee_pincode}
                  onChange={(e) => {
                    const filteredText = numberInput(e.target.value);
                    setFieldValue("nominee_pincode", filteredText);
                  }}
                  maxLength={6}
                  className={
                    values.sameAddress || isSelectedFromDropdown
                      ? "bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed py-2 input-field text-2xl"
                      : " input-field text-2xl p-2 text-black border w-full"
                  }
                  placeholder={`${translate(ADDRESS_DETAILS.zip)} *`}
                  disabled={values.sameAddress || isSelectedFromDropdown}
                />
                {errors?.nominee_pincode ? (
                  <div className="text-base text-light-red">
                    {errors?.nominee_pincode}
                  </div>
                ) : null}
              </div>
              <div className="w-full">
                <input
                  type="text"
                  readOnly
                  name="nominee_city"
                  value={values.nominee_city}
                  onChange={handleChange}
                  className={`bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed py-2 input-field text-2xl w-full`}
                  placeholder={`${translate(ADDRESS_DETAILS.city)}*`}
                  onInput={handleInput}
                />
              </div>
            </div>
            <div
              className={`flex justify-between gap-3 w-full ${styles.status_container} w-full`}
            >
              <input
                readOnly
                type="text"
                name="nominee_state"
                value={values.nominee_state}
                onChange={handleChange}
                className={`bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed py-2 input-field text-2xl w-1/2 ${styles.details_container}`}
                placeholder={`${translate(ADDRESS_DETAILS.state)}*`}
                onInput={handleInput}
              />
              <input
                type="text"
                readOnly
                name="nominee_country"
                value={values.nominee_country}
                onChange={handleChange}
                className={`bg-white text-black  border-0 cursor-not-allowed w-full py-2 input-field text-2xl  cursor-not-allowed py-2 input-field text-2xl w-1/2 ${styles.details_container}`}
                placeholder={`${translate(ADDRESS_DETAILS.country)} *`}
                onInput={handleInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NomineeCard);
