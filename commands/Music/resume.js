const { SlashCommandBuilder } = require("@discordjs/builders");
const { errorEmbed, canModifyQueue } = require("../../utils/global");

const data = new SlashCommandBuilder().setName("resume").setDescription("resume the paused music");

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    if (!serverQueue)
      return await interaction.reply({ embeds: [errorEmbed("Nothing playing right now.")] });

    if (!canModifyQueue(interaction))
      return { embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)] };

    if (serverQueue.playing)
      return await interaction.reply({ embeds: [errorEmbed("Music is already playing")] });

    serverQueue.player.unpause();
    await interaction.reply({ content: "🎶 You resumed the music.", ephemeral: true });
  },
};
