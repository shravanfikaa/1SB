import { dateFormat, isFeatureForRoleBaseOperation } from '../../lib/util';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaUserAlt } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { AGENT, COMMON_CONSTANTS } from '../../constants';
import { IoIosAdd } from 'react-icons/io';
import { IoEyeSharp } from "react-icons/io5";

function DashboardCard({ props }) {
  const [addNewProduct, setAddNewProduct] = useState(1);
  const { t: translate } = useTranslation();
  function setCustomerIDHandler() {
    const data = sessionStorage.getItem("rm_customer_data");
    if (JSON.parse(data)) {
      const { customer_id } = JSON.parse(data)
      if (customer_id !== props?.customer_id) {
        sessionStorage.setItem("rm_new_customer_data", true);
      } else {
        sessionStorage.setItem("rm_new_customer_data", false);
      }
    }
    sessionStorage.setItem("rm_customer_data", JSON.stringify(props));
  }

  useEffect(() => {
    setAddNewProduct(isFeatureForRoleBaseOperation("AddNewProduct"));
  }, []);

  return (
    <div>
      {props ?
        <div key={props.id}>
          <div className='flex flex-row flex-wrap justify-between border-b my-5 pb-2 w-full text-xl text-regular'>
            <div className='flex flex-row gap-3 w-1/3'>
              <div className=''>
                {
                  props?.profile_image ? <img
                    src={`data:image/png;base64, ${props.profile_image}`}
                    className="h-[50px] w-[50px] border-1 rounded-full object-contain"
                    alt="Profile Image"
                  /> : <FaUserAlt className="text-fd-primary" size={"50px"} />
                }
              </div>
              <div className='flex flex-col break-words w-10/12'>
                <div className='text-fd-primary cursor-pointer'>
                  <Link
                    href={{
                      pathname: "/agent/customer/[customer_id]",
                      query: { customer_id: props.customer_id },
                    }}
                    as="/agent/customer/[customer_id]">
                    <p className='hyphens-auto'>
                      {props.first_name}
                    </p>
                  </Link>
                </div>
                <div className='text-light-gray'>{props.mobile_number}</div>
                <div className='text-light-gray'>{props.email_id}</div>
              </div>
            </div>
            <div className='flex flex-col w-1/4'>
              <div className='flex flex-row justify-between'>
                <div className='w-1/3 text-light-gray'>{translate(COMMON_CONSTANTS.issuer)}</div>
                <div className='w-2/3  text-black'>
                  {props.manufacturer_name}
                </div>
              </div>
              <div className='flex flex-row justify-between'>
                <div className='w-1/3 text-light-gray'>{translate(AGENT.fdName)}</div>
                <div className='w-2/3 break-words text-black'>
                  {props.fd_name}
                </div>
              </div>
            </div>
            <div className='flex flex-col w-1/5'>
              <div className='flex flex-row justify-between gap-2'>
                <div className='w-1/2 text-light-gray'>{translate(AGENT.dateOfBooking)}</div>
                <div className='w-1/2 text-black'>{dateFormat(props.fd_booking_date)}</div>
              </div>
              <div className='flex flex-row justify-between gap-2'>
                <div className='w-1/2 text-light-gray'>{translate(AGENT.status)}</div>
                <div className='w-1/2 capitalize text-fd-primary'>
                  {props.status}
                </div>
              </div>
            </div>
            <div className='w-1/10'>
              <div className='flex  gap-2'>
                {addNewProduct ? <Link
                  href={{
                    pathname: "/product/product_list"
                  }}
                >
                  <button
                    className='button-active btn-gradient button-transition p-2 hover:bg-hover-primary text-md hover:button-shadow'
                    onClick={() => setCustomerIDHandler()}
                  >
                    <IoIosAdd fill='#ffff' width={'20px'} height={'20px'} />
                    {/* {translate(AGENT.addProduct)} */}
                  </button>
                </Link> : null}
                <div className=''>
                  <Link
                    href={{
                      pathname: "/agent/customer/[customer_id]",
                      query: { customer_id: props.customer_id },
                    }}
                    passHref
                    as="/agent/customer/[customer_id]"
                  >
                    <button className="button-passive border-fd-primary p-2 text-fd-primary w-full h-fit  text-base" id={props.customer_id}> <IoEyeSharp width={'20px'} height={'20px'}/>
                    {/* {translate(AGENT.view)} */}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        : null
      }
    </div >
  );
}

export default DashboardCard;