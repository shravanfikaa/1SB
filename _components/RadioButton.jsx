import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { VALIDATION_CONSTANT } from "../constants";

const RadioButtonField = ({
  selectedFieldData,
  formData,
  handleFormValues,
}) => {
  const initialValues = {
    radioButtonValue: "",
  };
  const { t: translate } = useTranslation();
  const validationSchema = Yup.object().shape({
    radioButtonValue: Yup.string().required(translate(VALIDATION_CONSTANT.selectAnOption)),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, errors, setFieldValue, setFieldError } = formik;

  const handleChange = (event) => {
    if (event.target.value) {
      setFieldValue("radioButtonValue", event.target.value);
      setFieldError("radioButtonValue", "");
    }
  };

  useEffect(() => {
    if (values.radioButtonValue) {
      handleFormValues(values.radioButtonValue, formData?.attributeLabel);
    }
  }, [values, errors]);

  useEffect(() => {
    if (selectedFieldData) {
      setFieldValue("radioButtonValue", selectedFieldData.data);
    }
  }, []);

  return (
    <div className="my-5">
      <div className="mb-3">
        <div className="flex text-regular text-2xl text-light-gray">
          {formData?.attributeLabel}
        </div>
      </div>
      {formData?.item &&
        Object.keys(formData.item).map((key) => {
          return (
            <div className="text-regular text-4xl text-black mb-3 flex items-center gap-3">
              <input
                type="radio"
                name="radioButtonValue"
                value={formData.item[key]}
                onChange={handleChange}
                checked={values.radioButtonValue === formData.item[key]}
                className="accent-primary-green w-4 h-4 border border-primary-green"
              />
              <label className="text-regular text-2xl">
                {formData.item[key]}
              </label>
            </div>
          );
        })}
      {errors.radioButtonValue && (
        <div className="text-base text-light-red">
          {errors.radioButtonValue}
        </div>
      )}
    </div>
  );
};

export default RadioButtonField;
