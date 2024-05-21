import { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import
import crypto from 'crypto';

function generateSecretHash(username, clientId, clientSecret) {
    return crypto.createHmac('SHA256', clientSecret)
                 .update(username + clientId)
                 .digest('base64');
}

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

async function confirmNewPassword(event) {
    const { username, password, confirmationCode} = JSON.parse(event.body);
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const secretHash = generateSecretHash(username, clientId, clientSecret);

    const params = {
        ClientId: clientId,
        SecretHash: secretHash,
        Username: username,
        Password: password,
        ConfirmationCode: confirmationCode
    };

    try {
        const command = new ConfirmForgotPasswordCommand(params);
        const response = await client.send(command);
        console.log(response);
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}
export { confirmNewPassword as handler };
