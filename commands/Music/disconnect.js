const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");
const { greenCheck } = require("../../utils/emojies");
const { errorEmbed } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("disconnect")
  .setDescription("bot leaves the voice channel");

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const botChannel = interaction.guild.me.voice.channel;
    const { channel } = interaction.member.voice;

    if (!botChannel)
      return await interaction.reply({
        embeds: [errorEmbed("I'm not in voice channel right now.")],
        ephemeral: true,
      });

    if (!channel)
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    if (channel !== botChannel)
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) connection.destroy();
    await interaction.reply({ content: `${greenCheck} Disconnected from <#${channel.id}>` });
  },
};
