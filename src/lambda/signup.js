const request = require("request");

const getResponseAPI = process.env.GETRESPONSE_API_KEY;
const getResponselistID = process.env.GETRESPONSE_LIST_ID;

module.exports.handler = (event, context, callback) => {

    const formData = JSON.parse(event.body);
    const email = formData.email;
    let errorMessage = null;

    if (!formData) {
        errorMessage = "No form data supplied";
        console.log(errorMessage);
        callback(errorMessage);
    }

    if (!email) {
        errorMessage = "No EMAIL supplied";
        console.log(errorMessage);
        callback(errorMessage);
    }

    if (!getResponselistID) {
        errorMessage = "No LIST_ID supplied";
        console.log(errorMessage);
        callback(errorMessage);
    }

    const data = {
        campaign: {
            campaignId: getResponselistID
        },
        email: email
    };

    const subscriber = JSON.stringify(data);
    console.log("Sending data to get respoonse", subscriber);

    request({
        method: "POST",
        url: `https://api.getresponse.com/v3/contacts`,
        body: subscriber,
        headers: {
            "X-Auth-Token": `api-key ${getResponseAPI}`,
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        if (error) {
            callback(error, null)
        }
        console.log(body)

        if (!!body) {
            callback(null, {
                statusCode: 201,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({
                    status: "saved email"
                })
            })
        }

        const bodyObj = JSON.parse(body);

        console.log("get respoonse body: " + JSON.stringify(bodyObj));
        console.log("Status Code: " + response.statusCode);

        if (response.statusCode < 300 || (bodyObj.status === 400 && bodyObj.title === "Member Exists")) {
            console.log("Added to list in get respoonse subscriber list");
            callback(null, {
                statusCode: 201,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({
                    status: "saved email"
                })
            })
        } else {
            console.log("Error from get respoonse", bodyObj.detail);
            callback(bodyObj.detail, null);
        }

    });

};