document.addEventListener("DOMContentLoaded", () => {
  const vol = document.querySelector("#volume");
  const audio = document.querySelector("#bgmusic");
  const play = document.querySelector("#play");
  const pause= document.querySelector("#pause");

  vol.value = localStorage.getItem("volume");
  audio.volume = vol.value;

  if (audio.classList.contains("random")) {
    audio.addEventListener("loadedmetadata", () => {
      let time = Math.random() * audio.duration;
      audio.currentTime = time;
    });
  }

  play.addEventListener("click", () => {
    audio.play();
  });
  pause.addEventListener("click", () => {
    audio.pause();
  });

  audio.addEventListener("play", () => {
    play.style.display = "none";
    pause.style.display = "inline-block";
  });
  audio.addEventListener("pause", () => {
    pause.style.display = "none";
    play.style.display = "inline-block";
  });
  
  pause.style.display = "none";

  vol.addEventListener("input", (e) => {
    audio.volume = e.target.value;
    localStorage.setItem("volume", e.target.value);
  });
});
