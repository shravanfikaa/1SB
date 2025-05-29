import { forwardRef, useEffect, useState } from "react";
import FilterDropdown from "../pages/common/FilterDropdown";
import { useTranslation } from "react-i18next";

const RMDropdownParent = forwardRef(
  ({ options, getFilteredResult, name }, ref) => {
    const MOUSE_UP = "mouseup";
    const [outsideClick, setOutsideClick] = useState(false);

    const getOutsideClick = () => {
      setOutsideClick(false);
    };
    const { t: translate } = useTranslation();
    useEffect(() => {
      const handleOutsideClick = (event) => {
        if (
          event.target !== ref.current &&
          !ref.current?.contains(event.target) &&
          event.target.localName !== "li"
        ) {
          setOutsideClick(true);
        }
      };
      document.addEventListener(MOUSE_UP, handleOutsideClick);

      return () => document.removeEventListener(MOUSE_UP, handleOutsideClick);
    });

    return (
      <>
        <FilterDropdown
          options={options}
          getFilteredResult={getFilteredResult}
          name={name}
          ref={ref}
          shouldShowDropDown={outsideClick}
          getOutsideClick={getOutsideClick}
        />
      </>
    );
  }
);

export default RMDropdownParent;
