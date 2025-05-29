
import CryptoJS from "crypto-js";

export const aes256_symmetric_encryption = (key, data) => {
    if (data) {
        try {
            console.info("KEY: ", key);
            if (!key || typeof key !== 'string') {
                throw new Error("Invalid key. Key must be a non-empty string.");
            }

            const secret_key = CryptoJS.enc.Utf8.parse(key);
            const iv = CryptoJS.enc.Utf8.parse('SgVkYp3s5v8y/B?E');
            const algo_mode = CryptoJS.mode.CBC;

            if (!data) {
                throw new Error("Invalid data. Data must be provided.");
            }

            const jsonString = JSON.stringify(data);
            const encrypted_data = CryptoJS.AES.encrypt(jsonString, secret_key, { iv: iv, mode: algo_mode });

            return encrypted_data.toString();
        } catch (error) {
            console.error("Encryption error:", error.message);
            throw error;
        }
    }

};

export const aes256_symmetric_decryption = (encrypted_data, key) => {
    if (encrypted_data) {
        try {
            if (!encrypted_data || !key || typeof key !== 'string') {
                throw new Error("Invalid input. Encrypted data and a valid secret key are required.");
            }

            const secret_key = CryptoJS.enc.Utf8.parse(key);
            const iv = CryptoJS.enc.Utf8.parse('SgVkYp3s5v8y/B?E');
            const algo_mode = CryptoJS.mode.CBC;
            const decrypted = CryptoJS.AES.decrypt(encrypted_data, secret_key, { iv: iv, mode: algo_mode });

            if (!decrypted) {
                throw new Error("Decryption failed. Please check the provided encrypted data and secret key.");
            }

            return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            console.error("Decryption error:", error.message);
            throw error;
        }
    }
};
