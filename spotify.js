const crypto = require("crypto");
const http = require("http");
const { shell } = require("electron");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";

let codeVerifier = null;
let accessToken = null;

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

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      body,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify token error: ${error}`);
  }

  const data = await response.json();

  accessToken = data.access_token;

  console.log("acces token recuperé");

  return accessToken;
}

function waitForSpotifyCallback() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, "http://127.0.0.1:8888");

      if (url.pathname !== "/callback") {
        return;
      }

      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.end("Spotify connection cancelled.");
        server.close();
        reject(new Error(error));
        return;
      }

      if (!code) {
        res.end("Missing Spotify authorization code.");
        return;
      }

      try {
        await exchangeCodeForToken(code);

        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
        });

        res.end(`
          <html>
            <body style="
              background:#0d0d0d;
              color:white;
              font-family:Arial;
              display:flex;
              align-items:center;
              justify-content:center;
              height:100vh;
            ">
              <div style="text-align:center">
                <h1>ECHO</h1>
                <p>Spotify connected successfully.</p>
                <p>You can close this window.</p>
              </div>
            </body>
          </html>
        `);

        server.close();

        resolve(accessToken);

      } catch (err) {
        console.error(err);

        res.statusCode = 500;
        res.end("Spotify authentication failed.");

        server.close();
        reject(err);
      }
    });

    server.on("error", reject);

    server.listen(8888, "127.0.0.1", () => {
      console.log("ECHO écoute Spotify sur le port 8888");
    });
  });
}

async function connectSpotify() {
  codeVerifier = generateCodeVerifier();

  const codeChallenge =
    generateCodeChallenge(codeVerifier);

  // IMPORTANT : on démarre le serveur AVANT d'ouvrir Spotify.
  const callbackPromise = waitForSpotifyCallback();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,

    code_challenge_method: "S256",
    code_challenge: codeChallenge,

    scope:
      "user-read-currently-playing user-read-playback-state",
  });

  const authUrl =
    `https://accounts.spotify.com/authorize?${params.toString()}`;

  await shell.openExternal(authUrl);

  return callbackPromise;
}

async function getCurrentTrack() {
  if (!accessToken) {
    throw new Error("Spotify n'est pas connecté.");
  }
}

 const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (response.status === 204) {
    return null;
  }
   if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify API error: ${error}`);
  }

  const data = await response.json();

  if (!data.item) {
    return null;
  }

  return {
    title: data.item.name,

    artist: data.item.artists
      .map((artist) => artist.name)
      .join(", "),

    album: data.item.album.name,

    cover: data.item.album.images[0]?.url ?? null,

    isPlaying: data.is_playing,
  };

module.exports = {
  connectSpotify,
  getCurrentTrack,
};