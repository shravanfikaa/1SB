import { IoMdDownload } from "react-icons/io";
import { forwardRef, useState, useEffect } from "react";
import { COMPONENTS, DOWNLOAD_OPTIONS } from "../constants";
import { useTranslation } from "react-i18next";

const Download = forwardRef(
  (
    { getDownloadOption, isEnabled, shouldShowDropDown, getOutsideClick },
    ref
  ) => {
    const [flag, setFlag] = useState(false);

    const toggleOption = (option) => {
      getDownloadOption(option);
    };

    function toggleDropdown() {
      setFlag(!flag);
    }

    useEffect(() => {
      if (shouldShowDropDown) {
        setFlag(!shouldShowDropDown);
        getOutsideClick();
      }
    }, [shouldShowDropDown]);
    const { t: translate } = useTranslation();

    return (
      <div className="c-multi-select-dropdown w-fit" ref={ref}>
        <button
          className={(isEnabled) ? "button-active  button-transition  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " :"button-active  button-transition btn-gradient text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "}
          onClick={toggleDropdown}
          disabled={isEnabled}
        >
          <IoMdDownload />
          {translate(COMPONENTS.download)}
        </button>
        {flag ? (
          <ul className="c-multi-select-dropdown__options shadow border border-gray-200 ">
            {Object.keys(DOWNLOAD_OPTIONS).map((option, index) => {
              return (
                <div key={index} onClick={() => toggleOption(option)}>
                  <li
                    className="c-multi-select-dropdown__option hover:bg-background-secondary rounded p-0"
                    onClick={() => setFlag(false)}
                  >
                    <div className="flex gap-2 justify-center">
                      <div className="hoveritems text-regular text-xl whitespace-nowrap text-black hover:text-white p-1">
                        {translate(DOWNLOAD_OPTIONS[option])}
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

const DownloadDropdown = forwardRef(({ getDownloadOption, isEnabled }, ref) => {
  const MOUSE_UP = "mouseup";
  const [outsideClick, setOutsideClick] = useState(false);

  const getOutsideClick = () => {
    setOutsideClick(false);
  };

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
      <Download
        getDownloadOption={getDownloadOption}
        isEnabled={isEnabled}
        shouldShowDropDown={outsideClick}
        getOutsideClick={getOutsideClick}
        ref={ref}
      />
    </>
  );
});

export default DownloadDropdown;
