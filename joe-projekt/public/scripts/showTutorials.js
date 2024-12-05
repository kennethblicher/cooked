async function showVideos() {
    try {
        const response = await fetch("http://localhost:4000/showVideos");
        if (!response.ok) {
            throw new Error("Failed to fetch videos");
        }

        const data = await response.json();
        const videoList = document.getElementById("video-list"); // Korrekt ID
        videoList.innerHTML = ""; // Clear existing content

        data.videos.forEach((video) => {
            // Create a container for each video
            const videoDiv = document.createElement("div");
            videoDiv.className = "video";

            // Create a video element
            const videoElement = document.createElement("video");
            videoElement.src = video.videoURL; // URL til videoen
            videoElement.controls = true; // Tilføj afspilningskontroller
            videoElement.style.width = "320px"; // Sæt videoens bredde
            videoElement.style.height = "240px"; // Sæt videoens højde
            videoElement.alt = video.videoName; // Tilføj alternativ tekst

            // Create a name element
            const name = document.createElement("h3");
            name.textContent = video.videoName; // Navn på videoen

            // Append elements to the video container
            videoDiv.appendChild(videoElement);
            videoDiv.appendChild(name);

            // Append the video container to the video list
            videoList.appendChild(videoDiv);
        });
    } catch (error) {
        console.error("Error fetching videos:", error.message);
        alert("Failed to load videos. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", showVideos());

  
  // Example usage:
  // Call this function when a "Buy Now" button is clicked


