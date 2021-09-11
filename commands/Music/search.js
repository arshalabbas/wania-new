const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require("discord.js");
const YouTube = require("youtube-sr").default;
const { canModifyQueue, errorEmbed } = require("../../utils/global");
const { redCross, greenCheck } = require("../../utils/emojies");
const { randomColor } = require("../../utils/colors");

const data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("search a song by title")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("enter the title of the song you want to search")
      .setRequired(true)
  );

module.exports = {
  data,
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    if (serverQueue && !canModifyQueue(interaction))
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    const query = interaction.options.getString("title");

    await interaction.reply({ content: `🔍 **searching:** \`${query}\`` });

    let videos = [];

    try {
      const searchResult = await YouTube.search(query, { limit: 10 });
      if (!searchResult.length)
        return await interaction.editReply({
          embeds: [errorEmbed("No songs found with this title")],
        });
      videos = searchResult.map((video) => {
        return {
          label: video.title,
          description: `channel: ${video.channel.name} duration: ${video.durationFormatted}`,
          value: video.url,
        };
      });
    } catch (error) {
      console.error(error.message);
      return await interaction.editReply({ embeds: [errorEmbed("Something went wrong ;-;")] });
    }

    const embed = new MessageEmbed()
      .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setTitle("Your search results...")
      .setColor(randomColor());

    const menuRow = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("songs-search")
        .setPlaceholder("select a song")
        .addOptions(videos)
        .setMaxValues(1)
    );

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("cancel")
        .setLabel("cancel")
        .setEmoji(redCross)
        .setStyle("DANGER")
    );

    await interaction.editReply({ embeds: [embed], components: [menuRow, buttonRow] });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "songs-search") {
        await i.update({ content: `${greenCheck} **selected**`, embeds: [], components: [] });
        client.commands.get("play").execute(client, interaction, i.values[0]);
      } else if (i.customId === "cancel") {
        await i.update({ content: `${redCross} **canceled**`, embeds: [], components: [] });
      }
    });
  },
};
