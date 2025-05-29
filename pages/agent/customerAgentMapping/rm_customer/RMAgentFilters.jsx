import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import { useFormik } from "formik";
import * as yup from "yup";
import { charInputWithSpace, charWithNumberInput, emailInput } from "../../../../lib/util";
import { AGENT, COMMON_CONSTANTS } from "../../../../constants";
import { useTranslation } from "react-i18next";
function RMAgentFilters({ getFilterURL }) {
  const [queryURL, setQueryURL] = useState("");
  const { t: translate } = useTranslation();
  const initialValues = {
    agentName: "",
    employeeID: "",
    emailID: "",
  };

  const validationSchema = yup.object({});

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, setValues, setFieldValue, handleChange } = formik;

  const handleResetFilter = () => {
    setValues({
      agentName: "",
      employeeID: "",
      emailID: "",
    });
  };

  const { agentName, employeeID, emailID } = values;

  useEffect(() => {
    const paramArray = [];
    agentName && paramArray.push(`agent_name=${agentName}`);
    employeeID && paramArray.push(`employee_id=${employeeID}`);
    emailID && paramArray.push(`email_id=${emailID}`);

    if (paramArray.length) {
      const queryParam = "?" + paramArray.join("&");
      setQueryURL(queryParam);
    } else {
      setQueryURL("");
    }
  }, [values]);

  useEffect(() => {
    const filterResult = setTimeout(() => {
      getFilterURL(queryURL);
    }, 500);
    return () => clearTimeout(filterResult);
  }, [queryURL]);

  return (
    <>
      <div className={`bg-white border-b border-slate-300`}>
        <div className="flex justify-between flex-wrap">
          <div className="flex items-center flex-wrap text-regular text-2xl text-light-grays gap-3 mb-3 mt-3">
            <input
              type="text"
              placeholder={translate(AGENT.agentName)}
              name="agentName"
              value={agentName}
              onChange={(e) => {
                const filteredText = charInputWithSpace(e.target.value);
                setFieldValue("agentName", filteredText);
              }}
              className="w-50 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
            />
            <input
              type="text"
              placeholder={translate(AGENT.employeeId)}
              name="employeeID"
              value={employeeID}
              onChange={(e) => {
                const filteredText = charWithNumberInput(e.target.value);
                setFieldValue("employeeID", filteredText);
              }}
              className="w-50 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
            />
            <input
              type="text"
              placeholder={translate(AGENT.emailId)}
              name="emailID"
              value={emailID}
              onChange={(e) => {
                const filteredText = emailInput(e.target.value);
                setFieldValue("emailID", filteredText);
              }}
              className="w-50 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
            />
          </div>
          <div className="flex flex-row items-center gap-3 mb-3 mt-3">
            <div className="hover:cursor-pointer">
              <FaFilter
                className={`${
                  agentName || emailID || employeeID
                    ? "text-light-orange"
                    : "text-fd-primary"
                } text-2xl font-bold`}
              />
            </div>
            <div
              className="text-regular text-2xl text-light-red hover:cursor-pointer"
              onClick={handleResetFilter}
            >
              {translate(COMMON_CONSTANTS.resetAll)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RMAgentFilters;
