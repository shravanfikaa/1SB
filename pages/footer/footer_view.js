import React from "react";
import { SB_ADDRESS } from "../../constants";

const LocationIcon = () => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 384 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z">
      </path>
    </svg>
  )
}

function Footer() {
  return (
    <div as="footer" className="bg-footer-primary border-t-2 border-gray-100">
      <div className="view-container view_container_sm">
        <div className="flex flex-col items-center justify-between text-regular text-base text-light-gray">
          <div>
            <div className="flex gap-2 justify-center items-center text-medium text-xl text-black text-black">
              <a href={SB_ADDRESS.addressURL} target="_blank"><LocationIcon /></a>
              {SB_ADDRESS.addressDetails}
            </div>
          </div>
          <hr className="h-2" />
          <h2 className="text-black">
          <a target="_blank" href="https://1silverbullet.tech/">About Us</a> | <a href="/disclaimer">Disclaimer</a> | <a href="/terms">Terms and conditions</a> | <a href="/privacy">Privacy Policy</a>
            {/* <a target="_blank" href="https://1silverbullet.tech/">About Us</a> | <a href="/disclaimer">Disclaimer</a> | <a href="/terms">Terms and conditions</a> | <a href="/privacy">Privacy Policy</a> | <a target="_blank" href="https://1sb-artifacts.s3.ap-south-1.amazonaws.com/FD/TNC/USFB-TnC.pdf">Partner Bank TnC</a> */}
          </h2>
        </div>
      </div>
    </div >
  );
}

export default Footer;
