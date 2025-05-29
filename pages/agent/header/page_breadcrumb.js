import { useEffect, useState } from 'react';
import styles from '../../../styles/fd.module.css';
import AddNewUserPopup from '../user/addNewUserPopup';
import { isFeatureForRoleBaseOperation } from '../../../lib/util';
import { AGENT } from '../../../constants';
import { useTranslation } from 'react-i18next';

function SetBreadCrumb({ componentType }) {
  const [displayAddNewUserPopup, setDisplayAddNewUserPopup] = useState(false);
  const [addNewCustomer, setAddNewCustomer] = useState(1);
  const toggleAddNewUserPopup = () => setDisplayAddNewUserPopup(!displayAddNewUserPopup);
  const { t: translate } = useTranslation();
  // useEffect(() => {
  //   setAddNewCustomer(isFeatureForRoleBaseOperation("AddNewCustomer"));
  // }, []);

  return (
    <div className={`mx-w-full flex justify-between page-background  view-container view_container_sm text-regular pb-0 ${styles.settingHeader}`}>
      <div className="text-medium text-black text-3xl">
        {translate(AGENT.dashboard)}
      </div>
      {componentType === 'FdList' && addNewCustomer ?
        < button className="button-active btn-gradient w-fit p-2 text-xl button-transition hover:bg-hover-primary" onClick={() => setDisplayAddNewUserPopup(true)}>
          <span className='text-xxxl mr-2'>+</span> {translate(AGENT.addNewcustomer)}
        </button> : null
      }
      {displayAddNewUserPopup && <AddNewUserPopup updateModalState={toggleAddNewUserPopup} />}
    </div >
  );
}

export default SetBreadCrumb;
