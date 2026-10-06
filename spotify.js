const crypto = require("crypto");
const { shell } = require("electron");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";

let codeVerifier = null;

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateCodeVerifier() {
  return base64UrlEncode(crypto.randomBytes(64));
}

function generateCodeChallenge(verifier) {
  return base64UrlEncode(
    crypto
      .createHash("sha256")
      .update(verifier)
      .digest()
  );
}

async function connectSpotify() {
  codeVerifier = generateCodeVerifier();

  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,

    code_challenge_method: "S256",
    code_challenge: codeChallenge,

    scope: "user-read-currently-playing user-read-playback-state",
  }); // autorisation pour lire la musique

  const authUrl =
    `https://accounts.spotify.com/authorize?${params.toString()}`;

  await shell.openExternal(authUrl);
}

module.exports = {
  connectSpotify,
};