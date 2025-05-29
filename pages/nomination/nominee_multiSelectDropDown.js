import { IoIosArrowDown } from "react-icons/io";
import { forwardRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const NomineeMultiSelectDropdown = forwardRef(({ options, selected, toggleOption, name, shouldShowDropDown, getOutsideClick }, ref) => {
  const [flag, setFlag] = useState(false);
  const [selectCount, setSelectCount] = useState(0);
  const { t: translate } = useTranslation();
  function showDropDown() {
    setFlag(!flag);
  }

  function hideDropdown() {
    setFlag(false);
  }

  useEffect(() => {
    const count = options.filter((option) => selected.includes(option.id)).length;
    setSelectCount(count);
  })

  useEffect(() => {
    if (shouldShowDropDown) {
      setFlag(!shouldShowDropDown);
      getOutsideClick();
    }
  }, [shouldShowDropDown]);

  return (
    <div className="c-multi-select-dropdown font-small w-fit text-regular text-2xl" ref={ref}>
      <button onClick={showDropDown}>
        <div className={
          `c-multi-select-dropdown__selected filter-title min-w-max p-2 shadow border rounded text-regular text-2xl
          ${selected && selected.length === 0 ?
            "border-gray-200 text-light-gray" :
            "text-primary-green border-primary-green"}`
        }>
          {selectCount ? (
            selectCount === 0 ? (
              <span>{name}</span>
            ) : (
              <span>
                {selectCount} {"Nominee selected"}
              </span>
            )
          ) : (
            <span onClick={showDropDown}>{name}</span>
          )}
          <IoIosArrowDown className="ml-9" />
        </div>
      </button>
      {flag ? (
        <ul className="c-multi-select-dropdown__options shadow border border-gray-200 rounded-md min-w-max">
          {options.map((option) => {
            const { id, title } = option;
            const isSelected = selected.includes(id);
            return (
              <div
                key={id}
                onClick={() => toggleOption(id)}
              >
                <li
                  className="c-multi-select-dropdown__option hover:bg-background-secondary border  text-black border-gray-200 rounded-md m-1 p-1 "
                  onClick={hideDropdown}
                >
                  <div className="flex gap-1">
                    <div>
                      <input
                        type="checkbox"
                        onChange={hideDropdown}
                        checked={isSelected}
                        className="accent-primary-green c-multi-select-dropdown__option-checkbox mr-2"
                      />
                    </div>
                    <span className="text-regular text-2xl text-black ">
                      {title}
                    </span>
                  </div>
                </li>
              </div>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
});

export default NomineeMultiSelectDropdown;
