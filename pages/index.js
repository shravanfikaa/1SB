import Dashboard from "./product/product_list";
import appConfig from "../app.config";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


export default function Home() {
  const { t: translate } = useTranslation();
  const [clevertapModule, setClevertapModule] = useState(null)

  const clevertapInit = async () => {
    let clevertap = clevertapModule
    if (!clevertap && typeof window !== 'undefined') {
      clevertap = await initializeClevertap()
      
    }
  }

  useEffect(() => {
    const host = window.location.host;
    const src = window.location.search;
    const urlParams = new URLSearchParams(src);

    if (
      host.indexOf("localhost") != -1 ||
      host.indexOf("127.0.0.1") != -1 ||
      host.indexOf("dev") != -1
    ) {
      appConfig.environment = "dev";
    } else if (host.indexOf("test") != -1) {
      appConfig.environment = "test";
    } else if (host.indexOf("demo") != -1) {
      appConfig.environment = "demo";
    }

    const accessToken = urlParams.get("accessToken");
    // const distributerLogoPath = new URLSearchParams(src).get("distributerLogoPath");
    // distributerLogoPath && sessionStorage.setItem("distributerLogoPath", distributerLogoPath);
    accessToken && sessionStorage.setItem("authorizationToken", accessToken);
    if (src.includes("utm")) {
      const utm_source = urlParams.get("utm_source") || '';
      const utm_campaign = urlParams.get("utm_campaign") || '';
      const utm_content = urlParams.get("utm_content") || '';
      const utm_medium = urlParams.get("utm_medium") || '';
      
      const UTMPARAMS = {
        utm_source,
        utm_campaign,
        utm_content,
        utm_medium
      }

      sessionStorage.setItem("UTMPARAMS", JSON.stringify(UTMPARAMS));
    }
    if (appConfig) {
      const { eventLogger } = appConfig;
      eventLogger && clevertapInit();
    }
  }, []);

  return <div>
    <Dashboard />
  </div>;
}

async function initializeClevertap() {
  const clevertapModule = await import('clevertap-web-sdk')

  clevertapModule.default.init(appConfig.cleverTapAccountID, "in1")
  clevertapModule.default.privacy.push({ optOut: false })
  clevertapModule.default.privacy.push({ useIP: false })
  clevertapModule.default.setLogLevel(3)

  return clevertapModule.default
}
