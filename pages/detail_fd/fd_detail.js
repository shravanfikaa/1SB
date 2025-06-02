import { useRouter } from "next/router";
import FDProductInfo from "./fd_product_info";
import NavBarMain from "../navbar/NavBarMain";
import { useTranslation } from "react-i18next";

function DetailedFD() {
  const router = useRouter();
  const queryData = router.query;
  const { t: translate } = useTranslation();

  return (
    <div>
      

      <script
        src="https://kit.fontawesome.com/a59b9b09ab.js"
        crossorigin="anonymous"
      ></script>
      <script src="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.js"></script>
      <link rel="stylesheet" href="style.css" />
      <NavBarMain />
      <div className="view-container view_container_sm page-background ">
        {queryData ? <FDProductInfo productInfo={queryData} /> : null}
      </div>
    </div>
  );
}

export default DetailedFD;
