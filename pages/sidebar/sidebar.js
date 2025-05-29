import { RiCheckboxFill } from "react-icons/ri"
import { BiCheckboxSquare } from "react-icons/bi"
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { useTranslation } from "react-i18next"
import { SIDEBAR } from "../../constants"
function SideBar(props) {
  let currentComponentID = 0
  for (let i = 0; i < props.sideBarList?.length; i++) {
    if (props.compName == props.sideBarList[i]["link"]) {
      sessionStorage.setItem("CurruntPage", props.compName)
      currentComponentID = props.sideBarList[i]["id"]
    }
  }
  const { t: translate } = useTranslation();
  return (
    <aside aria-label="Sidebar" className="sticky top-[1rem]">
      <div className="overflow-y-auto h-screen p-6 bg-dark-gray rounded-xl ">
        <ul className="space-y-2">
          {props.sideBarList && props.sideBarList.map((list) => {
            return (
              <div className={list["parent_id"] == 1 ? 'pl-3' : ''}>
                <div
                  className={`cursor-auto flex gap-2 items-center sidebar-padding ${currentComponentID === list["id"] ? 'btn-gradient text-white rounded-lg' : ''
                    }`}
                >
                  <div>
                    {currentComponentID > list["id"] ? (
                      <RiCheckboxFill className="text-primary-white fill-fd-primary" />
                    ) : currentComponentID === list["id"] ? (
                      <BiCheckboxSquare className="text-primary-white fill-white" />
                    ) : currentComponentID < list["id"] ? (
                      <MdOutlineCheckBoxOutlineBlank className="text-primary-white fill-primary-green" />
                    ) : (
                      ""
                    )}
                  </div>
                  <button
                    type="button"
                    className={
                       
                      list["parent_id"] == 1
                        ? currentComponentID === list["id"] ? 'text-medium text-xl text-white': 'text-medium text-xl text-black'
                        : currentComponentID === list["id"] ? 'text-medium text-xl text-white': 'text-medium text-xl text-black'
                    }
                    onClick={(e) => props.handle2(list["link"], e)}
                  >
                    {translate(SIDEBAR[list["label"]])}
                  </button>
                </div>
              </div>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default SideBar;
