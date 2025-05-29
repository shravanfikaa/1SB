import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { VALIDATION_CONSTANT } from "../constants";

const CheckboxField = ({ selectedFieldData, formData, handleFormValues }) => {
  const initialValues = {
    selectedOptions: [],
  };
  const { t: translate } = useTranslation();
  const validationSchema = Yup.object({
    selectedOptions: Yup.array()
      .of(Yup.string())
      .min(1, translate(VALIDATION_CONSTANT.selectOneOption))
      .required(translate(VALIDATION_CONSTANT.selectOneOption)),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, errors, setFieldValue, handleChange, handleBlur } = formik;

  useEffect(() => {
    if (selectedFieldData) {
      setFieldValue("selectedOptions", selectedFieldData.data);
    }
  }, []);

  useEffect(() => {
    if (values.selectedOptions.length) {
      handleFormValues(values.selectedOptions, formData?.attributeLabel);
    }
  }, [values, errors]);

  return (
    <div className="my-5">
      <div className="mb-3">
        <div className="text-regular text-2xl text-light-gray">
          {formData?.attributeLabel}
        </div>
      </div>
      {formData?.item &&
        Object.keys(formData.item).map((key) => (
          <div
            key={key}
            className="text-regular text-4xl mb-3 text-black flex items-center gap-3"
          >
            <input
              type="checkbox"
              id={`checkbox_${key}`}
              name="selectedOptions"
              value={key}
              checked={values.selectedOptions.includes(key)}
              onChange={handleChange}
              className="w-4 h-4 accent-primary-green"
              onBlur={handleBlur}
            />
            <label
              className="text-left text-regular text-2xl normal-case"
              htmlFor={`checkbox_${key}`}
            >
              {formData.item[key]}
            </label>
          </div>
        ))}
      {errors.selectedOptions && (
        <div className="text-base text-light-red">{errors.selectedOptions}</div>
      )}
    </div>
  );
};

export default CheckboxField;
