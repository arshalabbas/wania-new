const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { randomColor } = require("../../utils/colors");
const { wania, waniaRadio } = require("../../utils/emojies");
const { botInviteURL, images } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("invite")
  .setDescription("Send you the bot invite links");

module.exports = {
  data,
  async execute(client, interaction) {
    const embed = new MessageEmbed()
      .setTitle("Invite Us!")
      .setDescription("I hope we can be entertain to you in your server!")
      .setColor(randomColor())
      .setImage(images.together);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel(client.user.username)
        .setStyle("LINK")
        .setURL(botInviteURL(client.user.id))
        .setEmoji(wania),
      new MessageButton()
        .setLabel(client.radioClient.user.username)
        .setStyle("LINK")
        .setURL(botInviteURL(client.radioClient.user.id))
        .setEmoji(waniaRadio)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
