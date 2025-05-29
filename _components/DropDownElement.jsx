import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

const DropdownField = ({ name, selectedFieldData, formData, handleFormValues }) => {
  const initialValues = {
    dropdownValue: "",
  };
  const { t: translate } = useTranslation();
  const validationSchema = Yup.object().shape({
    dropdownValue: Yup.string().matches(formData?.validationExp),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, errors, setFieldValue, handleChange, isValid } = formik;

  useEffect(() => {
    if (values.dropdownValue) {
      handleFormValues(values.dropdownValue,name);
    }
  }, [values, errors]);

  useEffect(() => {
    if (selectedFieldData) {
      setFieldValue("dropdownValue", selectedFieldData.data);
    }
  }, []);

  return (
    <div className=" my-5">
      <select
        className="text-regular text-2xl border border-gray-300  bg-white p-3 w-full text-black rounded capitalize"
        id="dropdownValue"
        value={values.dropdownValue}
        name="dropdownValue"
        onChange={handleChange}
      >
        <option
          className="text-light-gray hover:bg-light-red "
          value=""
          disabled
          selected
          hidden
        >
          {formData?.attributeLabel}{formData?.isMandatory ? "*" : ""}
        </option>
        {formData?.item &&
          Object.keys(formData?.item).map((key) => (
            <option className="text-light-gray capitalize" key={key}>
              {formData?.item[key]}
            </option>
          ))}
      </select>
      {errors.dropdownValue && (
        <div className="text-base text-light-red">{errors.dropdownValue}</div>
      )}
    </div>
  );
};

export default DropdownField;
