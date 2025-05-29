import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

const ToggleButton = ({ selectedFieldData, formData, handleFormValues }) => {
  const initialValues = {
    selectedOptions: [],
  };

  const validationSchema = Yup.object({
    selectedOptions: Yup.array().of(Yup.string()).required(""),
  });
  const { t: translate } = useTranslation();
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
    handleFormValues(values.selectedOptions, formData?.attributeLabel);
  }, [values, errors]);

  return (
    <div className="my-5 justify-between">
     
      {formData?.item &&
        Object.keys(formData.item).map((key) => (
          <div className="pb-6 mb-3 flex justify-between">
            <div className=" flex text-regular text-2xl text-light-gray break-normal">
              {formData.item[key]}
            </div>
            <div className="flex  gap-3 items-center">
              <label className="relative inline-flex cursor-pointer">
                <input
                  className="sr-only peer"
                  type="checkbox"
                  role="switch"
                  id={`checkbox_${key}`}
                  name="selectedOptions"
                  value={formData.item[key]}
                  checked={values.selectedOptions.includes(formData.item[key])}
                  onChange={handleChange}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:accent-primary-green dark:peer-focus:accent-primary-green rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[5px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-green"></div>
              </label>
              <label className="text-regular text-2xl text-light-gray inline-block">
                {values.selectedOptions.includes(formData.item[key])
                  ? "YES"
                  : "NO"}
              </label>
            </div>
          </div>
        ))}

      {errors.selectedOptions && (
        <div className="text-base text-light-red">{errors.selectedOptions}</div>
      )}
    </div>
  );
};

export default ToggleButton;
