window.addEventListener("pageshow", () => {
  setTimeout(() => {window.location.href = "/not_found.html"}, 1000 * 30); // 30 seconds?
});
