import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; 
import Link from 'next/link'
import { AFTER_REVIEW, DETAIL_FD } from "../../constants";
function Aside(props) {
  const [activeProfile, setActiveProfile] = useState(false)
  const [activeFds, setActiveFds] = useState(false)
  const { t: translate } = useTranslation();
  useEffect(() => {
    if (props.id == "1") {
      setActiveProfile(true)
      setActiveFds(false)
    }
    else {
      setActiveFds(true)
      setActiveProfile(false)
    }



  })
  return (
    <div>
      <aside className="w-1/12 fixed space-y-2 bg-slate-100">
        {
          activeProfile ?
            <div className=" py-2 pl-2 bg-gray-200 hover:cursor-pointer border border-gray-200 rounded">
              <Link href="/my_profile/profile">
                <h1

                  className="text-base text-black font-semibold"
                >
                  {translate(DETAIL_FD.myProfile)}
                </h1>
              </Link>
            </div>
            :
            <div className="hover:cursor-pointer rounded">
              <Link href="/my_profile/profile">
                <h1

                  className=" pl-2 text-base text-gray-500 font-bold"
                >
                  {translate(DETAIL_FD.myProfile)}
                </h1>
              </Link>
            </div>
        }

        {
          activeFds ?
            <div className=" py-2 pl-2 bg-gray-200 hover:cursor-pointer border border-gray-200 rounded">
              <Link href="/my_fds/fd">
                <h1

                  className="text-base text-black font-semibold"
                >
                   {translate(AFTER_REVIEW.myFds)} 
                </h1>
              </Link>
            </div>
            :
            <div className="hover:cursor-pointer rounded">
              <Link href="/my_fds/fd">
                <h1

                  className=" pl-2 text-base text-gray-500 font-bold"
                >
                   {translate(AFTER_REVIEW.myFds)} 
                </h1>
              </Link>
            </div>
        }
      </aside>
    </div>
  )
}
export default Aside;