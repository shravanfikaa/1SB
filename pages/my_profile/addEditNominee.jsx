import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import NomineeCard from "../nomination/nominee_card";
import { nomineeDateFormat } from "../../lib/util";
import { useTranslation } from "react-i18next";

function AddEditNominee({
  userPanNumber,
  type,
  getAddEditNomineeData,
  nominee,
}) {
  const [nomineeCardData, setNomineeCardData] = useState([]);
  const [isValid, setIsValid] = useState();
  const { t: translate } = useTranslation();
  const [loading, setLoading] = useState(false);
  const toggleLoading = (state) => setLoading(state);
  const handleApplyBtnClick = () => {
    const data = { ...nomineeCardData };
    const { nominee_date_of_birth, nominee_guardian_date_of_birth } = data;

    if (nominee_date_of_birth) {
      data.nominee_date_of_birth = nomineeDateFormat(nominee_date_of_birth);
    }
    if (nominee_guardian_date_of_birth) {
      data.nominee_guardian_date_of_birth = nomineeDateFormat(
        nominee_guardian_date_of_birth
      );
    } else {
      data.nominee_guardian_date_of_birth = null;
    }

    getAddEditNomineeData(false, type, data);
  };

  const getNomineeDetailsFromCard = (nomineeCard, id, _isValid) => {
    setNomineeCardData(nomineeCard);
    setIsValid(_isValid);
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className={`p-6 bg-white rounded-md shadow-lg z-[1]`}>
          <div className="flex justify-between">
            <div className="text-left text-medium text-4xl text-black">
              {type + " Nominee Details"}
            </div>
            <button onClick={() => getAddEditNomineeData(false, type, {})}>
              <IoMdClose size={22} fill='#000' />
            </button>
          </div> 
          {nominee ? (
            <NomineeCard
              key={nominee["id"] + 1}
              nominee={nominee}
              userPanNumber={userPanNumber}
              getNomineeDetails={getNomineeDetailsFromCard}
              toggleLoading={toggleLoading}
            />
          ) : null}

          <div className="flex justify-center mt-3">
            <button
              className={(!isValid) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-2" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-2"}
              onClick={handleApplyBtnClick}
              disabled={!isValid}
            >
              {type + " Nominee Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEditNominee;
