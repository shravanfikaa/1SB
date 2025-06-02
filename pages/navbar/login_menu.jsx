import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaUserAlt } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import { getUserRole } from "../../lib/util";
import { AFTER_REVIEW, AGENT, DETAIL_FD } from "../../constants";
import { useTranslation } from "react-i18next";  
function LoginMenu() {
  const role = getUserRole();
  const { t: translate } = useTranslation();
  return (
    <Menu as="div" className="ml-3 relative z-8">
      <div>
        <Menu.Button
          type="button"
          className="p-3 shadow-lg rounded-full border-fd-primary border text-black hover:text-gray focus:outline-none"
        >
          <div className="flex flex-row space-x-1">
            {/* <FaUserAlt className="text-fd-primary" /> */}
            <IoIosArrowDown className="text-fd-primary" />
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 z-10 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            <Link href="/my_profile/profile">
              <span className="block border border-gray-200 rounded-md m-1 p-1 text-xl text-gray-700 cursor-pointer hover:bg-background-secondary hover:text-white">
                {translate(DETAIL_FD.myProfile)}
              </span>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/my_fds/fd">
              <span className="block border border-gray-200 rounded-md m-1 p-1 text-xl text-gray-700 cursor-pointer hover:bg-background-secondary hover:text-white">{translate(AFTER_REVIEW.myFds)} </span>
            </Link>
          </Menu.Item>
          {
            role?.toLowerCase() === "familyhead" ?
              <Menu.Item>
                <Link href="/my_fds/fdBook">
                  <span className="block border border-gray-200 rounded-md m-1 p-1 text-xl text-gray-700 cursor-pointer hover:bg-background-secondary hover:text-white">My Family FDs</span>
                </Link>
              </Menu.Item>
              : null
          }
          <Menu.Item>
            <Link href="https://app-uat.fikaa.in/home/mutual_fund">
              <span onClick={()=>{sessionStorage.setItem("route",window.location.pathname); }} className="block border border-gray-200 rounded-md m-1 p-1 text-xl text-gray-700 cursor-pointer hover:bg-background-secondary hover:text-white">{translate(AGENT.signOut)}</span>
            </Link>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default LoginMenu;
