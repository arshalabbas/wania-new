const { SlashCommandBuilder } = require("@discordjs/builders");
const { errorEmbed, canModifyQueue } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("move")
  .setDescription("Move songs arround in the queue.")
  .addNumberOption((option) =>
    option
      .setName("index")
      .setDescription("enter the index of the song you want to skip.")
      .setRequired(true)
  )
  .addNumberOption((option) =>
    option
      .setName("to")
      .setDescription("enter the position where you want to place the selected song.")
      .setRequired(true)
  );

module.exports = {
  data,
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    if (!serverQueue)
      return await interaction.reply({
        embeds: [errorEmbed("Nothing in the queue now.")],
        ephemeral: true,
      });

    if (!canModifyQueue(interaction))
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    const index = interaction.options.getNumber("index");
    const toIndex = interaction.options.getNumber("to");

    if (index < 1 || toIndex < 1)
      return await interaction.reply({ embeds: [errorEmbed("No negatives")], ephemeral: true });

    if (index > serverQueue.songs.length - 1 || toIndex > serverQueue.songs.length)
      return await interaction.songs.reply({ embeds: [errorEmbed()] });

    const song = serverQueue.songs[index];

    const startIndex = index < 0 ? serverQueue.songs.length + index : index;

    if (startIndex >= 0 && startIndex < serverQueue.songs.length) {
      const endIndex = toIndex < 0 ? serverQueue.songs.length + toIndex : toIndex;

      const [item] = serverQueue.songs.splice(index, 1);
      serverQueue.songs.splice(endIndex, 0, item);
    }

    await interaction.reply({ content: `🚚 moved **${song.title}** to **${toIndex}**` });
  },
};
