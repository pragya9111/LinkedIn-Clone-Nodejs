const nodemailer = require("nodemailer");
const {google} = require("googleapis");

const CLIENT_ID = `815637270724-018u2q3jdoq8ng06i5d08rbit8lq36k7.apps.googleusercontent.com`;

const CLIENT_SECRET = `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`;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//04g_Ba52CCJJ0CgYIARAAGAQSNwF-L9IrXMHWEZ-gChyurPWhRrs0pAlE6iE3rIx-0WnDdeMfKVa50UvB4rTzqCqEbOUPtP-jlH8`;

const oauthclient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauthclient.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail(receiver, text){ 
  try{
    const access_token = await oauthclient.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user:"pragyabisen14@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token
      }
    })

    const mailOpts = {
      from: "pragyabisen14@gmail.com",
      to: receiver,
      subject: "kuch bhi",
      text: "padh le re aalsi ladki",
      html: text
    }

    const result = await transport.sendMail(mailOpts);
    return result;
  }
  catch(err){
    return err;
  }
}

module.exports = sendMail;