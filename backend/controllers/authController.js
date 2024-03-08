import dotenv from "dotenv";
dotenv.config();

import { OAuth2Client } from "google-auth-library";

const clientId = process.env.CLIENT_ID;
const client = new OAuth2Client();

const verifyAccount = async (req, res) => {
    const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: clientId,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return res.send(payload);
}

export { verifyAccount };