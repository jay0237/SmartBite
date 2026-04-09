const crypto = require("crypto");

const generateOTP = () => {
    // Cryptographically secure 6-digit OTP
    return String(100000 + (crypto.randomInt(0, 900000)));
};

module.exports = generateOTP;
