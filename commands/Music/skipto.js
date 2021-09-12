const { SlashCommandBuilder } = require("@discordjs/builders");
const { errorEmbed, canModifyQueue } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("skipto")
  .setDescription("skip to specified queue index.")
  .addNumberOption((option) =>
    option
      .setName("index")
      .setDescription("enter the index of the song you like to skip to.")
      .setRequired(true)
  );

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    if (!serverQueue)
      return await interaction.reply({
        embeds: [errorEmbed("Nothing in queue now.")],
        ephemeral: true,
      });

    if (!canModifyQueue(interaction))
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
      });

    const index = interaction.options.getNumber("index");

    if (index > serverQueue.songs.length - 1)
      return await interaction.reply({
        embeds: [errorEmbed(`Only ${serverQueue.songs.length - 1} songs in queue.`)],
        ephemeral: true,
      });

    serverQueue.playing = true;

    if (serverQueue.loop) {
      for (let i = 0; i < index - 2; i++) {
        serverQueue.songs.push(serverQueue.songs.shift());
      }
    } else {
      serverQueue.songs = serverQueue.songs.slice(index - 1);
    }

    serverQueue.player.stop();
    await interaction.reply({ content: `⏭️ **You skipped \`${index - 1}\` songs**` });
  },
};
