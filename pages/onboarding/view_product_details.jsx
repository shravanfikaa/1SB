import { IoMdClose } from "react-icons/io";
import popupcss from "../../styles/popup_modals.module.css";
import FDProductInfo from "../detail_fd/fd_product_info";
import { ADDRESS_DETAILS } from "../../constants";
import { useTranslation } from "react-i18next";
function ProductDetails({ toggleProductInfo, productInfo }) {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div
            className={`p-4 bg-white rounded-md shadow-lg z-[1] ${popupcss.product_info}`}
          >
            <div className="flex flex-row-reverse mb-3">
              <button onClick={toggleProductInfo}>
                <IoMdClose size={22} className="close-button" />
              </button>
            </div>
            <div className="w-full flex justify-center mb-4">
              <div>
                <FDProductInfo
                  productInfo={productInfo}
                  isOnboardingUser={true}
                />
                <div className="flex justify-center">
                  <button
                    className="button-passive border-fd-primary text-fd-primary mr-5"
                    onClick={toggleProductInfo}
                  >
                    {translate(ADDRESS_DETAILS.close)}
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

export default ProductDetails;
