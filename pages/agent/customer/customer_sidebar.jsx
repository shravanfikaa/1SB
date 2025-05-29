import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AGENT } from "../../../constants";

function CustomerSidebar(props) {
  const { t: translate } = useTranslation();
  return (
    <>
      <aside aria-label="Sidebar">
        <div className="overflow-y-auto h-screen p-6 bg-dark-gray rounded-xl ">
          <div
            className={`${
              props.id === "1" && "text-background-primary btn-gradient"
            } hover:cursor-pointer rounded-xl p-3`}
          >
            <Link
              href={{
                pathname: "/agent/customer/[customer_id]",
                query: { customer_id: props.customer_id },
              }}
              as="/agent/customer/[customer_id]"
            >
              <h1 className={`text-medium text-2xl ${props.id === "1" ? "text-white" : "text-black"}`}>
                {translate(AGENT.customerProfile)}
              </h1>
            </Link>
          </div>
          <div
            className={`${
              props.id === "2" && "text-background-primary btn-gradient"
            } hover:cursor-pointer rounded-xl p-3`}
          >
            <Link
              href={{
                pathname: "/agent/customer/[customer_id]/fds",
                query: { customer_id: props.customer_id },
              }}
              as="/agent/customer/[customer_id]/fds"
            >
              <h1 className={`text-medium text-2xl ${props.id === "2" ? "text-white" : "text-black"}`}>{translate(AGENT.customerFds)}</h1>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default CustomerSidebar;
