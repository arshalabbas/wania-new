const { SlashCommandBuilder } = require("@discordjs/builders");
const { DiscordTogether } = require("discord-together");
const { MessageActionRow, MessageButton } = require("discord.js");
const { errorEmbed } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("youtube")
  .setDescription("Watch youtube in voice channel together.")
  .addChannelOption((option) =>
    option.setName("vc").setDescription("select the voice channel.").setRequired(true)
  );

module.exports = {
  data,
  category: "Developer",
  async execute(client, interaction) {
    const channel = interaction.options.getChannel("vc");

    if (!channel.isVoice())
      return interaction.reply({
        embeds: [errorEmbed("You must need to select **Voice Channel**")],
        ephemeral: true,
      });

    const together = new DiscordTogether(client);

    together.createTogetherCode(channel.id, "youtube").then(async (invite) => {
      const row = new MessageActionRow().addComponents(
        new MessageButton().setStyle("LINK").setURL(invite.code).setLabel("Join")
      );

      await interaction.reply({
        content: `YouTube together started on <#${channel.id}>`,
        components: [row],
      });
    });
  },
};
