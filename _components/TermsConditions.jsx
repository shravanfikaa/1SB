import { COMPONENTS, MMFSL_FD_TERMS_CONDITIONS } from "../constants";
import review_invest_css from "../styles/review_invest_css.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";  
const TermsConditions = ({ isTermsConditionsAccepted }) => {
  const { t: translate } = useTranslation();
  const data = translate(MMFSL_FD_TERMS_CONDITIONS, { returnObjects: true });  // Fetch translated data
  const initialValues = {
    authorizeManufacturerDeclaration: false,
    acceptKYCDeclaration: false,
    acceptFetchKYCConsentDeclaration: false,
    thirdPartyTransfersDeclaration: false,
  };

  const validationSchema = yup.object().shape({
    authorizeManufacturerDeclaration: yup.bool().isTrue(""),
    acceptKYCDeclaration: yup.bool().isTrue(""),
    acceptFetchKYCConsentDeclaration: yup.bool().isTrue(""),
    thirdPartyTransfersDeclaration: yup.bool().isTrue(""),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, errors, handleChange, dirty } = formik;

  useEffect(() => {
    if (Object.keys(errors).length) {
      isTermsConditionsAccepted(false);
    } else if (
      Object.keys(values).length === Object.keys(initialValues).length
    ) {
      isTermsConditionsAccepted(true);
    }
  }, [values, errors]);
  useEffect(() => {
    !dirty && isTermsConditionsAccepted(false);
  }, []);

  return (
    <>
      <div className="flex flex-col mb-4 border-b-2 user_journey_container rounded-xl p-[20px]">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-black text-medium flex  items-center gap-2 text-6xl">
            {translate(COMPONENTS.termsConditions)} <span className="text-light-red">*</span>{" "}
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width} mb-3`}>
          {Object.keys(data).map((item) => (
            <div
              key={item}
              className="mb-3 flex text-regular text-xl text-light-gray items-start gap-3"
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  className="accent-primary-green h-3 w-3  hover:cursor-pointer"
                  name={item}
                  checked={values.item}
                  onChange={handleChange}
                  value={values.item}
                />
              </div>
              <p className="text-justify">{data[item]}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default TermsConditions;
