import { IoIosArrowDown } from "react-icons/io";
import { forwardRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const FilterDropdown = forwardRef(
  (
    { options, getFilteredResult, name, shouldShowDropDown, getOutsideClick },
    ref
  ) => {
    const [flag, setFlag] = useState(false);
    const selected = options
      ? options.filter((option) => option.isSelected)
      : [];

    const toggleOption = (id) => {
      const newArray = [...options];
      newArray[id].isSelected
        ? (newArray[id].isSelected = false)
        : (newArray[id].isSelected = true);
      getFilteredResult(name, newArray);
    };
    const { t: translate } = useTranslation();
    function showDropDown() {
      setFlag(!flag);
    }

    function show() {
      setFlag(false);
    }

    useEffect(() => {
      if (shouldShowDropDown) {
        setFlag(!shouldShowDropDown);
        getOutsideClick();
      }
    }, [shouldShowDropDown]);

    return (
      <div className="c-multi-select-dropdown w-full" ref={ref}>
        <button className="w-full" onClick={showDropDown}>
          <div
            className={`c-multi-select-dropdown__selected filter-title min-w-max p-2  border rounded-md text-regular text-xl 
          ${
            selected && selected.length === 0
              ? "border-gray-200 text-light-gray"
              : "text-primary-green border-primary-green"
          }`}
          >
            {selected.length ? (
              <span>
                {selected.length} {name}
              </span>
            ) : (
              <span>{name}</span>
            )}
            <IoIosArrowDown className="dropdown-inside-padding" />
          </div>
        </button>
        {flag ? (
          <ul className="c-multi-select-dropdown__options shadow border border-gray-200 rounded-md min-w-max font-normal">
            {options.map((option, index) => {
              return (
                <div key={option.id} onClick={() => toggleOption(index)}>
                  <li
                    className="c-multi-select-dropdown__option hover:bg-background-secondary text-black hover:text-primary-white border border-gray-200 rounded-md m-1 p-1 "
                    onClick={show}
                  >
                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        onChange={show}
                        checked={option.isSelected}
                        className="accent-primary-green c-multi-select-dropdown__option-checkbox"
                      ></input>
                      <div className="hoveritems text-regular text-xl whitespace-nowrap text-black hover:text-white">
                        {option.title}
                      </div>
                    </div>
                  </li>
                </div>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  }
);

export default FilterDropdown;
