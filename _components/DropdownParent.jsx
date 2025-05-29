import { forwardRef, useEffect, useState } from "react";
import MultiSelectDropdown from "../pages/compare_plan/multiselectdropdown";
import { useTranslation } from "react-i18next";

const DropdownParent = forwardRef(
  ({ options, selected, toggleOption, name, onSelect }, ref) => {
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
        <MultiSelectDropdown
          options={options}
          selected={selected}
          toggleOption={toggleOption}
          onSelect={onSelect}
          name={name}
          ref={ref}
          shouldShowDropDown={outsideClick}
          getOutsideClick={getOutsideClick}
        />
      </>
    );
  }
);

export default DropdownParent;
