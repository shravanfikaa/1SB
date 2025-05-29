import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import { dateFormat } from "../../lib/util";
import styles from "../../styles/RenewFDPopup.module.css";
import { AGENT, COMMON_CONSTANTS, imageURL,AFTER_REVIEW } from "../../constants";
import { useTranslation } from "react-i18next";

function RenewFDPopup({ item, toggleRenewFDModal }) {
  const formik = useFormik({
    initialValues: {
      maturityInstruction: "",
    },
  });

  const { values, handleChange } = formik;
  const { t: translate } = useTranslation();

  const renewInstruction = {
    principal: "Only Principal Amount",
    principalAndInterest: "Principal + Interest Amount",
  };
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className={`p-6 bg-white rounded-md shadow-lg z-[1]`}>
            <div className="flex flex-row-reverse">
              <button onClick={toggleRenewFDModal}>
                <IoMdClose size={22} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3 my-3 justify-between">
              <div className="flex gap-3 justify-between items-center">
                <div>
                  <img
                    src={
                      imageURL.imageBaseUrl +
                      item?.manufacturer_id.replaceAll(" ", "_").toLowerCase() +
                      ".png"
                    }
                    width="64"
                    height="64"
                    objectfit="contain"
                  ></img>
                </div>
                <div>
                  <div className="text-medium text-3xl text-black">{item?.fd_name}</div>
                  <div className="text-medium text-xl text-black text-light-gray">
                    {item?.type}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div>
                  <div className="text-medium text-xl text-black text-light-gray">
                    {translate(AGENT.number)}
                  </div>
                  <div className="text-medium text-xl text-black text-light-gray">
                    {item?.fdr_number}
                  </div>
                </div>
                <div>
                  <div className="text-medium text-xl text-black text-light-gray">
                  {translate(AFTER_REVIEW.maturityDate)}
                  </div>
                  <div className="text-medium text-xl text-black text-light-gray">
                    {item?.fd_maturity_date
                      ? dateFormat(item?.fd_maturity_date)
                      : null}
                  </div>
                </div>
                <div></div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4 justify-center">
              <div className="text-left text-medium text-3xl text-black">{translate(AGENT.renew)}</div>
              <div>
                <div className={`mb-3 flex gap-3 ${styles.status_container}`}>
                  {Object.keys(renewInstruction).map((statusName, index) => {
                    return (
                      <div
                        key={`${statusName + index}`}
                        className="border border-gray-300 text-black shadow p-2 rounded flex gap-2 items-center w-max"
                      >
                        <input
                          type="radio"
                          name="maturityInstruction"
                          value={statusName}
                          className="w-4 h-4 accent-primary-green"
                          onChange={handleChange}
                        />
                        <label className="align-top " htmlFor={statusName}>
                          {renewInstruction[statusName]}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={toggleRenewFDModal}
                >
                  {translate(COMMON_CONSTANTS.cancel)}
                </button>
                <Link
                  href={{
                    pathname: "/[fd_id]/fd_renewal",
                    query: {
                      fd_id: item?.id,
                      maturityInstruction:
                        renewInstruction[values.maturityInstruction],
                    },
                  }}
                  passHref
                  as="/[fd_id]/fd_renewal"
                >
                  <button
                    className={(!values.maturityInstruction) ? "button-active button-transition hover:bg-hover-primary text-medium text-xl text-black lg:text-2xl w-fit   text-medium text-xl text-black lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl text-white lg:text-2xl w-fit   text-medium text-xl  lg:text-2xl w-fit  hover:button-shadow"}
                    id={item?.id}
                    disabled={!values.maturityInstruction}
                  >
                    {translate(AGENT.proceed)}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RenewFDPopup;
