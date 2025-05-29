import { useTranslation } from 'react-i18next';
import { PARENT_DETAILS_PAYMENT } from '../../constants';
import styles from '../../styles/fd.module.css';

function Setting() {
  const { t: translate } = useTranslation();
  return (
    <div className={`mx-w-full bg-slate-100 page-background view-container view_container_sm pb-0 ${styles.settingHeader}`}>
      <div className="text-medium text-black text-3xl">
        {translate(PARENT_DETAILS_PAYMENT.Settings)}
      </div>
    </div>
  );
}

export default Setting;
