import emailjs from "emailjs-com";
import EMAILJS_CONFIG from "../config/emailjs";

// Initialize EmailJS once when this module loads
if (EMAILJS_CONFIG.PUBLIC_KEY) {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

/**
 * Generate a cryptographically random 6-digit OTP.
 */
export const generateOTP = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return String(100000 + (array[0] % 900000));
};

/**
 * Send OTP email via EmailJS.
 */
export const sendOTPEmail = async (toEmail, toName, otpCode) => {
    const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } = EMAILJS_CONFIG;

    // If credentials missing → dev mode (log to console only)
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.info(
            "%c[Smart Bite — Dev Mode OTP]",
            "color:#111111;font-weight:bold;font-size:14px",
            `\nEmail : ${toEmail}\nOTP   : ${otpCode}`
        );
        await new Promise((r) => setTimeout(r, 800));
        return { success: true, devMode: true };
    }

    try {
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            {
                to_email: toEmail,
                to_name: toName,
                otp_code: otpCode,
                app_name: "Smart Bite",
            }
            // NOTE: do NOT pass PUBLIC_KEY here — it's set via init() above
        );

        console.log("[EmailJS] sent:", response.status, response.text);
        return { success: true, devMode: false };

    } catch (err) {
        // Log the full error so we can see exactly what EmailJS rejected
        console.error("[EmailJS] error →", JSON.stringify(err));
        return { success: false, devMode: false, error: err };
    }
};
