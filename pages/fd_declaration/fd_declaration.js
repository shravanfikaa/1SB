import { useEffect, useState } from "react";
import { LocalStorageHandler } from "../../lib/storage_handler";
import { useFormik } from "formik";
import declarationcss from "../../styles/fd_declaration.module.css"
import appConfig from "../../app.config";
import { PostApiHandler } from "../api/apihandler";
import DynamicForm from "../../_components/DynamicElementFormHandler";
import Loader from "../../svg/Loader";
import ErrorModal from "../common/errorPopup";
import { ADDRESS_DETAILS, COMMON_CONSTANTS, DETAIL_FD } from "../../constants";
import { useTranslation } from "react-i18next";
import { handleEventLogger,isMobile } from "../../lib/util";

function FDDeclaration(props) {
  const [dynamicFields, setDynamicFields] = useState({});
  const [fieldData, setFieldData] = useState({});
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPepAllowed, setIsPepAllowed] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedManufactureId, setSelectedManufactureId] = useState("");

  const toggleErrorModal = (state) => setShowErrorModal(!state)
  const { t: translate } = useTranslation();

  const initialValues = {
    pep: false,
    relativePep: false,
  }

  const formik = useFormik({
    initialValues,
  });

  const { values, setFieldValue } = formik;

  const handleBackBtnClick = (e) => {
    props.handle(
      props.prevPage,
      e,
      {
        declaration: {
          pep: values.pep,
          relative_pep: values.relativePep,
          dynamic_declaration: fieldData
        },
      },
      true
    )
  }

  const handleContinueBtnClick = (e) => {
    handleEventLogger("declaration", "buttonClick", "Invest_Click", {
      action: "Declaration_Completed",
      Screen_Name: "Declaration page",
      Platform:isMobile()
    });
    props.handle(
      props.nextPage,
      e,
      {
        declaration: {
          pep: values.pep,
          relative_pep: values.relativePep,
          dynamic_declaration: fieldData
        },
      },
      "declaration",
      {
        ...values,
        dynamic_declaration: fieldData
      }
    )
  }

  const isUserFormValid = (data, component) => {
    if (component && data) {
      // if (selectedManufactureId?.toLowerCase() === "pnbhfc" && data.length > 0) {
      //   setIsDisabled(true)
      // } else {
      //   setIsDisabled(false)
      // }
      setFieldData((state) => {
        const prevData = { ...state };
        prevData[component].data = data;
        prevData[component].isValid = true;
        return prevData;
      });
    }
  }
    //setUp API Call

  const getDynamicFieldDetails = () => {

    const productManufacturerId = sessionStorage.getItem("selectedManufactureId");
    const url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.applicationSetup +
      "?distributor_id=" +
      appConfig?.distributorId +
      "&manufacturer_id=" +
      productManufacturerId;

    setIsLoading(true);

    PostApiHandler(url, "GET")
      .then((response) => {
        if (response.data?.data) {
          const { dynamicFields } = response.data?.data;

          if (Object.keys(dynamicFields).length) {
            const { DeclarationDetails } = dynamicFields;
            if (DeclarationDetails?.Declaration) {
              const { isAllowed } = DeclarationDetails.Declaration;
              isAllowed !== undefined && setIsPepAllowed(isAllowed);
            }
            sessionStorage.setItem("DeclarationDetails", JSON.stringify(DeclarationDetails));
            DeclarationDetails && setDynamicFields(DeclarationDetails);
          }
        } else if (response.data?.errors?.length) {
          toggleErrorModal(showErrorModal);
          setApiErrorMessage(response.data?.errors[0]);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      }).finally(() => {
        setIsLoading(false)
      })
  };

  useEffect(() => {
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    selectedManufactureId && setSelectedManufactureId(selectedManufactureId);
    //  scroll to top on page load
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const dataLocal = new LocalStorageHandler().getLocalStorage();
    if (dataLocal) {
      const { declaration } = dataLocal;
      if (declaration && Object.keys(declaration).length) {
        const { pep, relative_pep } = declaration;
        setFieldValue("pep", pep);
        setFieldValue("relativePep", relative_pep);
      }
    } else if (props.isOnboardingUser) {
      const { pep, relative_pep } = props.componentData;
      setFieldValue("pep", pep);
      setFieldValue("relativePep", relative_pep);
    }
    getDynamicFieldDetails();

    if (typeof window !== "undefined") { setSelectedManufactureId(sessionStorage.getItem("selectedManufactureId")) }
  }, []);

  useEffect(() => {
    const dataLocal = new LocalStorageHandler().getLocalStorage();
    if (dataLocal) {
      const { declaration } = dataLocal;
      if (dynamicFields) {
        const dynamic_declaration = declaration?.dynamic_declaration;
        if (dynamic_declaration && Object.keys(dynamic_declaration).length) {
          setFieldData(dynamic_declaration);
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
    }
  }, [dynamicFields]);

  useEffect(() => {
    if (!isPepAllowed && fieldData?.Declaration?.data) {
      const pepList = fieldData?.Declaration.data.find((val) => val.includes("(PEP)"));
      if (pepList) {
        setIsDisabled(true);
        setApiErrorMessage("We cannot proceed to book an online deposit for a PEP/RPEP Customer")
        toggleErrorModal(showErrorModal);
      } else {
        setIsDisabled(false);
      }
    }
  }, [isPepAllowed, fieldData]);

  useEffect(() => {
    if (props?.journeyData && Object.keys(props?.journeyData).length) {
      const { journeyData: { payload } } = props;
      const payloadData = payload ? payload : {};
      Object.keys(payloadData).length && Object.keys(payloadData).forEach((key) => {
        setFieldValue(key, payloadData[key]);
        if (key === "dynamic_declaration") {
          setFieldData(payloadData[key]);
        }
      })
    }
  }, [props]);

  return (
    <div>
      <ErrorModal canShow={showErrorModal} updateModalState={toggleErrorModal} errorMessage={apiErrorMessage} />
      <div className="text-medium text-6xl mb-3 text-black">
        {translate(DETAIL_FD.declaration)}
      </div>
      <div className={props.isOnboardingUser ? `w-fit` : `${declarationcss.label_toggle_width}`}>
        <div>{
          isLoading ?
            <div className="flex justify-center"> <Loader /></div> :
            <div>
              {Object.keys(dynamicFields).length ? <div>
                {dynamicFields &&
                  Object.keys(fieldData).length &&
                  Object.keys(dynamicFields).map((item) => {
                    return (
                      <DynamicForm
                        selectedFieldData={fieldData[item]}
                        formData={dynamicFields[item]}
                        isUserFormValid={isUserFormValid}
                      />
                    );
                  })}
              </div> : null}
            </div>
        }</div>
      </div>
      {
        props.isOnboardingUser ?
          <div className="flex justify-center mt-7 gap-5">
            <button
              className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow text-medium text-xl lg:text-2xl w-fit  "
              onClick={() =>
                props.handleSaveDetails({
                  declaration: {
                    pep: values.pep,
                    relative_pep: values.relativePep,
                    dynamic_declaration: fieldData
                  }
                })
              }
            >
              {translate(ADDRESS_DETAILS.save)}
            </button>
            <button className="button-passive btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow text-medium text-xl lg:text-2xl w-fit  " onClick={props.handleClose}>
              {translate(ADDRESS_DETAILS.close)}
            </button>
          </div>
          :
          <div className="flex flex-row justify-start space-x-5 mt-7">
            <button
              className="block button-passive border-fd-primary text-fd-primary "
              onClick={handleBackBtnClick}
            >
              {translate(ADDRESS_DETAILS.back)}
            </button>
            <button
              className={(isLoading || isDisabled) ? "block button-active button-transition text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " : "block button-active btn-gradient button-transition text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "} 
              onClick={handleContinueBtnClick}
              disabled={isLoading || isDisabled}
            >
              {translate(COMMON_CONSTANTS.continueLabel)}
            </button>
          </div>
      }
    </div >
  )
}

export default FDDeclaration;
