// Function to assemble request options including header with token authorization

const fetch = require("node-fetch")

async function getRequestOptions() {

    let token = await getTokenFromServiceAccount()

    const requestHeader = { 
        Accept: "*/*", 
        Authorization: "Bearer " + token, 
        'User-Agent': "python-requests/2.25.0", 
        "Accept-Encoding": "gzip, deflate", 
        'Connection': 'keep-alive' };
        
    const requestOptions = {headers: requestHeader};
    return requestOptions;
}

async function getTokenFromServiceAccount() {

    let endpointURL = "https://iam.ebrains.eu/auth/realms/hbp/protocol/openid-connect/token";
    let secret = process.env.OIDC_CLIENT_SECRET;

    let body = "grant_type=client_credentials&client_id=ebrains-wizard-dev&client_secret=" + secret + "&scope=email%20profile%20team%20group";
    
    let requestOptions = {
	    method: 'post',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	    body: body
    };

    let result = await fetch(endpointURL, requestOptions)
    jsonData = await result.json();
    return jsonData.access_token;
}

module.exports = getRequestOptions;
