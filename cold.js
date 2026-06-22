document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("secret");
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const code = input.value.toLocaleLowerCase();
      if (code.length != 5 || code == "games") {
        return;
      }
      window.location.href = "/" + code;
    }

    // disallow non-alphabetic characters
    return /[a-z]/i.test(e.key);
  };
});
