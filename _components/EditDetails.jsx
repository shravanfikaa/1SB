import { IoMdClose } from "react-icons/io";
import CustomerAddressDetails from "../pages/addressDetails/customerAddressDetails";
import AddNominee from "../pages/nomination/nomination";
import BankDetails from "../pages/bankDetails/bankDetails";
import InvestmentDetails from "../pages/investment_details/investment_details";
import FDDeclaration from "../pages/fd_declaration/fd_declaration";
import ParentsSpouseDetails from "../pages/parents_spouse_details/parents_spouse_details";
import CustomerProfessionalDetails from "../pages/professional_details/ProfessionalDetails";
import { COMMON } from "../constants";
import { useTranslation } from "react-i18next";

function EditDetails({ toggleEditModal, editComponentType }) {
  const handleClose = () => {
    toggleEditModal({});
  };

  const handleSaveDetails = (data) => {
    toggleEditModal(data);
  };
  const { t: translate } = useTranslation();
  const renderComponent = () => {
    switch (editComponentType.componentName) {
      case "customer_address":
        return (
          <CustomerAddressDetails
            isOnboardingUser={true}
            handleSaveDetails={handleSaveDetails}
            handleClose={handleClose}
            componentData={editComponentType.data}
          />
        );
      case "parents_spouse_details":
        return (
          <ParentsSpouseDetails
            isOnboardingUser={true}
            handleSaveDetails={handleSaveDetails}
            handleClose={handleClose}
            componentData={editComponentType.data}
          />
        );
      case "add_nominee":
        return (
          <AddNominee
            isOnboardingUser={true}
            handleSaveDetails={handleSaveDetails}
            handleClose={handleClose}
            componentData={editComponentType.data}
          />
        );
      case "declaration":
        return (
          <FDDeclaration
          isOnboardingUser={true}
          handleSaveDetails={handleSaveDetails}
          handleClose={handleClose}
          componentData={editComponentType.data}
          />
        );
      case "investmentDetails":
        return (
          <InvestmentDetails
          isOnboardingUser={true}
          handleSaveDetails={handleSaveDetails}
          handleClose={handleClose}
          componentData={editComponentType.data}
          />
        );
      case "professional_details":
        return (
          <CustomerProfessionalDetails
            isOnboardingUser={true}
            handleSaveDetails={handleSaveDetails}
            handleClose={handleClose}
            componentData={editComponentType.data}
          />
        );
      case "bankDetails":
        return (
          <BankDetails
          isOnboardingUser={true}
          handleSaveDetails={handleSaveDetails}
          handleClose={handleClose}
          componentData={editComponentType.data}
          />
        );
      default:
        return (
          <div className="pt-40 pl-96 text-3xl text-apercu-medium text-gray-500">
            {translate(COMMON.noComponentToRender)}
            
          </div>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className={`p-6 bg-white rounded-md shadow-lg z-[1]`}>
            <div className="flex flex-row-reverse mb-3">
              <button onClick={toggleEditModal}>
                <IoMdClose size={22} className="close-button" />
              </button>
            </div>
            <div className="w-full flex justify-center">
              <div>{renderComponent()}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditDetails;
