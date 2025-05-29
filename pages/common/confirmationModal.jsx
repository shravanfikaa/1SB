import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { FD_RENEWAL } from "../../constants";

function ConfirmationModal({ heading, message, getModalStatus }) {
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
                    status: false,
                  })
                }
              >
                <IoMdClose size={22} className="close-button" />
              </button>
            </div>
            <div className="w-full flex justify-center mb-4">
              <div className="break-normal text-center text-regular text-2xl max-w-[90%]">
                <div className="mb-3 text-center text-medium text-4xl text-black">
                  {heading}
                </div>
                <div className="mb-3 text-black text-center">{message}</div>
                <div className="flex justify-center gap-3">
                  <button
                    className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                    onClick={() =>
                      getModalStatus({
                        show: false,
                        status: true,
                      })
                    }
                  >
                    {translate(FD_RENEWAL.yes)}
                  </button>
                  <button
                    className="button-passive border-fd-primary text-fd-primary"
                    onClick={() =>
                      getModalStatus({
                        show: false,
                        status: false,
                      })
                    }
                  >
                    {translate(FD_RENEWAL.no)}
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

export default ConfirmationModal;
