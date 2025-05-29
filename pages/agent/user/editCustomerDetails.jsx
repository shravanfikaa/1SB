import { useState } from "react";
import comparecss from "../../../styles/popup_modals.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { PostApiHandler } from "../../api/apihandler";
import { useTranslation } from "react-i18next";
import {
    charWithNumberInput,
    emailInput,
    numberInput,
} from "../../../lib/util";
import Loader from "../../../svg/Loader";
import { COMMON_CONSTANTS, RM_JOURNEY_ERROR_MESSAGES,COMMON } from "../../../constants";
import appConfig from "../../../app.config";
import ErrorModal from "../../common/errorPopup.js"

const EditCustomerDetails = ({ updateModalState, customerData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { t: translate } = useTranslation();
    const [showErrorModal, setShowErrorModal] = useState(false);
    const toggleErrorModal = () => {
        updateModalState();
        setShowErrorModal((state) => !state)};
    const [apiErrorMessage, setApiErrorMessage] = useState("");
    const [messageType, setmessageType] = useState("");


    // Form Initial Values from Props
    const formik = useFormik({
        initialValues: {
            customerName: customerData?.first_name || "",
            panNumber: customerData?.pan_number || "",
            phone: customerData?.mobile_number || "",
            email: customerData?.email_id || "",
        },
        validationSchema: yup.object({
            phone: yup
                .string()
                .max(10, translate(RM_JOURNEY_ERROR_MESSAGES.invalidMobileNumberLength))
                .matches(/^[0-9]\d{9}$/, translate(RM_JOURNEY_ERROR_MESSAGES.invalidMobileNumber))
                .required("Required"),
            email: yup
                .string()
                .email(translate(RM_JOURNEY_ERROR_MESSAGES.isEmailInvalid))
                .required("Required"),
        }),
        onSubmit: (values) => {
            handleUpdateCustomer(values);
        },
    });

    const { values, touched, errors, setFieldValue } = formik;

    // API Call to Update Customer Details
    const handleUpdateCustomer = async (formData) => {
        setIsLoading(true);
        const editUserURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.editUser;
        const requestBody = {
            mobile_number: formData.phone,
            email_id: formData.email,
            customer_id: customerData?.customer_id
      };

        try {
            const response = await PostApiHandler(editUserURL, "PUT", requestBody);
            if (response.data.data.status == "success") {
                updateModalState();  
            } else if(res?.data?.errors?.length){
                const { errorMessage } = response.data.errors[0];
                setApiErrorMessage(errorMessage);
                setmessageType("alert");
                setShowErrorModal(true);
            }
        } catch (error) {
            setApiErrorMessage(translate(RM_JOURNEY_ERROR_MESSAGES.failedToUpdateUser));
            setmessageType("alert");
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="fixed inset-0 w-auto h-auto bg-black opacity-25" onClick={updateModalState}></div>
            <div className={`flex items-center min-h-screen ${comparecss.compare_pop_size}`}>
                <div className={`relative h-max bg-white rounded-md shadow-lg ${comparecss.compare_popup_width}`}>
                    <div className="flex justify-center p-4">
                        <h1 className="text-4xl text-medium text-black">{translate(COMMON_CONSTANTS.editCustomerDetails)}</h1>
                    </div>
                    <div className="flex flex-col p-4 px-10 gap-3">
                        {/* Customer Name */}
                        <input
                            type="text"
                            className="h-12 input-field text-black w-full bg-gray-300 cursor-not-allowed"
                            placeholder={translate(COMMON.name)}
                            maxLength={50}
                            value={values.customerName}
                            name="customerName"
                            onChange={(e) => setFieldValue("customerName", charWithNumberInput(e.target.value))}
                            disabled
                        />
                        {touched.customerName && errors.customerName && (
                            <span className="text-base text-light-red">{errors.customerName}</span>
                        )}

                        {/* PAN Number */}
                        <input
                            type="text"
                            className="h-12 input-field text-black w-full bg-gray-300 cursor-not-allowed"
                            placeholder={translate(COMMON.panNumber)}
                            maxLength={10}
                            value={values.panNumber}
                            name="panNumber"
                            onChange={(e) => setFieldValue("panNumber", charWithNumberInput(e.target.value).toUpperCase())}
                            disabled 
                        />
                        {touched.panNumber && errors.panNumber && (
                            <span className="text-base text-light-red">{errors.panNumber}</span>
                        )}

                        {/* Phone */}
                        <input
                            type="text"
                            className="h-12 input-field text-black w-full"
                            placeholder={translate(COMMON.mobileNumber)}
                            value={values.phone}
                            maxLength="10"
                            name="phone"
                            onChange={(e) => setFieldValue("phone", numberInput(e.target.value))}
                        />
                        {touched.phone && errors.phone && (
                            <span className="text-base text-light-red">{errors.phone}</span>
                        )}

                        {/* Email */}
                        <input
                            type="text"
                            className="h-12 input-field text-black w-full"
                            placeholder={translate(COMMON.email)}
                            value={values.email}
                            name="email"
                            onChange={(e) => setFieldValue("email", emailInput(e.target.value))}
                        />
                        {touched.email && errors.email && (
                            <span className="text-base text-light-red">{errors.email}</span>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-center gap-5 mt-5">
                            <button className="button-passive border-fd-primary text-fd-primary" onClick={updateModalState}>
                                {translate(COMMON_CONSTANTS.cancel)}
                            </button>
                            <button
                                className={(Object.keys(errors).length > 0 || !formik.dirty) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                                disabled={Object.keys(errors).length > 0 || !formik.dirty}
                                onClick={formik.handleSubmit}
                            >
                                {translate(COMMON_CONSTANTS.update)} {isLoading && <Loader />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ErrorModal
                canShow={showErrorModal}
                updateModalState={toggleErrorModal}
                errorMessage={apiErrorMessage}
                messageType={messageType}
              />
        </div>
    );
};

export default EditCustomerDetails;
