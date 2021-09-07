const accentColors = ["#7f606b", "#eeb4cc", "#df7191", "#7b334d", "#742e43", "#393032"];

module.exports = {
  primary: "#df7191",
  success: "#42ba96",
  error: "#801b1b",
  warning: "#eed202",
  accentColors,
  randomColor: () => accentColors[Math.floor(Math.random() * accentColors.length)],
};
