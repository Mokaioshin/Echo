const spotifyButton = document.getElementById("spotify-connect");

const nowPlaying = document.getElementById("now-playing");

const albumCover = document.getElementById("album-cover");

const trackTitle = document.getElementById("track-title");

const trackArtist = document.getElementById("track-artist");


async function updateCurrentTrack() {
  try {
    const track = await window.echo.getCurrentTrack();

    if (!track) {
      nowPlaying.classList.add("hidden");
      return;
    }

    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;

    if (track.cover) {
      albumCover.src = track.cover;
    }

    nowPlaying.classList.remove("hidden");

  } catch (error) {
    console.error(
      "Erreur lors de la récupération du morceau en cours :",
      error
    );
  }
}


spotifyButton.addEventListener("click", async () => {
  try {
    await window.echo.connectSpotify();

    spotifyButton.classList.add("hidden");

    await updateCurrentTrack();

    
    setInterval(updateCurrentTrack, 5000); // Actualisation toutes les 5 secondes

  } catch (error) {
    console.error(
      "Erreur lors de la connexion à Spotify :",
      error
    );
  }
});