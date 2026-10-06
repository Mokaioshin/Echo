const spotifyButton = document.getElementById("spotify-connect");

console.log("renderer.js chargé");

spotifyButton.addEventListener("click", async () => {
  console.log("bouton spt cliqué");

  try {
    await window.echo.connectSpotify();
    console.log("Demande envoyée à Electron");
  } catch (error) {
    console.error("Erreur Spotify :", error);
  }
});