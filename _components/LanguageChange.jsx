import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { TbLanguageHiragana } from "react-icons/tb";

const LanguageChange = () => {
  const { t: translate } = useTranslation();
  const { i18n } = useTranslation();
  const router = useRouter();
  const { locale, asPath } = router;
  const [selectedLang, setSelectedLang] = useState("en");
  const [path, setPath] = useState();
  useEffect(() => {
    if (router) {
      
      const { pathname } = router;
      setPath(pathname)
    }

  }, [router])
  // Handle language change
  const handleChangeLanguage = (event) => {
    const selectedLocale = event.target.value;
    setSelectedLang(selectedLocale)
    sessionStorage.setItem("lang", selectedLocale)
    i18n.changeLanguage(selectedLocale);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { language } = i18n;
      sessionStorage.setItem("lang", language)
      setSelectedLang(language)
    }
  }, [])

  return (
    <div className='flex gap-2 items-center '>
      <TbLanguageHiragana className='text-fd-primary cursor-pointer' />
      <select
      className='text-black'
        value={selectedLang}
        onChange={handleChangeLanguage}
        aria-label="Select language"
        name="selectedLang"
        style={{ fontFamily: 'Segoe UI' }}
        disabled={path ? !(path === "/" || path === "/product/product_list" || path === "/user/login") : ""}
      >
        <option value="en">English</option>
        {/* <option value="mr">मराठी</option> */}
        {/* <option value="gr">ગુજરાતી</option> */}
        <option value="hi">हिंदी</option>
        {/* <option value="te">తెలుగు</option> */}
      </select>
    </div>
  );
};

export default LanguageChange;
