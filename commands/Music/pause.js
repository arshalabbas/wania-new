const { SlashCommandBuilder } = require("@discordjs/builders");
const { errorEmbed, canModifyQueue } = require("../../utils/global");

const data = new SlashCommandBuilder().setName("pause").setDescription("pause the music");

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    if (!serverQueue)
      return await interaction.reply({ embeds: [errorEmbed("Nothing playing right now.")] });

    if (!canModifyQueue(interaction))
      return { embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)] };

    if (!serverQueue.playing)
      return await interaction.reply({ embeds: [errorEmbed("Music is already paused")] });

    serverQueue.player.pause();
    await interaction.reply({ content: `⏸️ You paused the music.`, ephemeral: true });
  },
};
