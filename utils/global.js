const { MessageEmbed } = require("discord.js");
const colors = require("./colors");
const { redCross } = require("./emojies");

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

    if (channel !== botChannel) return;

    return true;
  },
};
