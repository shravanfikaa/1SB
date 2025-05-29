import { IoIosArrowDown } from "react-icons/io"
import { forwardRef, useEffect, useState } from "react";

const MultiSelectDropdown = forwardRef(({ options, selected, toggleOption, name, shouldShowDropDown, getOutsideClick }, ref) => {
  const [flag, setFlag] = useState(false);

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
    <div className="c-multi-select-dropdown w-full " ref={ref}>
      <button className="w-full" onClick={showDropDown}>
        <div
          className={
            `c-multi-select-dropdown__selected filter-title  bg-white min-w-max p-2  border rounded-xl text-regular text-xl 
          ${selected && selected.length === 0 ?
              "border-gray-200 text-light-gray" :
              "text-primary-green border-primary-green"}`
          }
        >
          {
            selected ? selected.length === 0 ? <span>{name}</span> : <span>{selected.length} {name}</span> : <span>{name}</span>
          }
          <IoIosArrowDown className="dropdown-inside-padding" />
        </div>
      </button>
      {
        flag ?
          <ul className="c-multi-select-dropdown__options shadow border border-gray-200 rounded-md min-w-max font-normal">
            {options.map(option => {
              const isSelected = selected.includes(option.id);
              const title = option.title.toLowerCase();
              return (
                <div key={option.id} onClick={() => toggleOption({ id: option.id })}>
                  <li className="c-multi-select-dropdown__option text-black hover:text-white hover:bg-background-secondary hover:text-primary-white border border-gray-200 rounded-md m-1 p-1 " onClick={show}>
                    <div className="flex gap-2">
                      <input type="checkbox" onChange={show} checked={isSelected} className="accent-primary-green c-multi-select-dropdown__option-checkbox"></input>
                      <div className="text-regular capitalize text-xl whitespace-nowrap" >{title}</div>
                    </div>
                  </li>
                </div>
              )
            })}
          </ul>
          : null
      }
    </div>
  )
})

export default MultiSelectDropdown;
