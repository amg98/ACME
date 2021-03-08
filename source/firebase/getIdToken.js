const rp = require('request-promise');

module.exports.getIdToken = async customToken => {
    const res = await rp({
      url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.FIREBASE_API_KEY}`,
      method: 'POST',
      body: {
        token: customToken,
        returnSecureToken: true
      },
      json: true,
    });
    return res.idToken;
  };