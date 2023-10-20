// Define your YouTube Data API key here
const API_KEY = "AIzaSyDke8ldEj9P-21NJuzNGyWQqt5fYQBONKM";

function parseISO8601Duration(duration) {
  const matches = duration.match(
    /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  const days = matches[1] ? parseInt(matches[1]) : 0;
  const hours = matches[2] ? parseInt(matches[2]) : 0;
  const minutes = matches[3] ? parseInt(matches[3]) : 0;
  const seconds = matches[4] ? parseInt(matches[4]) : 0;

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function analyzePlaylist() {
    const playlistUrl = document.getElementById("playlistUrl").value;
    const playlistId = new URL(playlistUrl).searchParams.get("list");
  
    fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const playlistName = data.items[0].snippet.title;
          document.getElementById("playlistName").textContent = playlistName;
        } else {
          document.getElementById("playlistName").textContent = "Playlist not found";
        }
      })
      .catch((error) => {
        console.error("Error fetching playlist details:", error);
      });
  
    fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        const videoItems = data.items;
        let totalTime = 0;
  
        const fetchVideoDetails = (videoId) => {
          return fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${API_KEY}`
          )
            .then((videoResponse) => videoResponse.json())
            .then((videoData) => {
              if (
                videoData.items &&
                videoData.items[0] &&
                videoData.items[0].contentDetails &&
                videoData.items[0].contentDetails.duration
              ) {
                const videoDuration = videoData.items[0].contentDetails.duration;
                totalTime += parseISO8601Duration(videoDuration);
              }
            });
        };
  
        // Use Promise.all to fetch video details for all videos in parallel
        const fetchVideoDetailsPromises = videoItems.map((item) => {
          return fetchVideoDetails(item.contentDetails.videoId);
        });
  
        Promise.all(fetchVideoDetailsPromises)
          .then(() => {
            const totalHours = Math.floor(totalTime / 3600);
            const totalMinutes = Math.floor((totalTime % 3600) / 60);
            const totalSeconds = totalTime % 60;
  
            document.getElementById(
              "totalTime"
            ).textContent = `${totalHours} hours ${totalMinutes} minutes ${totalSeconds} seconds`;
          })
          .catch((videoError) => {
            console.error("Error fetching video details:", videoError);
          });
      });
  
    // Show the result section
    document.getElementById("result").style.display = "block";
  }