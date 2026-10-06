console.log("renderer.js chargé");

const spotifyButton = document.getElementById("spotify-connect");

console.log("Bouton trouvé :", spotifyButton);

spotifyButton.addEventListener("click", async () => {
  console.log("CLIC SPOTIFY");

  try {
    console.log("window.echo =", window.echo);

    await window.echo.connectSpotify();

    console.log("IPC envoyé");
  } catch (error) {
    console.error("ERREUR :", error);
  }
});