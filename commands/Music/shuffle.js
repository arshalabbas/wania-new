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

    let songs = serverQueue.songs;

    const currentPlaying = songs.shift();

    let currentIndex = songs.length;
    let randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [songs[currentIndex], songs[randomIndex]] = [songs[randomIndex], songs[currentIndex]];
    }

    serverQueue.songs = [currentPlaying, ...songs];
    await interaction.reply("🔀 **You suffled the queue.**");
  },
};
