const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { randomColor } = require("../../utils/colors");
const emojies = require("../../utils/emojies");
const { errorEmbed, canModifyQueue } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("removes given song")
  .addNumberOption((option) =>
    option
      .setName("index")
      .setDescription(
        "enter the index of the song you want to remove (index will be in the /queue)."
      )
      .setRequired(true)
  );

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);
    if (!serverQueue)
      return await interaction.reply({
        embeds: [errorEmbed("Nothing playing right now.")],
        ephemeral: true,
      });

    if (!canModifyQueue(interaction))
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    const index = interaction.options.getNumber("index");
    const songs = serverQueue.songs;
    if (index > songs.length - 1 || index < 1)
      return await interaction.reply({
        embeds: [errorEmbed(`Only ${songs.length - 1} songs in queue.`)],
        ephemeral: true,
      });

    const removed = serverQueue.songs.splice(index, 1)[0];

    const embed = new MessageEmbed()
      .setTitle(`${emojies.greenCheck} removed a song.`)
      .setDescription(
        `**[${removed.title}](${removed.url})**\nadded by \`${removed.requested.tag}\``
      )
      .setColor(randomColor())
      .setFooter(
        `Removed by ${interaction.user.tag}`,
        interaction.user.displayAvatarURL({ dynamic: true })
      );

    await await interaction.reply({ embeds: [embed] });
  },
};
