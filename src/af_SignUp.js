import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';

const client = new CognitoIdentityProviderClient({ region: "us-east-1" });

function generateSecretHash(username, clientId, clientSecret) {
    return crypto.createHmac('SHA256', clientSecret)
                 .update(username + clientId)
                 .digest('base64');
}
async function signUp(event) {
    const body = JSON.parse(event.body);

    const { email, password } = body;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const secretHash = generateSecretHash(email, clientId, clientSecret);

    const params = {
        ClientId: clientId,
        SecretHash: secretHash,
        Username: email,
        Password: password,
        UserAttributes: [
            {
                Name: "email",
                Value: email
            }
        ]
    };

    const command = new SignUpCommand(params);

    try {
        const data = await client.send(command);
        console.log(data);
        return { status: 'SUCCESS', data: data };
    } catch (error) {
        console.error(error);
        return { status: 'ERROR', error: error };
    }
}

export { signUp as handler };