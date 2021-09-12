const { SlashCommandBuilder } = require("@discordjs/builders");
const { errorEmbed, canModifyQueue } = require("../../utils/global");

const data = new SlashCommandBuilder().setName("shuffle").setDescription("shuffles the queue");

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    if (!serverQueue)
      return await interaction.reply({ embeds: [errorEmbed("Nothing in queue now.")] });

    if (!canModifyQueue(interaction))
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
      });

    let currentPlaying = serverQueue.songs.shift();
    let songs = serverQueue.songs;

    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }

    serverQueue.songs = [currentPlaying, ...songs];
    client.queue.set(interaction.guild.id, serverQueue);
    await interaction.reply("🔀 **You suffled the queue.**");
  },
};
