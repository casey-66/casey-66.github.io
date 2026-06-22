const fixn = (c) => c == "\n" ? "<br>" : c;

const lines = [
  "A nice distraction.".split(""),
  "Something to\nkeep the mind\n busy.".split("").map(fixn),
  "If you’re not\ncareful,".split("").map(fixn),
  "You could lose\nyourself in it.".split("").map(fixn),
  "After a while\nyou emerge back\nout".split("").map(fixn),
  "Into the dull\n".split("").concat(["<span style='color: #0000ff'>N</span>"]).concat("ausea of the\noutside world.".split("")).map(fixn),
  "Doesn’t it just\nsicken you?".split("").map(fixn),
  "The comforting\nglow is much\nnicer.".split("").map(fixn),
  "Won’t you share\nit with us?".split("").map(fixn),
];

document.addEventListener("DOMContentLoaded", () => {
  const t = document.getElementById("text");
  
  let timeout = undefined;
  let idx = 0;
  let len = 0;
  let s = "";

  let next_arrow = () => {
    t.innerHTML += " <span class='blink'><img style='height: 10px;' src='/images/play.svg' /></span>";
  };

  let next_char = () => {
    s += lines[idx][len];
    t.innerHTML = s;
    len++;
    if (len < lines[idx].length) {
      timeout = setTimeout(next_char, 100);
    } else {
      timeout = setTimeout(next_arrow, 300);
    }
  };

  let next_line = () => {
    clearTimeout(timeout);

    if (len < lines[idx].length && (idx > 0 || len > 0)) {
      while (len < lines[idx].length) {
        s += lines[idx][len];
        t.innerHTML = s;
        len++;
      }
      next_arrow();
      return;
    }
    
    idx++;
    len = 0;
    s = "";
    t.innerHTML = "";
    if (idx >= lines.length) {
      window.location.href = "/not_found.html";
      return;
    }

    next_char();
  };
  
  const i = document.getElementById("i");

  let set = (n) => {
    i.src = "/images/games/console_" + n + ".gif";
  };

  ["a", "b", "x", "y", "l", "r", "u", "d", "select", "start"].forEach((id) => {
    const elem = document.getElementById(id);
    elem.onmousedown = () => set(id);
    elem.ontouchstart = () => set(id);
    elem.onmouseup = () => set("none");
    elem.onmouseleave = () => set("none");
    elem.ontouchend = () => set("none");
    if (id == "a" || id == "b" || id == "x" || id == "y") {
      elem.onclick = next_line;
    }
  });
});
