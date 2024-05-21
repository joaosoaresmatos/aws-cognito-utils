import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import
import crypto from 'crypto';

function generateSecretHash(username, clientId, clientSecret) {
    return crypto.createHmac('SHA256', clientSecret)
                 .update(username + clientId)
                 .digest('base64');
}

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

async function resendConfirmCode(event) {
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
        const command = new ResendConfirmationCodeCommand(params);
        await client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "E-mail sent" })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}

export { resendConfirmCode as handler };
