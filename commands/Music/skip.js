const { SlashCommandBuilder } = require("@discordjs/builders");
const { canModifyQueue, errorEmbed } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("skips the current playing song");

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    if (!serverQueue)
      return await interaction.reply({ embeds: [errorEmbed("Nothing playing right now.")] });

    if (!canModifyQueue(interaction))
      return { embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)] };

    serverQueue.playing = true;
    serverQueue.player.stop();
    await interaction.reply({ content: "⏭️ You skipped the song" });
  },
};
