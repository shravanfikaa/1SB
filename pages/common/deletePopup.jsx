import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { COMMON, FD_RENEWAL } from "../../constants";
function DeletePopup({ getModalStatus, showDeletePopup, message }) {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className={`p-4 bg-white rounded-md shadow-lg z-[1]`}>
            <div className="flex flex-row-reverse mb-3">
              <button
                onClick={() =>
                  getModalStatus({
                    show: false,
                    id: "",
                    shouldDelete: false,
                  })
                }
              >
                <IoMdClose size={22} fill="#000" className="close-button" />
              </button>
            </div>
            <div className="w-full flex justify-center mb-4">
              <div className="break-normal text-center text-regular text-2xl max-w-[90%]">
                <div className="mb-3 text-left text-medium text-4xl text-black">
                  {translate(COMMON.deactivate)}
                </div>
                <div className="mb-3 text-left text-black">
                  {message
                    ? message
                    : "Are you sure you want to deactivate the user."}
                </div>
                <div className="flex justify-center">
                  <button
                    className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                    onClick={() =>
                      getModalStatus({
                        show: false,
                        id: showDeletePopup.id,
                        shouldDelete: true,
                      })
                    }
                  >
                    {translate(FD_RENEWAL.yes)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeletePopup;
