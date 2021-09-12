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
  category: "Bot",
  async execute(client, interaction) {
    const embed = new MessageEmbed()
      .setTitle("Invite Us!")
      .setDescription("**I hope we can be entertain to you in your server!**")
      .setColor(randomColor())
      .setImage(images.together)
      .setFooter("Wania Radio new version is on development...");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel(client.user.username)
        .setStyle("LINK")
        .setURL(botInviteURL(client.user.id))
        .setEmoji(wania),
      new MessageButton()
        //.setLabel(client.radioClient.user.username)
        .setLabel("Wania Radio") //same here
        .setStyle("LINK")
        //.setURL(botInviteURL(client.radioClient.user.id))
        .setURL(botInviteURL("794170239737921536")) //implement the above commented code when the wania radio 2.O is ready
        .setEmoji(waniaRadio)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
