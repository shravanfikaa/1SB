import React from "react";
import CheckboxField from "./CheckBoxElement";
import DropdownField from "./DropDownElement";
import InputField from "./InputElement";
import RadioButton from "./RadioButton";
import ToggleButton from "./ToggleButton";
import { useTranslation } from "react-i18next";

const DynamicForm = ({ name ,selectedFieldData, formData, isUserFormValid }) => {
  // const { formData?.fieldType, attributeLabel, item } = formData;
  function handleFormValues(data, component, isValid) {
    isUserFormValid(data, component, isValid);
  }
  const { t: translate } = useTranslation();
  let fieldElement = null;

  if (formData?.fieldType.toLowerCase() === "checkbox") {
    // Render a checkbox input
    fieldElement = (
      <div>
        <CheckboxField
          selectedFieldData={selectedFieldData ? selectedFieldData : {}}
          formData={formData ? formData : {}}
          handleFormValues={handleFormValues}
        />
      </div>
    );
  } else if (formData?.fieldType.toLowerCase() === "dropdown") {
    // Render a dropdown/select input
    fieldElement = (
      <div className="w-full col-span-3 sm:col-span-1">
        <DropdownField
          name={name}
          selectedFieldData={selectedFieldData ? selectedFieldData : {}}
          formData={formData ? formData : {}}
          handleFormValues={handleFormValues}
        />
      </div>
    );
  } else if (formData?.fieldType.toLowerCase() === "radiobutton") {
    // Render a radioButton input
    fieldElement = (
      <div>
        <RadioButton
          selectedFieldData={selectedFieldData ? selectedFieldData : {}}
          formData={formData ? formData : {}}
          handleFormValues={handleFormValues}
        />
      </div>
    );
  } else if (formData?.fieldType.toLowerCase() === "input") {
    // Render a input
    fieldElement = (
      <div>
        <InputField
          selectedFieldData={selectedFieldData ? selectedFieldData : {}}
          formData={formData ? formData : {}}
          handleFormValues={handleFormValues}
        />
      </div>
    );
  } else if (formData?.fieldType.toLowerCase() === "toggle") {
    // Render a toggle input
    fieldElement = (
      <div>
        <ToggleButton
          selectedFieldData={selectedFieldData ? selectedFieldData : {}}
          formData={formData ? formData : {}}
          handleFormValues={handleFormValues}
        />
      </div>
    );
  }
  return fieldElement;
};

export default DynamicForm;
