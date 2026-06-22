
"use strict";

document.addEventListener("DOMContentLoaded", () => {
	const cooldown = {};
	document.addEventListener("keydown", (e) => {
		if (["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0"].includes(e.key)) {
			if (!(Date.now() - cooldown[e.key] < 100)) {
				var audio = new Audio("/speak/audio/" + e.key + ".mp3");
				audio.play();
				cooldown[e.key] = Date.now();
			}
		}
	});
})
