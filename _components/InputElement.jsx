import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { REDIRECTION_MSG } from "../constants";

const InputField = ({ selectedFieldData, formData, handleFormValues }) => {
  const initialValues = {
    inputValue: "",
  };
  const { t: translate } = useTranslation();
  const validationSchema = Yup.object().shape({
    inputValue: Yup.number()
      .min(formData?.minValue)
      .max(formData?.maxValue)
      .required(translate(REDIRECTION_MSG.ThisFieldIsRequired)),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, errors, setFieldValue, setFieldError } = formik;

  function handleValues(event) {
    if (!event.target.value) {
      setFieldError("inputValue", translate(REDIRECTION_MSG.ThisFieldIsRequired));
    } else if (event.target.value) {
      setFieldValue("inputValue", event.target.value);
      setFieldError("inputValue", "");
    }
  }

  useEffect(() => {
    if (values.inputValue) {
      handleFormValues(values.inputValue, formData?.attributeLabel);
    }
  }, [values, errors]);

  useEffect(() => {
    if (selectedFieldData) {
      setFieldValue("inputValue", selectedFieldData.data);
    }
  }, []);

  return (
    <div className="my-5">
      <div className="mb-3">
        <div className="text-regular text-2xl text-light-gray">
          {formData?.attributeLabel}
        </div>
      </div>
      <div>
        <input
          type="text"
          name="inputValue"
          value={values.inputValue}
          onChange={handleValues}
          className="h-12 input-field text-black w-full"
        />
      </div>
      {errors.inputValue && (
        <div className="text-base text-light-red">{errors.inputValue}</div>
      )}
    </div>
  );
};

export default InputField;
