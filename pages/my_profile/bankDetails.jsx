import { useTranslation } from "react-i18next";
import { BANK_DETAILS_PAGE, MY_PROFILE } from "../../constants";
import profile from "../../styles/profile.module.css";

function BankDetails({ bankDetails }) {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className={`${profile.info_table_container}`}>
        <table className="table-auto w-full text-left border-collapse border-b lack-400 border-spacing-y-5">
          <thead className="text-2xl text-light-gray text-medium">
            <tr>
              <th className="font-normal">{translate(BANK_DETAILS_PAGE.accountNumber)}</th>
              <th className="font-normal">{translate(MY_PROFILE.bankName)}</th>
              <th className="font-normal">{translate(MY_PROFILE.accountType)}</th>
              <th className="font-normal">{translate(BANK_DETAILS_PAGE.ifscCode)}</th>
            </tr>
          </thead>
          <tbody className="text-regular text-xl text-black">
            {bankDetails &&
              bankDetails.map((data) => {
                return (
                  <tr className="border-b lack-400">
                    <td className="py-3 text-black ">{data.account_number}</td>
                    <td className="py-3 text-black">{data.bank_name}</td>
                    <td className="py-3 text-black">{data.account_type}</td>
                    <td className="py-3 text-black">{data.ifsc_code}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className={`${profile.info_container}`}>
        {bankDetails &&
          bankDetails.map((data) => {
            return (
              <div className="text-xl text-regular flex flex-wrap justify-between">
                <div className="text-light-gray">
                  <div>{translate(BANK_DETAILS_PAGE.accountNumber)}</div>
                  <div>{translate(MY_PROFILE.bankName)}</div>
                  <div>{translate(MY_PROFILE.accountType)}</div>
                  <div>{translate(BANK_DETAILS_PAGE.ifscCode)}</div>
                </div>
                <div>
                  <div>{data.account_number}</div>
                  <div className="whitespace-normal">{data.bank_name}</div>
                  <div>{data.account_type}</div>
                  <div>{data.ifsc_code}</div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}

export default BankDetails;
