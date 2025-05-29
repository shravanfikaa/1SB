import { useState, useEffect } from "react";
import { LocalStorageHandler } from "../../lib/storage_handler";
import { useFormik } from "formik";
import { BASIC_DETAILS, BUTTON_NAME, COMMON_CONSTANTS, VALIDATION_CONSTANT } from "../../constants";
import styles from "../../styles/customer_personal_details.module.css";
import { useRouter } from "next/router";
import { numberInput } from "../../lib/util";
import * as yup from "yup";
import { useTranslation } from "react-i18next";

function ContactDetails(props) {
  const {t:translate} = useTranslation();
  const router = useRouter();
  const [contactDetails, setContactDetails] = useState({
    mobileNumber: "",
    emailID: "",
  });

  const validationSchema = yup.object({
    mobileNumber: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.mobileNoLength))
      .matches(/^[0-9]\d{9}$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    emailID: yup
      .string()
      .test("Is valid Email ID", translate(VALIDATION_CONSTANT.validEmail), (value) => {
        if (value) {
          return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
        } else {
          return true;
        }
      })
      .required(""),
  });

  const formik = useFormik({
    initialValues: {
      mobileNumber: "",
      emailID: "",
    },
    validationSchema,
  });

  const { values, touched, errors, setFieldValue } = formik;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    const productIdLocal = sessionStorage.getItem("selectedProductId");
    const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
    if (productData) {
      const { CkycApiData } = productData;
      if (CkycApiData && Object.keys(CkycApiData).length) {
        const { pidData } = CkycApiData;
        if (Object.keys(pidData).length) {
          if (Object.keys(pidData?.personalDetails).length) {
            const { mobNum, email } = pidData?.personalDetails;
            setContactDetails({ mobileNumber: mobNum, emailID: email });
            mobNum && setFieldValue("mobileNumber", parseInt(mobNum));
            email && setFieldValue("emailID", email);
          }
        }
      }
    }

    const { contact_details } = productData ? productData : router.query;

    if (contact_details) {
      const { mobileNumber, emailID } = contact_details;
      mobileNumber && setFieldValue("mobileNumber", mobileNumber);
      emailID && setFieldValue("emailID", emailID);
    }
  }, []);

  const handleBackButtonClick = () => {
    props.handle(props.prevPage, {}, { contact_details: values });
  };

  const handleContinueButtonClick = () => {
    if (!contactDetails.mobileNumber || !contactDetails.emailID) {
    }
    props.handle(props.nextPage, {}, { contact_details: values });
  };

  return (
    <div>
      <div className="text-medium text-black text-3xl mb-2">{translate(BASIC_DETAILS.contactDetails)}</div>
      <div className="text-regular text-xl mb-5">{translate(BASIC_DETAILS.addContactDetails)}</div>
      <div className="container">
        <div>
          <div
            className={`text-regular text-2xl text-light-gray mb-3 ${styles.details_container}`}
          >
            <input
              type="text"
              className={
                contactDetails?.mobileNumber
                  ? "h-12 input-field text-black w-full bg-neutral-200 cursor-not-allowed"
                  : "h-12 input-field text-black w-full"
              }
              placeholder="Contact Number *"
              name="mobileNumber"
              maxLength={10}
              value={values.mobileNumber}
              disabled={contactDetails?.mobileNumber}
              onChange={(e) => {
                const filteredText = numberInput(e.target.value);
                setFieldValue("mobileNumber", filteredText.toUpperCase());
              }}
            />
            <div className="mb-3">
              {touched.mobileNumber || errors.mobileNumber ? (
                <span className="text-base text-light-red">
                  {errors.mobileNumber}
                </span>
              ) : null}
            </div>
            <input
              type="string"
              className={
                contactDetails?.emailID
                  ? "h-12 input-field text-black w-full bg-neutral-200 cursor-not-allowed"
                  : "h-12 input-field text-black w-full"
              }
              placeholder="Email ID *"
              name="emailID"
              id="emailID"
              value={values.emailID}
              disabled={contactDetails?.emailID}
              onChange={(e) => {
                setFieldValue("emailID", e.target.value);
              }}
            />
            <div className="mb-3">
              {touched.emailID || errors.emailID ? (
                <span className="text-base text-light-red">
                  {errors.emailID}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex justify-start mt-7 gap-5">
          <button
            className="button-passive border-fd-primary text-fd-primary"
            onClick={handleBackButtonClick}
          >
            {BUTTON_NAME.back}
          </button>
          <button
            className={(!values.mobileNumber || !values.emailID) ? "button-active  button-transition  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " : "button-active  button-transition btn-gradient  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " }
            onClick={handleContinueButtonClick}
            disabled={!values.mobileNumber || !values.emailID}
          >
            {translate(COMMON_CONSTANTS.continueLabel)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactDetails;
