import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DynamicForm from "../../_components/DynamicElementFormHandler";
import styles from "../../styles/parents_spouse_details.module.css";
import appConfig from "../../app.config";
import { PostApiHandler } from "../api/apihandler";
import Loader from "../../svg/Loader";
import ErrorModal from "../common/errorPopup";
import { LocalStorageHandler } from "../../lib/storage_handler";
import { ADDRESS_DETAILS, AGENT, COMMON_CONSTANTS, COMPONENTS } from "../../constants";
import { useTranslation } from "react-i18next";
import { handleEventLogger,isMobile } from "../../lib/util";

function CustomerProfessionalDetails(props) {
  const [isValid, setIsValid] = useState(false);
  const [dynamicFields, setDynamicFields] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fieldData, setFieldData] = useState({});
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const {t:translate} = useTranslation();
  const toggleErrorModal = () => setShowErrorModal((state) => !state);

  const handleContinueBtnClick = (e) => {
    handleEventLogger("professional_details", "buttonClick","Invest_Click" , {
      action:"Professtional_Details_Completed",
      Screen_Name: "Professional page",
      Platform:isMobile()
    }); 
      props.handle(
      props.nextPage,
      e,
      {
        professional_details: fieldData,
      },
      "professional_details",
      fieldData
    );
  };

  const handleBackBtnClick = (e) => {
    props.handle(
      props.prevPage,
      e,
      {
        professional_details: fieldData,
      },
      true
    );
  };

  function isUserFormValid(data, component, isValid) {
    if (component && data) {
      setFieldData((state) => {
        const prevData = { ...state };
        prevData[component].data = data;
        prevData[component].isValid = true;
        return prevData;
      });
    }
  }

  const getDynamicFieldDetails = () => {
    setIsLoading(true);
    const productManufacturerId = new LocalStorageHandler().getLocalStorageItem(
      "selectedManufactureId"
    );
    const url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.applicationSetup +
      "?distributor_id=" +
      appConfig?.distributorId +
      "&manufacturer_id=" +
      productManufacturerId;

    PostApiHandler(url, "GET")
      .then((response) => {
        if (response.data?.data) {
          const { dynamicFields } = response.data?.data;

          if (Object.keys(dynamicFields).length) {
            const { ProfessionalDetails } = dynamicFields;
            ProfessionalDetails && setDynamicFields(ProfessionalDetails);
          }
        } else if (response.data?.errors?.length) {
          setApiErrorMessage(response.data?.errors[0]);
        }
      })
      .catch((err) => {
        console.log("Error:", err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (dynamicFields) {
      const productIdLocal = sessionStorage.getItem("selectedProductId");
      const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
      if (props?.journeyData && Object.keys(props?.journeyData).length) {
        const { journeyData: { payload } } = props;
        const payloadData = payload ? payload : {};
        if (Object.keys(payloadData).length) {
          setFieldData(payloadData);
        } else if (productData?.professional_details) {
          const { professional_details } = productData;
          if (Object.keys(professional_details).length && Object.keys(professional_details)) {
            setFieldData(professional_details);
          }
        }
      } else if (productData?.professional_details) {
        const { professional_details } = productData;
        if (Object.keys(professional_details).length && Object.keys(professional_details)) {
          setFieldData(professional_details);
        }
      } else if (dynamicFields) {
        const dataWithValidation = {};

        Object.keys(dynamicFields).forEach((key) => {
          !dataWithValidation[key] && (dataWithValidation[key] = {});
          dataWithValidation[key]["data"] = "";
          dataWithValidation[key]["isValid"] = false;
        });
        setFieldData(dataWithValidation);
      }
    }
  }, [dynamicFields]);

  useEffect(() => {
    const fieldDataKeys = Object.keys(fieldData); 
    if (fieldDataKeys.length) {
      const filterInvalidData = fieldDataKeys.filter((key) => {
        if(fieldData[key].isValid === false && dynamicFields[key].isMandatory === true)
        {
          return fieldData[key];
        }
      });

      !filterInvalidData.length && setIsValid(true);
    }
  }, [fieldData]);

  useEffect(() => {
    if (props.componentData) {
      Object.keys(props.componentData).length &&
        Object.keys(props.componentData).forEach((key) => {
          // setFieldValue(key, props.componentData[key]);
        });
    }

    getDynamicFieldDetails();
  }, []);

  return (
    <div>
      <div>
        <div className="text-medium text-6xl  text-black">
          {translate(COMPONENTS.professionalDetails)}
        </div>
        <div className="text-regular text-xl mb-5 text-subcontent">
          {translate(COMPONENTS.occupationDetail)}
        </div>
        {isLoading ? (
          <div
            className={` ${styles.details_container} pt-20 pl-90 text-3xl text-gray-500`}
          >
            <div className="flex justify-center gap-3 items-center">
              {translate(AGENT.loading)}..
              <Loader />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className={`grid grid-cols-2 w-full gap-5 ${styles.details_container}`}>
              {dynamicFields &&
                Object.keys(fieldData).length &&
                Object.keys(dynamicFields).map((item) => {
                  return (
                    <DynamicForm
                      name= {item}
                      selectedFieldData={fieldData[item]}
                      formData={dynamicFields[item]}
                      isUserFormValid={isUserFormValid}
                    />
                  );
                })}
            </div>
            {props.isOnboardingUser ? (
              <div className="flex justify-center mt-7 gap-5">
                <button
                  className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit  "
                  onClick={() =>
                    props.handleSaveDetails({
                      professionalDetails: fieldData,
                    })
                  }
                // COMMENTING THIS AS THIS PAGE NEEDS REFINEMENT disabled={!formik.isValid}
                >
                  {translate(ADDRESS_DETAILS.save)}
                </button>
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={props.handleClose}
                >
                  {translate(ADDRESS_DETAILS.close)}
                </button>
              </div>
            ) : (
              <div className="flex justify-start mt-7 gap-5">
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={handleBackBtnClick}
                // COMMENTING THIS AS THIS PAGE NEEDS REFINEMENT disabled={!formik.isValid}
                >
                  {translate(ADDRESS_DETAILS.back)}
                </button>
                <button
                  className={(dynamicFields !== undefined ? !isValid : isValid)? "button-active  button-transition text-medium text-xl lg:text-2xl w-fit " : "button-active  button-transition btn-gradient  text-medium text-xl lg:text-2xl w-fit "}
                  onClick={handleContinueBtnClick}
                  // COMMENTING THIS AS THIS PAGE NEEDS REFINEMENT
                  disabled={dynamicFields !== undefined ? !isValid : isValid}
                >
                  {translate(COMMON_CONSTANTS.continueLabel)}
                </button>
              </div>
            )}
          </div>
        )}
        <ErrorModal
          canShow={showErrorModal}
          updateModalState={toggleErrorModal}
          errorMessage={apiErrorMessage}
        />
      </div>
    </div>
  );
}

export default CustomerProfessionalDetails;
