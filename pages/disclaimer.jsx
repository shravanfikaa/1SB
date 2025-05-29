import React from "react";
import NavBarMain from "./navbar/NavBarMain";
// import FAQList from "./FAQ/faqList";

function Disclaimer() {
  return (
    <>
      <div className="max-w-screen">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <NavBarMain />
      </div>
      <div className="flex flex-col justify-center page-background">
        <div className="flex justify-center py-2 text-medium text-bold text-7xl text-black">
        Disclaimer
        </div>
        <div className="flex justify-center">
          <div className="w-[824px]">
             {/* <FAQList style={{heading:"text-3xl", subHeading: "text-xl"}}/> */}
             <div style={{heading:"text-3xl", subHeading: "text-xl"}}>
        <p className="text-3xl text-medium">Legal Disclaimer</p>
        <p  className="text-xl break-normal text-regular py-4">Please read these terms and conditions carefully. By accessing this site and any pages thereof, you agree to be bound by the terms and conditions below. If you do not agree to the terms and conditions below, do not access this site or any pages thereof.</p>

        <p className="text-3xl text-medium">Copyright</p>
        <p  className="text-xl break-normal text-regular py-4">1Silverbullet Platforms Private Limited 2019. All rights reserved.</p>
        <p className="text-xl break-normal text-regular" >Copyright in the pages, mobile apps and in the screens displaying the pages, and in the information and material therein and in their arrangement, is owned by 1Silverbullet Platforms Private Limited, unless otherwise indicated.</p>
        <p  className="text-xl break-normal text-regular py-4">Except as specifically permitted herein, no portion of the Information on this Website may be reproduced in any form or by any means without the prior written permission from 1Silverbullet Platforms Private Limited.</p>

        <p className="text-3xl text-medium">Trademarks</p>
        <p  className="text-xl break-normal text-regular py-4">1Silverbullet Platforms Private Limited, 1Silverbullet, www.1silverbullet.tech and the logo are registered trademarks and service marks. 1Silverbullet Platforms Private Limited may also claim trademark and service mark rights in other marks contained in the pages.</p>
        <p className=" text-xl break-normal text-regular pb-4">Except as specifically permitted herein, these Trademarks may not be used without the prior written permission from 1Silverbullet Platforms Private Limited. All other trademarks not owned by 1Silverbullet Platforms Private Limited that appear on this website are the property of their respective owners, who may or may not be affiliated with, connected to, or sponsored by 1Silverbullet Platforms Private Limited.</p>

        <p className="text-3xl text-medium">Limitation of Liability</p>
        <p  className="text-xl break-normal text-regular py-4">In no event will 1Silverbullet Platforms Private Limited be liable for any damages, including without limitation direct or indirect, special, incidental, or consequential damages, losses or expenses arising in connection with this site, mobile app or use thereof or inability to use by any party, or in connection with any failure of performance, error, omission, interruption, defect, delay in operation or transmission, computer virus or line or system failure, even if 1Silverbullet Platforms Private Limited, or representatives thereof, are advised of the possibility of such damages, losses or expenses.</p>
        <p className=" text-xl break-normal text-regular pb-4">Hyperlinks to other internet resources are at your own risk; the content, accuracy, opinions expressed, and other links provided by these resources are not investigated, verified, monitored, or endorsed by 1Silverbullet Platforms Private Limited.</p>

        <p className="text-3xl text-medium">No Warranty</p>
        <p  className="text-xl break-normal text-regular py-4">The information and materials contained in this site, including text, graphics, links or other items - are provided "as is," "as available". 1Silverbullet Platforms Private Limited does not warrant the accuracy, adequacy or completeness of this information and materials and expressly disclaims liability for errors or omissions in this information and materials.</p>

        <p className="text-3xl text-medium">Governing Law</p>
        <p  className="text-xl break-normal text-regular py-4">By accessing this Website and mobile applications, you agree that the foregoing as well as any dispute raised regarding the Website, Mobile Applications or 1Silverbullet Platforms Private Limited (in relation to this Website or Mobile app) is subject to the laws of the Republic of India and the High Court of Maharashtra at Mumbai, India shall have the exclusive jurisdiction on any dispute that may arise out of the use of this Website.</p>

        <p className="text-3xl text-medium">Indemnification</p>
        <p  className="text-xl break-normal text-regular py-4">By accepting this Disclaimer, you agree to indemnify, defend and otherwise hold harmless 1Silverbullet Platforms Private Limited, its officers, owners, employees, agents, subsidiaries, affiliates and other partners from any direct, indirect, incidental, special, consequential or exemplary damages resulting from:</p>
        <ul className="flex flex-col text-justify list-disc items-start ml-10 pb-4">
            <li  className="text-xl break-normal text-regular ">Your use of the Website and Mobile applications.</li>
            <li  className="text-xl break-normal text-regular ">Your breach of the Terms & Conditions, Disclaimer and privacy policy or documents they incorporate by reference, or your violation of any law, rules or regulation.</li>
            <li  className="text-xl break-normal text-regular ">Any other matter relating to this Website.</li>
        </ul>
    </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
