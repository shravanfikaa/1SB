import Link from "next/link";
import { getUserRole } from "../../lib/util";
import { AFTER_REVIEW, DETAIL_FD, MAKE_PAYMENT_FDS } from "../../constants";
import { useTranslation } from "react-i18next";  
function FDSidebar(props) {
  const role = getUserRole();
  const { t: translate } = useTranslation();
  return (
    <>
      <aside aria-label="Sidebar">
  <div className="overflow-y-auto h-screen p-6 bg-dark-gray rounded-xl">
    <div
      className={`${props.id === "1" && "text-background-primary btn-gradient"
        } hover:cursor-pointer rounded-xl p-3`}
    >
      <Link href="/my_profile/profile">
        <h1 className={`text-medium text-2xl ${props.id === "1" ? "text-white" : "text-black"}`}>
          {translate(DETAIL_FD.myProfile)}
        </h1>
      </Link>
    </div>

    <div
      className={`${props.id === "2" && "text-background-primary btn-gradient"
        } hover:cursor-pointer rounded-xl p-3`}
    >
      <Link href="/my_fds/fd">
        <h1 className={`text-medium text-2xl ${props.id === "2" ? "text-white" : "text-black"}`}>
          {translate(AFTER_REVIEW.myFds)}
        </h1>
      </Link>
    </div>

    {role?.toLowerCase() === "familyhead" && (
      <div
        className={`${props.id === "3" && "text-background-primary btn-gradient"
          } hover:cursor-pointer rounded-xl p-3`}
      >
        <Link href="/my_fds/fdBook">
          <h1 className={`text-medium text-2xl ${props.id === "3" ? "text-white" : "text-black"}`}>
            {translate(MAKE_PAYMENT_FDS.myFamilyFds)}
          </h1>
        </Link>
      </div>
    )}
  </div>
</aside>

    </>
  );
}

export default FDSidebar;
