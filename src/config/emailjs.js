// EmailJS config — reads from environment variables only
// Never hardcode credentials here

const EMAILJS_CONFIG = {
    SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID || "",
    TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "",
    PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "",
    DEV_MODE: process.env.REACT_APP_DEV_MODE === "true",
};

export default EMAILJS_CONFIG;
