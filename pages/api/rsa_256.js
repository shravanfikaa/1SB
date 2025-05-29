// import forge from "forge";
import forge from "node-forge";


/**
 * A class representing RSA-256 asymmetric encryption. 
 * The class contains a constructor that sets the secret key to "public_key.pem".
 */
export const rsa256AsymmetricEncryption = (data) => {
  if (data) {
    const publicKeyContent = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyyacBmYcd7KX3RRBfLnl
    Z1u8X2lh0lI5m4vxhIw1FaUHY3m/fVYZpndRXCLswFBLX32WwkA7K+JRdaeLrMu7
    UhkoKYXOQa3ZESfO0O6YPKtJl6mD+VIs2ggUW5rRTWfDOjTbnmPMJLlyTIQRCzhG
    pkvg0/dzDQnWIcDyCqgxe6n7WMSoiEqgoPasTNdM0xgpT1XGJD0aLIlzcOt1AKcV
    DVPRjvV+JJarkKq3llCTru2zFzg+PZmimzRK+O9Z7YmYcJJKqzR+XP2kU7vTRGVA
    RUzpomuWWaTyB9ejKU/bOc9HwCLzd++63+ucaezBEOYcLDnUN8zFImtfM/tRxbON
    bQIDAQAB
    -----END PUBLIC KEY-----`;

    const public_key = forge.pki.publicKeyFromPem(publicKeyContent);
    const encryptedData = public_key.encrypt(data, "RSA-OAEP", {
      md: forge.md.sha256.create(),
      mgf1: forge.mgf1.create()
    });

    return forge.util.encode64(encryptedData);
  } else {
    return 'Encryption failed';
  }
};

// Function for asymmetric decryption
export const rsa256AsymmetricDecryption = (encryptedData) => {
  const privateKeyContent = ``;
  if (encryptedData && privateKeyContent) {
    const private_key = forge.pki.privateKeyFromPem(privateKeyContent);
    const decryptedData = private_key.decrypt(forge.util.decode64(encryptedData), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: forge.mgf1.create(),
    });

    return decryptedData;
  } else {
    return 'Decryption failed';
  }
};

// read_public_key(){
//     // var xmlhttp = new XMLHttpRequest();
//     // xmlhttp.open("GET",this.secret_key,false);
//     // xmlhttp.send();
//     // return xmlhttp.responseText;
//     var public_key = "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyyacBmYcd7KX3RRBfLnlZ1u8X2lh0lI5m4vxhIw1FaUHY3m/fVYZpndRXCLswFBLX32WwkA7K+JRdaeLrMu7UhkoKYXOQa3ZESfO0O6YPKtJl6mD+VIs2ggUW5rRTWfDOjTbnmPMJLlyTIQRCzhGpkvg0/dzDQnWIcDyCqgxe6n7WMSoiEqgoPasTNdM0xgpT1XGJD0aLIlzcOt1AKcVDVPRjvV+JJarkKq3llCTru2zFzg+PZmimzRK+O9Z7YmYcJJKqzR+XP2kU7vTRGVARUzpomuWWaTyB9ejKU/bOc9HwCLzd++63+ucaezBEOYcLDnUN8zFImtfM/tRxbONbQIDAQAB-----END PUBLIC KEY-----"
//     return public_key
// }

/**
 * Encrypts the given data using RSA-256 encryption with the public key stored in the object.
 * param {string} data - The data to be encrypted.
 * returns {string} The encrypted data encoded in base64.
//  */
// rsa_256_encrypt(data){
//         var public_key = forge.pki.publicKeyFromPem(this.read_public_key());
//         var encrypted_data = public_key.encrypt(data, "RSA-OAEP", {
//             md: forge.md.sha256.create(),
//             mgf1: forge.mgf1.create()
//         });
//         return forge.util.encode64(encrypted_data);
//     }

// }

// export {RSA256AsymmetricEncryption};
