import { useTranslation } from "react-i18next";
import NavBarMain from "../navbar/NavBarMain";
import Filter from "./filter";

function Dashboard() {
  const { t: translate } = useTranslation();
  return (
    <div className="max-w-screen">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <NavBarMain />
      <div className="page-background text-apercu-medium view-container view_container_sm">
      <Filter screenType="dashboard" />
      </div>
      
    </div>
  );
}
export default Dashboard;
