import { FaRegEdit } from "react-icons/fa";
import review_invest_css from "../styles/review_invest_css.module.css";
import { DECLARATION_CONCENT, DETAIL_FD, FD_RENEWAL, MAKE_PAYMENT_DECLARATION } from "../constants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUserType } from "../lib/util";

const DeclarationDetails = ({
  handleDeclarationEdit,
  declaration,
  shouldShowForm15G,
  form15gInfo,
  customDeclaration,
  allowEdit
}) => {
  const [declarationDetails, setDynamicDetails] = useState();
  const { t: translate } = useTranslation();
  const role = getUserType();

  let selectedManufactureId = "";
  if (typeof window !== "undefined") {
    selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  }

  useEffect(() => {
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    if (productIdLocal && sessionStorage[productIdLocal]) {
      const { declaration, declarationDetails } = JSON.parse(sessionStorage[productIdLocal]);
      if (declaration) {
        if (
          declaration?.dynamic_declaration &&
          Object.keys(declaration?.dynamic_declaration).length
        ) {
          const DeclarationDetails = sessionStorage.getItem("DeclarationDetails");
          DeclarationDetails && setDynamicDetails(JSON.parse(DeclarationDetails));
        }
      } else if (declarationDetails) {
        if (
          declarationDetails?.dynamicDeclaration &&
          Object.keys(declarationDetails?.dynamicDeclaration).length
        ) {
          const DeclarationDetails = sessionStorage.getItem("DeclarationDetails");
          DeclarationDetails && setDynamicDetails(JSON.parse(DeclarationDetails));
        } else {
          const DeclarationDetails = sessionStorage.getItem("DeclarationDetails");
          DeclarationDetails && setDynamicDetails(JSON.parse(DeclarationDetails));
        }
      }
    }
  }, []);

  return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] ">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-medium text-black text-xxl">{translate(DETAIL_FD.declaration)}</div>
          <div className={`${allowEdit ? 'visible' : 'hidden'}`}>
            <div
              className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
              onClick={handleDeclarationEdit}
            >
              <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Declaration Details">
              <FaRegEdit fill="#ffff" width={'10px'} />
</button>
              
              {/* {translate(FD_RENEWAL.edit)} */}
            </div>
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width}`}>
          {!customDeclaration?.length && declarationDetails?.Declaration?.item
            ? Object.keys(declarationDetails?.Declaration?.item).map((key) => {
              return (
                <div className="flex flex-row justify-between mb-4">
                  <div className="text-regular text-2xl text-light-gray break-normal pr-1">
                    {declarationDetails?.Declaration?.item[key]}
                  </div>
                  <div className="flex justify-end gap-3 items-center">
                    {/* <label className="relative inline-flex cursor-not-allowed">
                      <input
                        type="checkbox"
                        group="group1"
                        name="taxResidency"
                        id="taxResidency"
                        className="sr-only peer"
                        checked={
                          declaration &&
                            declaration?.dynamic_declaration?.Declaration?.data
                            ? declaration?.dynamic_declaration?.Declaration?.data.includes(
                              declarationDetails?.Declaration?.item[key]
                            )
                            : false
                        }
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:accent-primary-green dark:peer-focus:accent-primary-green rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[5px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-green"></div>
                    </label> */}
                    <label className="text-regular text-2xl text-light-gray inline-block">
                      {declaration?.dynamic_declaration?.Declaration &&
                        declaration?.dynamic_declaration?.Declaration?.data.includes(
                          key
                        ) == true
                        ? "YES"
                        : "NO"}
                    </label>
                  </div>
                </div>
              );
            })
            : null}
          {customDeclaration?.length > 1
            ? customDeclaration.map((data) => {
              const { custDeclId, custDeclText, custDeclResp } = data;
              return (
                <div className="flex flex-row justify-between mb-4" key={custDeclId}>
                  <div className="text-regular text-2xl text-light-gray break-normal pr-1">
                    {custDeclText}
                  </div>
                  <div className="flex justify-end gap-3 items-center">
                    {/* <label className="relative inline-flex cursor-not-allowed">
                      <input
                        type="checkbox"
                        group="group1"
                        name="taxResidency"
                        id="taxResidency"
                        className="sr-only peer"
                        checked={JSON.parse(custDeclResp.toLowerCase()) ? JSON.parse(custDeclResp.toLowerCase()) : false}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:accent-primary-green dark:peer-focus:accent-primary-green rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[5px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-green"></div>
                    </label> */}
                    <label className="text-regular text-2xl text-light-gray inline-block">
                      {JSON.parse(custDeclResp.toLowerCase())
                        ? "YES"
                        : "NO"}
                    </label>
                  </div>
                </div>
              );
            })
            : null}
          {
            role.toLowerCase() === "user" && <div className="flex flex-row justify-between mb-4">
              <div className="text-regular text-2xl text-light-gray break-normal pr-1">
                {DECLARATION_CONCENT.taxResidency}
              </div>
              <div className="flex justify-end gap-3 items-center">
                {/* <label className="relative inline-flex cursor-not-allowed">
                  <input
                    type="checkbox"
                    group="group1"
                    name="taxResidency"
                    id="taxResidency"
                    className="sr-only peer"
                    checked={
                      declaration && declaration.taxResidency
                        ? declaration.taxResidency
                        : false
                    }
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:accent-primary-green dark:peer-focus:accent-primary-green rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[5px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-green"></div>
                </label> */}
                <label className="text-regular text-2xl text-light-gray inline-block">
                  {declaration && declaration.taxResidency == true ? "YES" : "NO"}
                </label>
              </div>
            </div>
          }
          {/* {shouldShowForm15G || selectedManufactureId?.toUpperCase() !== "PNBHFC" ? (
            <>
              <div>
                <div className="text-regular text-light-gray text-5xl mb-2">
                  {translate(FD_RENEWAL.form15G)}
                </div>
              </div>
              <div className="flex flex- gap-3 mb-4">
                <input
                  type="checkbox"
                  // onChange={handleAddressCheckboxClick}
                  // checked={values.sameAddress}
                  checked={form15gInfo}
                  name="sameAddress"
                  // disabled={pinCodeLoading}
                  className="accent-primary-green h-4 w-4 mt-1 hover:cursor-pointer"
                />
                <div className="text-regular text-2xl break-normal">
                  {"Do you want to submit form 15G"}
                </div>
              </div>
              <div className="flex flex-row justify-between gap-3 mb-4">
                <input
                  type="text"
                  name="name"
                  value="Form 15G"
                  placeholder={translate(FD_RENEWAL.form15G)}
                  className="border border-gray-300  p-3 w-full rounded mb-"
                />
                <input
                  type="text"
                  name="name"
                  value={new Date().getFullYear() + "-" + Number(new Date().getFullYear() + 1)}
                  placeholder="Year"
                  className="border border-gray-300  p-3 w-full rounded mb-"
                />
              </div>
              <div className="flex flex-row justify-between gap-3 mb-4">
                <input
                  type="checkbox"
                  // onChange={handleAddressCheckboxClick}
                  // checked={values.sameAddress}
                  // value={values.sameAddress}
                  name="sameAddress"
                  // disabled={pinCodeLoading}
                  className="accent-primary-green h-4 w-4 mt-1 hover:cursor-pointer"
                />
                <div className="text-regular text-2xl break-normal w-fit">
                  {translate(MAKE_PAYMENT_DECLARATION.declarationMsg)}
                  
                </div>
              </div>
            </>
          ) : null} */}
        </div>
      </div>
    </>
  );
};

export default DeclarationDetails;
