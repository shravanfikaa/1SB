
const apiVersion="api/v1"

const appConfig={
    "app_version": "1.0.0",
    "distributor_name":"1SB",
    "environment":"dev",
    "dev":{
        isSSOAuthEnabled:false,
        "baseUrl":"http://wealth-applicationlayer-alb-853536065.ap-south-1.elb.amazonaws.com/"+apiVersion,
        "dashboard":"",
        "login":"/login",
        //customer
        "getCustomer":"/customers?customer_pan=1234567890",
        "updateCustomer":"/customer",
        "createCustomer":"/customer",
        "getCustomerDetails":"/customer/details?user_id=",
        //products
        "getProducts":"/products?manufacturer_id=1&product_type=FD&product_id=1",
        "addProducts":"/products",
        "updateProducts":"/products",
        "getProductList":"/products/list?manufacturer_id=1",
        "getProductDetail":"/product/details?manufacturer_id=1&product_type=FD&product_id=1",
        //fds
        "viewFd":"/fd?user_id=",
          "updateFd":"/fd",
          "getAllFd":"/fds?user_id=",
          "bookFd":"/fd/book_fd",
          "commitFd":"/fd/commit",
          "withdrawFd":"/fd/closeWithdraw",
          "fdHistory":"/fd/history?user_id=&fd_id=2",
          "fdStatus":"/fdrStatus",
        //enablers
        "ckycVerification":"/ckyc",
        "generateOTP":"/otp/generate",
        "verifyOTP":"/otp/verify",
        "makePayment":"/payment",
        "repayment":"/rePayment",
        //manufacturer
        "getAllAttachedManufacturer":"/manufacturer?dictributor_id=1",
        //nominee
        "getNominee":"/nominee?user_id=",
        "addNominee":"/nominee",
        "updateNominee":"/nominee",
        "deleteNominee":"/nominee",
        //bank details
        "getBankDetail":"/bank_detail?user_id=",
        "addBankDetail":"/bank_detail",
        "updateBankDetail":"/bank_detail",
        "deleteBankDetail":"/bank_detail",
        "bankVerify":"/bank_detail",
          //tenure master
          "tenureMaster":"/tenuremaster",
    },
    "uat":{

        "baseUrl":"http://wealth-applicationlayer-alb-853536065.ap-south-1.elb.amazonaws.com/"+apiVersion,
        "dashboard":"",
        "login":"/login",
        //customer
        "getCustomer":"/customers?customer_pan=1234567890",
        "updateCustomer":"/customer",
        "createCustomer":"/customer",
        "getCustomerDetails":"/customer/details?user_id=",
        //products
        "getProducts":"/products?manufacturer_id=1&product_type=FD&product_id=1",
        "addProducts":"/products",
        "updateProducts":"/products",
        "getProductList":"/products/list?manufacturer_id=1",
        "getProductDetail":"/product/details?manufacturer_id=1&product_type=FD&product_id=1",
        //fds
        "viewFd":"/fd?costumer_id=1",
        "updateFd":"/fd",
        "getAllFd":"/fds?costumer_id=1",
        "bookFd":"/fd/book_fd",
        "commitFd":"/fd/commit_fd",
        "withdrawFd":"/fd/closeWithdraw",
        //enablers
        "ckycVerification":"/ckyc",
        "generateOTP":"/otp/generate",
        "verifyOTP":"/otp/verify",
        "makePayment":"/payment",
        //manufacturer
        "getAllAttachedManufacturer":"/manufacturer?dictributor_id=1",
        //nominee
        "getNominee":"/nominee?user_id=",
        "addNominee":"/nominee",
        "updateNominee":"/nominee",
        "deleteNominee":"/nominee",
        //bank details
        "getBankDetail":"/bank_detail?user_id=",
        "addBankDetail":"/bank_detail",
        "updateBankDetail":"/bank_detail",
        "deleteBankDetail":"/bank_detail",
        "bankVerify":"/bank_detail",
    },
    "prod":{
        "baseUrl":"http://wealth-applicationlayer-alb-853536065.ap-south-1.elb.amazonaws.com/"+apiVersion,
        "dashboard":"",
        "login":"/login",
        //customer
        "getCustomer":"/customers?customer_pan=1234567890",
        "updateCustomer":"/customer",
        "createCustomer":"/customer",
        "getCustomerDetails":"/customer/details?user_id=",
        //products
        "getProducts":"/products?manufacturer_id=1&product_type=FD&product_id=1",
        "addProducts":"/products",
        "updateProducts":"/products",
        "getProductList":"/products/list?manufacturer_id=1",
        "getProductDetail":"/product/details?manufacturer_id=1&product_type=FD&product_id=1",
        //fds
        "viewFd":"/fd?costumer_id=1",
        "updateFd":"/fd",
        "getAllFd":"/fds?costumer_id=1",
        "bookFd":"/fd/book_fd",
        "commitFd":"/fd/commit_fd",
        "withdrawFd":"/fd/closeWithdraw",
        //enablers
        "ckycVerification":"/ckyc",
        "generateOTP":"/otp/generate",
        "verifyOTP":"/otp/verify",
        "makePayment":"/payment",
        //manufacturer
        "getAllAttachedManufacturer":"/manufacturer?dictributor_id=1",
        //nominee
        "getNominee":"/nominee?user_id=",
        "addNominee":"/nominee",
        "updateNominee":"/nominee",
        "deleteNominee":"/nominee",
        //bank details
        "getBankDetail":"/bank_detail?user_id=",
        "addBankDetail":"/bank_detail",
        "updateBankDetail":"/bank_detail",
        "deleteBankDetail":"/bank_detail",
        "bankVerify":"/bank_detail",
    }
}
// function Configuration(){
//     return(
//         <div></div>
//     )
// }

export {appConfig}