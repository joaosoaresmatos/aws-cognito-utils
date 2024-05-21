import { CognitoIdentityProviderClient, ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import
import crypto from 'crypto';

function generateSecretHash(username, clientId, clientSecret) {
    return crypto.createHmac('SHA256', clientSecret)
                 .update(username + clientId)
                 .digest('base64');
}

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

async function forgotPassword(event) {
    const { username } = JSON.parse(event.body);
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const secretHash = generateSecretHash(username, clientId, clientSecret);

    const params = {
        ClientId: clientId,
        SecretHash: secretHash,
        Username: username
    };

    try {
        const command = new ForgotPasswordCommand(params);
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

export { forgotPassword as handler };
