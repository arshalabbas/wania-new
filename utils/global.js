const { MessageEmbed } = require("discord.js");
const colors = require("./colors");
const { redCross, seek } = require("./emojies");

const images = {
  wania: "https://i.ibb.co/W6hK79j/mimo-logo.png",
  radio: "https://i.ibb.co/TB5ymRh/wania-radio.png",
  waniaSwing: "https://i.ibb.co/Xxbg3kx/giphy.gif",
  radioBounce: "https://i.ibb.co/rkfL7XH/giphy.gif",
  waniaError: "https://i.ibb.co/Lx2DthW/mimo-monitor-down.png",
  together: "https://i.ibb.co/Rj4LnHc/wania-together.gif",
};

module.exports = {
  botInviteURL: (clientId) =>
    `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=4399156289`,
  images,
  errorEmbed: (message) => {
    const embed = new MessageEmbed()
      .setTitle(`${redCross} Error!`)
      .setThumbnail(images.waniaError)
      .setDescription(message)
      .setColor(colors.error);

    return embed;
  },
  canModifyQueue: (interaction) => {
    const { channel } = interaction.member.voice;
    const botChannel = interaction.guild.me.voice.channel;

    if (!channel) return false;

    if (channel !== botChannel) return false;

    return true;
  },
  seekBar: (total, current, length = 10) => {
    const percent = (current / total) * 100;
    let filled = "";
    let unfilled = "";
    for (let i = 0; i < length; i++) {
      if (percent >= (100 / length) * (i + 1)) filled += seek.filled;
      else unfilled += seek.unfilled;
    }

    return seek.opening + filled + seek.point + unfilled + seek.closing;
  },
};
