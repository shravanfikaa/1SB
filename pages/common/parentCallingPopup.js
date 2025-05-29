
import React, { useState } from "react";
import Modal from "./errorPopup";
import { COMMON } from "../../constants";
import { useTranslation } from "react-i18next";



export default function App() {
    const { t: translate } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const toggleModal = () => setShowModal(state => !state);

    const myname="Divyanka";
    const apiData={
        age: 1,
        user:"Prabhakar",
        company: "1SB",
        interest: [[1,2,3], [11,22,33],[44,33,22] ]};
    return (
        <div className="flex flex-col items-center justify-center h-60">
            <h1 className="text-2xl font-bold">
                {translate(COMMON.clickOnOpenModel)}
            </h1>
            <button
                className="px-4 py-2 text-purple-100 bg-purple-600 rounded-md"
                type="button"                
                onClick={toggleModal}
            >
                {translate(COMMON.openModal)}
            </button>
            <Modal canShow={showModal} updateModalState={toggleModal} />
            
        </div>
    );
}