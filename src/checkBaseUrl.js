export default function checkBaseUrl() {
    let env = process.env;
    let BACKEND_BASE_URL;
    let BACKEND_BASE_API_URL;


    BACKEND_BASE_URL = `${env.REACT_APP_PROTOCOL}://${env.REACT_APP_DOMAIN}:${env.REACT_APP_BACKEND_PORT}`;

    BACKEND_BASE_API_URL = `${BACKEND_BASE_URL}/api`;
    
    return { BACKEND_BASE_URL, BACKEND_BASE_API_URL };
}
