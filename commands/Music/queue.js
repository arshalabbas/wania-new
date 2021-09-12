const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { randomColor } = require("../../utils/colors");
const { errorEmbed } = require("../../utils/global");
const emojies = require("../../utils/emojies");

const data = new SlashCommandBuilder().setName("queue").setDescription("shows the music queue");

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction) {
    const queue = client.queue.get(interaction.guild.id);

    if (!queue)
      return await interaction.reply({ embeds: [errorEmbed("Nothing playing right now.")] });

    let currentPage = 0;
    const embeds = generateEmbeds(queue.songs);
    let row = generateButtons(currentPage, embeds.length);

    embeds[currentPage].setFooter(
      `Loop: ${queue.loop ? "✅" : "❌"}  |  page: ${currentPage + 1}/${embeds.length}`,
      interaction.user.displayAvatarURL({ dynamic: true })
    );

    interaction.reply({ embeds: [embeds[currentPage]], components: [row] });

    const filter = (i) =>
      i.user.id === interaction.user.id && i.message.interaction.id === interaction.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i) => {
      switch (i.customId) {
        case "next":
          currentPage++;
          row = generateButtons(currentPage, embeds.length);
          updateFooter();
          await i.update({ embeds: [embeds[currentPage]], components: [row] });
          break;
        case "prev":
          --currentPage;
          updateFooter();
          row = generateButtons(currentPage, embeds.length);
          await i.update({ embeds: [embeds[currentPage]], components: [row] });
          break;
        case "first":
          currentPage = 0;
          updateFooter();
          row = generateButtons(currentPage, embeds.length);
          await i.update({ embeds: [embeds[currentPage]], components: [row] });
          break;
        case "last":
          currentPage = embeds.length - 1;
          updateFooter();
          row = generateButtons(currentPage, embeds.length);
          await i.update({ embeds: [embeds[currentPage]], components: [row] });
          break;
      }
    });

    collector.on("end", () => {
      row = generateButtons(null, null, true);
      interaction.editReply({ components: [row] });
    });

    function updateFooter() {
      embeds[currentPage].setFooter(
        `Loop: ${queue.loop ? "✅" : "❌"}  |  page: ${currentPage + 1}/${embeds.length}`,
        interaction.user.displayAvatarURL({ dynamic: true })
      );
    }

    function generateButtons(currentPage, totalPage, timeEnd) {
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setDisabled(currentPage === 0 || timeEnd ? true : false)
          .setCustomId("first")
          .setStyle("SECONDARY")
          .setLabel("")
          .setEmoji(emojies.queue.first),
        new MessageButton()
          .setDisabled(currentPage === 0 || timeEnd ? true : false)
          .setCustomId("prev")
          .setStyle("SECONDARY")
          .setLabel("")
          .setEmoji(emojies.queue.prev),
        new MessageButton()
          .setDisabled(currentPage === totalPage - 1 || timeEnd ? true : false)
          .setCustomId("next")
          .setStyle("SECONDARY")
          .setLabel("")
          .setEmoji(emojies.queue.next),
        new MessageButton()
          .setDisabled(currentPage === totalPage - 1 || timeEnd ? true : false)
          .setCustomId("last")
          .setStyle("SECONDARY")
          .setLabel("")
          .setEmoji(emojies.queue.last)
      );
      return row;
    }

    function generateEmbeds(queue) {
      let embeds = [];
      let k = 10;

      for (let i = 0; i < queue.length; i += 10) {
        const current = queue.slice(i, k);
        let j = i;
        k += 10;

        const info = current
          .filter((track) => queue[0].url !== track.url)
          .map(
            (track) => `${++j} - **[${track.title}](${track.url})** - \`${track.requested.tag}\``
          )
          .join("\n\n");

        const embed = new MessageEmbed()
          .setAuthor("🎶 Music queue")
          .setTitle("Now playing")
          .setThumbnail(queue[0].thumbnail)
          .setColor(randomColor())
          .setDescription(
            `**[${queue[0].title}](${queue[0].url})** - \`${
              queue[0].requested.tag
            }\`\n\n__Up Next__\n${info.length === 0 ? "_Nothing in queue_" : info}`
          );
        embeds.push(embed);
      }

      return embeds;
    }
  },
};
