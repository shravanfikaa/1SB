import review_invest_css from "../styles/review_invest_css.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect,useState} from "react";

const TermsConditions = ({ isTermsConditionsAccepted,termsConditions}) => {
  const maxLength = 200;
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleText = (index) => {
      setOpenIndexes((prev) => 
          prev.includes(index) 
              ? prev.filter(i => i !== index) 
              : [...prev, index]
      );
  };
  const termsLength = termsConditions.length;
  const createInitialValues = (count) => {
    const initialValues = {};
    for (let i = 0; i < count; i++) {
        initialValues[`consentText${i}`] = false; // Create keys like consentText1, consentText2, etc.
    }
    return initialValues;
};

const createValidationSchema = (count) => {
    const shape = {};
    for (let i = 0; i < count; i++) {
        shape[`consentText${i}`] = yup.bool().isTrue("");
    }
    return yup.object().shape(shape);
};

const initialTerm = createInitialValues(termsLength);
const validationSchema = createValidationSchema(termsLength)
  const initialValues = {
    ...initialTerm
  };

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
      <div className="flex flex-col mb-4 border-b-2 user_journey_container rounded-xl p-[30px]">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-black text-medium flex  items-center gap-2 text-6xl">
            Terms & Conditions <span className="text-light-red">*</span>{" "}
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width} mb-3`}>
          {termsConditions.map((item, i) => (
            <div
              key={item}
              className="mb-3 flex text-regular text-xl text-light-gray items-start gap-3"
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  className="accent-primary-green h-3 w-3  hover:cursor-pointer"
                  name={`consentText${i}`}
                  checked={values[`consentText${i}`]}
                  onChange={handleChange}
                  value={values[`consentText${i}`]}
                />
              </div>
              <p key={i}>
                    {openIndexes.includes(i) ? item : `${item.slice(0, maxLength)}...`}
                    <span 
                        onClick={() => toggleText(i)} 
                        className="text-fd-primary cursor-pointer">
                        {openIndexes.includes(i) ? ' Read Less' : ' Read More'}
                    </span>
                </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default TermsConditions;
