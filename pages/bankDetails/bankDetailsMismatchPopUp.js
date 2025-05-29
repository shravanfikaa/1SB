import React, { useEffect } from "react";
import { useState } from "react";
import { PostApiHandler } from "../api/apihandler";
import appConfig from "../../app.config";
import FormData from "form-data";
import { comparePennyDropStatusDetailsWithOCR, compareCkycDetailsWithPennyDropDetails } from "../../lib/bankUtils";
import ErrorModal from "../common/errorPopup";
import Loader from "../../svg/Loader";
import bankmismatchcss from "../../styles/popup_modals.module.css"
import { BsInfoCircleFill } from 'react-icons/bs'
import { useTranslation } from "react-i18next";
import { ADDRESS_DETAILS, BANK_DETAILS_PAGE } from "../../constants";
const BankDetailsMismatchPopup = ({ canShow, accountValidationMode, updateModalState, errorMessage, accountHolderNameFromPennyDrop, userName, accountStatusFromPennyDrop,
  ifscCode, accountNumber, vpaId, redirectFromMismatchPopup, isChequeMandatory, ocrThresholdLimit,
}) => {
  const { t: translate } = useTranslation();
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [redirectPageState, setRedirectPageState] = useState()
  const [showOcrFailedModal, setshowOcrFailedModal] = useState(false);
  const toggleOcrFailModal = () => setshowOcrFailedModal((state) => !state);
  const [accountNumberReceivedFromCheque, setAccountNumberReceivedFromCheque] = useState("")
  const [ifscReceivedFromCheque, setifscReceivedFromCheque] = useState("")
  const [displayErrorMessage, setDisplayErrorMessage] = useState("")
  const [invalidDocumentUploaded, setInvalidDocumentUploaded] = useState(false)
  const [fileNotUploaded, setfileNotUploaded] = useState(true)
  const [matchStatus, setMatchStatus] = useState(false);

  function handleChange(event) {
    setFile(event.target.files[0]);
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const base64String = reader.result
        .replace('data:', '')
        .replace(/^.+,/, '');
      sessionStorage.setItem("base64String", JSON.stringify(base64String));
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    const uploadChequeAPIURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.uploadCheque;
    const chequeFile = new FormData();
    chequeFile.append('file', file);
    chequeFile.append('chequeFile', file);

    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };

    if (file) {
      setfileNotUploaded(false);
      if (!((file.type).includes('image') || (file.type).includes('jpeg') || (file.type).includes('bmp'))) {
        setLoading(false)
        setInvalidDocumentUploaded(true)
        setDisplayErrorMessage("Invalid File Selected. Allowed file types are JPG, PNG, BMP")
        setshowOcrFailedModal(true)
      } else if (file.size > 6000000) {
        setLoading(false)
        setInvalidDocumentUploaded(true)
        setDisplayErrorMessage("File size exceeded, please upload file less than 6 MB")
        setshowOcrFailedModal(true)
      } else {
        PostApiHandler(uploadChequeAPIURL, "POST", chequeFile, { 'content-type': 'multipart/form-data' }).then((uploadChequeResponse) => {
          setRedirectPageState("")
          if (uploadChequeResponse) {
            setLoading(true)
            let fetchedChequeDetails = comparePennyDropStatusDetailsWithOCR(uploadChequeResponse, ifscCode, accountNumber, ocrThresholdLimit);
            setLoading(false)

            if (uploadChequeResponse.status !== 200) {
              setDisplayErrorMessage('Something went wrong please wait or retry')
              setshowOcrFailedModal(true)
            } else {
              let accountNumberDetails = (uploadChequeResponse.data?.data?.result) ? Object.values(uploadChequeResponse.data.data.result) : []
              if (accountNumberDetails.length > 0 && accountNumberDetails[0].type.value === "cheque") {
                setAccountNumberReceivedFromCheque(accountNumberDetails[0].details.account_number.value)
                setifscReceivedFromCheque(accountNumberDetails[0].details.ifsc_code.value)
                if (fetchedChequeDetails.ocrAccountNumberError.length > 0 || fetchedChequeDetails.ocrIFSCError.length > 0) {
                  //not good quality image
                  if (fetchedChequeDetails.ocrAccountNumberError.length > 0 && fetchedChequeDetails.ocrIFSCError.length > 0) {
                    setDisplayErrorMessage(fetchedChequeDetails.ocrAccountNumberError + " & " + fetchedChequeDetails.ocrIFSCError);
                  }
                  else if (fetchedChequeDetails.ocrAccountNumberError.length > 0 && fetchedChequeDetails.ocrIFSCError.length == 0) {
                    //if only A/C no. cannot be read
                    setDisplayErrorMessage(fetchedChequeDetails.ocrAccountNumberError);
                  }
                  else if (fetchedChequeDetails.ocrAccountNumberError.length == 0 && fetchedChequeDetails.ocrIFSCError.length > 0) {
                    //if only IFSC cannot be read
                    setDisplayErrorMessage(fetchedChequeDetails.ocrIFSCError);
                  }
                  setshowOcrFailedModal(true)
                  setLoading(false)
                }
                else if ((!fetchedChequeDetails.ocrAccountNumberError.length && !fetchedChequeDetails.ocrIFSCError.length) &&
                  !(fetchedChequeDetails.isAccountNumberMatched || fetchedChequeDetails.isIfscMatched)
                ) {
                  //good quality image but incorrect A/C,IFSC
                  setDisplayErrorMessage(fetchedChequeDetails.enteredAccountNumberError + " or " + fetchedChequeDetails.enteredIFSCError);
                  setshowOcrFailedModal(true)
                  setLoading(false)
                }
                else {
                  //good quality image & matching details then redirect to Review Page
                  redirectFromMismatchPopup();
                }
              } else if (accountNumberDetails[0].type.value === "others") {
                setDisplayErrorMessage('You have provided invalid document')
                setshowOcrFailedModal(true)
                setLoading(false)
              }
            }
          } else {
            setshowOcrFailedModal(false)
          }
        })
      }
    }
    else {
      setLoading(false)
      setInvalidDocumentUploaded(true)
      setDisplayErrorMessage("Please choose a file to proceed")
      setshowOcrFailedModal(true)
    }
  }

  useEffect(() => {
    if (userName || accountHolderNameFromPennyDrop) {
      const status = compareCkycDetailsWithPennyDropDetails(userName, accountHolderNameFromPennyDrop) > appConfig.name_comparison_limit ? true : false;
      setMatchStatus(status);
    }
  }, [userName, accountHolderNameFromPennyDrop]);

  if (canShow) {
    return (
      <>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className="fixed inset-0 w-auto h-auto bg-black opacity-25"
            onClick={updateModalState}
          ></div>
          <ErrorModal
            canShow={showOcrFailedModal}
            updateModalState={toggleOcrFailModal}
            errorMessage={displayErrorMessage}
          />
          <div className="flex items-center min-h-screen px-4 py-8">
            <div className="relative w-auto flex justify-center p-4 mx-auto bg-white rounded-md">
              <div className="sm:flex">
                <div className="mt-2 break-normal m-4">
                  {matchStatus ? <div className="text-medium text-6xl text-fd-primary flex text-center justify-center">
                    {translate(BANK_DETAILS_PAGE.congratsAccValidated)}
                  </div> : <>
                    {
                      <div className="text-medium text-6xl text-fd-primary flex text-center justify-center">
                        {
                          accountValidationMode === "A" ? `Failed to validate bank account` :
                            accountValidationMode === "U" ? `Failed to validate UPI Id` :
                              accountValidationMode === "B" && vpaId ? `Failed to validate UPI Id` : `Failed to validate bank account`
                        }
                      </div>
                    }
                    {
                      <div className="text-medium text-2xl text-gray-600 flex justify-center">
                        {
                          accountValidationMode === "A" ? `Primary holder and bank account holder names are not matching` :
                            accountValidationMode === "U" ? `Mismatch in FD investor and UPI id holder’s name.` :
                              accountValidationMode === "B" && vpaId ? `Mismatch in FD investor and UPI id holder’s name.` : `Primary holder and bank account holder names are not matching`
                        }
                      </div>
                    }
                  </>}
                  <div className={bankmismatchcss.cheque_table_desktop_display}>
                    <table className="table-auto my-4 text-left mb-5 w-full border-2">
                      <thead className="justify-center border-2 ">
                        <tr className='text-medium text-2xl text-gray-600'>
                          <th scope="col" className="font-normal border p-2">
                            {translate(BANK_DETAILS_PAGE.investorName)}
                          </th>
                          <th scope="col" className="font-normal border p-2">
                            {translate(BANK_DETAILS_PAGE.bankAccHolderName)}
                          </th>
                          <th scope="col" className="font-normal border p-2">
                            {translate(BANK_DETAILS_PAGE.accountStatus)}
                          </th>
                          <th scope="col" className="font-normal border p-2">
                            {translate(BANK_DETAILS_PAGE.matchStatus)}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-regular text-xl text-black justify-self-stretch">
                        <tr>
                          <td className="border capitalize p-2 text-center">{userName}</td>
                          <td className="border capitalize p-2 text-center">{accountHolderNameFromPennyDrop}</td>
                          <td className="border capitalize p-2 text-center ">{accountStatusFromPennyDrop}</td>
                          {matchStatus ? <td className="text-primary-green border capitalize p-2 text-center">Matched</td> : <td className="text-light-red border capitalize text-center">Mismatch</td>}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className={bankmismatchcss.cheque_table_mobile_display}>
                    <table className="table-auto my-4 text-left  mb-5 w-full border-2 capitalize">
                      <thead>
                        <tr>
                          <th></th>
                          <th> </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="info-style">{translate(BANK_DETAILS_PAGE.investorName)}</td>
                          <td className="text-black">{userName}</td>
                        </tr>
                        <tr>
                          <td className="capitalize">{translate(BANK_DETAILS_PAGE.bankAccHolderName)}</td>
                          <td className="text-black">{accountHolderNameFromPennyDrop}</td>
                        </tr>
                        <tr>
                          <td className="capitalize">{translate(BANK_DETAILS_PAGE.accountStatus)}</td>
                          <td className="text-black">{accountStatusFromPennyDrop}</td>
                        </tr>
                        <tr>
                          <td className="capitalize">{translate(BANK_DETAILS_PAGE.matchStatus)}</td>
                          {matchStatus ? <td className="text-primary-green border capitalize">Matched</td> : <td className="text-light-red border capitalize">Mismatch</td>}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {
                    accountValidationMode === "U" || accountValidationMode === "B" && vpaId ? <div className="justify-end gap-2 mt-3 flex">
                      <button
                        className="button-passive border-fd-primary text-fd-primary"
                        onClick={updateModalState}
                      >
                        Update UPI Id
                      </button>
                    </div> :
                      <>
                        {isChequeMandatory && <div>
                          <p className="text-fd-primary flex gap-2 text-3xl items-center"><BsInfoCircleFill />{translate(BANK_DETAILS_PAGE.manufacturerMandatedCheque)}</p>
                        </div>}
                        <div className="text-left my-3">
                          <div className="text-regular text-4xl text-black">{translate(BANK_DETAILS_PAGE.uploadCancelledCopyOfCheque)}<span className="text-light-red">*</span> </div>
                          <div className="mb-3 text-gray-600 text-medium text-2xl text-left">
                            {translate(BANK_DETAILS_PAGE.accDetailsVisible)}
                          </div>
                          <input type="file" className="border text-black rounded p-2" onChange={handleChange} />
                        </div>
                        <div className="justify-end gap-2 mt-3 flex">
                          <button className={(loading)? " button-active mr-1" : "btn-gradient button-active mr-1"} type="submit"
                            disabled={loading}
                            onClick={handleSubmit}>Upload{loading ? <Loader /> : null}</button>
                          <button
                            className="button-passive border-fd-primary text-fd-primary"
                            onClick={updateModalState}
                          >
                            {translate(ADDRESS_DETAILS.close)}
                          </button>
                        </div>
                      </>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return null;
};

export default BankDetailsMismatchPopup;
