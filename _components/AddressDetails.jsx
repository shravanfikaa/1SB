import { FaRegEdit } from "react-icons/fa";
import review_invest_css from "../styles/review_invest_css.module.css";
import { ADDRESS_DETAILS, FD_RENEWAL } from "../constants";
import { useTranslation } from "react-i18next";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import { MONTHS } from "../constants";
import { useFormik } from "formik";

const AddressDetails = ({ handleAddressDetailsEdit, address_details, showStayingSince, handleUpdateAddressDetails, allowEdit }) => {
  const { t: translate } = useTranslation();

  const [selectedManufactureId, setSelectedManufactureId] = useState("");
  const years = range(getYear(new Date()) - 101, getYear(new Date()) + 1, 1);

  const formik = useFormik({
    initialValues: {
      stayingSince: "",
      customerAddressPreferredCheck: true
    },
  });

  const { values, setFieldValue } = formik;

  const handleDateChange = (e) => {
    showStayingSince && handleUpdateAddressDetails(e, values.customerAddressPreferredCheck);
    setFieldValue("stayingSince", e)
  }

  useEffect(() => {
    showStayingSince && handleUpdateAddressDetails(values.stayingSince, values.customerAddressPreferredCheck);
  }, [values.customerAddressPreferredCheck]);

  useEffect(() => {
    if (address_details?.stayingSince) {
      setFieldValue("stayingSince", new Date(address_details?.stayingSince))
    }
  }, [address_details])

  useEffect(() => {
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    setSelectedManufactureId(selectedManufactureId);
  }, []);

  return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-[100%]">
        <div className="flex justify-between flex-row mb-3">
          <div className="text-medium text-black text-xxl">{translate(ADDRESS_DETAILS.addressDetails)}
          </div>
          <div className={`${allowEdit ? 'visible' : 'hidden'}`}>
            <div
              className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2 border rounded-md btn-gradient p-2"
              onClick={handleAddressDetailsEdit}
            >
               <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Address Details">
              <FaRegEdit fill="#ffff" width={'10px'} />
</button>
              {/* {translate(FD_RENEWAL.edit)} */}
            </div>
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width}`}>
          <div className="flex flex-col text-regular text-2xl text-light-gray space-y-5">
            <div className="flex flex-col">
              <div className="text-subcontent">{translate(ADDRESS_DETAILS.permanentAddress)}</div>
              <div className="w-auto text-xl  text-black capitalize">
                {address_details?.permanentAddress
                  ? address_details?.permanentAddress?.toLowerCase()
                  : ""}
              </div>
            </div>
            {
              selectedManufactureId?.toUpperCase() !== "PNBHFC" ? <>
                {address_details?.communicationAddress &&
                  address_details?.communicationAddress.trim("") ? (
                  <div className="flex flex-col">
                    <div>{translate(ADDRESS_DETAILS.communicationAddress)}</div>
                    <div className="w-auto text-black capitalize">
                      {address_details?.communicationAddress?.toLowerCase()}
                    </div>
                  </div>
                ) : null}
              </> : null
            }
          </div>
          <div className={`${review_invest_css.investment_div_width}`}>
            <div className="flex flex-col text-regular text-2xl text-light-gray space-y-5">
              {showStayingSince ?
                <DatePicker
                  placeholderText={translate(ADDRESS_DETAILS.stayingSince) +" " + "*"}
                  defaultValue={values?.stayingSince ? new Date(values?.stayingSince) : ""}
                  selected={values?.stayingSince ? new Date(values?.stayingSince) : ""}
                  maxDate={new Date()}
                  dateFormat={"MM/yyyy"}
                  onSelect={(e) => handleDateChange(e)}
                  onChange={(e) => handleDateChange(e)}
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex justify-center">
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                      >
                        &nbsp;{"< "}&nbsp;
                      </button>
                      <select
                        value={MONTHS[getMonth(date)]}
                        onChange={({ target: { value } }) =>
                          changeMonth(MONTHS.indexOf(value))
                        }
                      >
                        {MONTHS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <select
                        value={getYear(date)}
                        onChange={({ target: { value } }) => changeYear(value)}
                      >
                        {years.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                      >
                        &nbsp; {" > "} &nbsp;
                      </button>
                    </div>
                  )}
                  className={
                    "w-fit py-2 input-field text-2xl border border-solid border-gray-300 text-black mt-5"
                  }
                />
                : null}
            </div>
          </div>
          {showStayingSince ? <div className={`${review_invest_css.investment_div_width} my-2`}>
            <div className="flex flex-col text-regular text-2xl text-light-gray space-y-5">
              {
                <div className="flex flex-row gap-3">
                  <div>
                    <input
                      type="checkbox"
                      className="accent-primary-green h-4 w-4 hover:cursor-pointer"
                      onChange={(e) => {
                        setFieldValue("customerAddressPreferredCheck", e.target.checked)
                      }}
                      checked={values.customerAddressPreferredCheck}
                      value={values.customerAddressPreferredCheck}
                      name="customerAddressPreferredCheck"

                    />
                  </div>
                  {
                    address_details?.permanentAddress === address_details?.communicationAddress ?
                      <div className="text-justify text-regular text-2xl text-light-gray text-light-gray">
                        {translate(ADDRESS_DETAILS.communicationAddressIsSameAsPermanentAddr)}
                      </div> :
                      <div className="text-justify text-base text-2xl text-light-gray text-light-gray">
                        {translate(ADDRESS_DETAILS.requestText)}
                      </div>
                  }
                </div>
              }
            </div>
          </div> : null}
        </div>
      </div>
    </>
  );
};

export default AddressDetails;
