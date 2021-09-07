const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { randomColor } = require("../../utils/colors");

const data = new SlashCommandBuilder().setName("uptime").setDescription("Check bot's uptime");

module.exports = {
  data,
  async execute(client, interaction) {
    let seconds = Math.floor(client.uptime / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    const embed = new MessageEmbed()
      .setAuthor(`${client.user.username}'s uptime status`, client.user.displayAvatarURL())
      .setColor(randomColor())
      .setDescription(
        `**${days}** day(s), **${hours}** hours, **${minutes}** minutes, **${seconds}** seconds`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
