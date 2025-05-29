import { useTranslation } from "react-i18next";
import styles from "../../../styles/fd.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { AGENT } from "../../../constants";
function CustomerBreadCrumb() {
  const { t: translate } = useTranslation();
  return (
    <div
      className={`mx-w-full flex gap-3 justify-left items-center page-background view-container view_container_sm pb-0 ${styles.settingHeader}`}
    >
      <div
        className="w-[46px] h-[32px] border border-[#4A4ED4] rounded-full flex justify-center items-center cursor-pointer color-[#1e1d83]"
        onClick={() => {
          window.location.href = window.origin + "/agent/customers";
        }}
      >
        <IoIosArrowBack className="text-fd-primary" />
      </div>
      <div className="text-medium text-black text-3xl">{translate(AGENT.customerDetails)}</div>
    </div>
  );
}

export default CustomerBreadCrumb;
