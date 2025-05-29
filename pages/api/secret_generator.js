
/**
 * A class that generates a secret string of random characters.
//  * @constructor
//  * @param {number} [secret_bit=32] - The length of the secret string to generate.
//  * @property {number} secret_bit - The length of the secret string to generate.
//  * @property {string} random_string - The string of characters to use when generating the secret.
 */

function generate_secret_key() {
    let secret_bit=32;
    const random_string = "abcdefghijklmnopqrstuvwxyz1234567890".split("");
    var secret=""; 
    for(var i=0;i<secret_bit;i++){
        secret += random_string[Math.floor(Math.random()*random_string.length)];
    }
    return secret; //Will return a 32 bit "hash"
    // return "dtm0v47aazym5f501dni1tri2tvfkght"
}

export {generate_secret_key};
//     constructor(secret_bit=32) {
//         this.secret_bit=secret_bit
//         this.random_string = "abcdefghijklmnopqrstuvwxyz1234567890"
//     }
//     /**
//      * Generates a secret key by selecting random characters from a given string.
//      * @returns {string} - The generated secret key.
//      */
    
// }