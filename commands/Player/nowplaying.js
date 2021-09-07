const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { splitBar } = require("string-progressbar");
const { randomColor } = require("../../utils/colors");
const { errorEmbed } = require("../../utils/global");
const { images } = require("../../utils/global");

const data = new SlashCommandBuilder()
  .setName("nowplaying")
  .setDescription("shows the current playing song");

module.exports = {
  data,
  async execute(client, interaction) {
    const queue = client.queue.get(interaction.guild.id);

    if (!queue)
      return await interaction.reply({ embeds: [errorEmbed("Nothing playing right now.")] });

    const song = queue.songs[0];
    const seek = queue.player.state.resource.playbackDuration;
    const songDuration = parseInt(song.duration) * 1000;
    const left = songDuration - seek;

    const embed = new MessageEmbed()
      .setAuthor("Now playing", images.waniaSwing)
      .setTitle(song.title)
      .setURL(song.url)
      .setColor(randomColor())
      .setImage(song.thumbnail);

    if (songDuration > 0) {
      embed.addField(
        "\u200b",
        new Date(seek).toISOString().substr(11, 8) +
          "[" +
          splitBar(songDuration == 0 ? seek : songDuration, seek, 10)[0] +
          "]" +
          (songDuration == 0 ? " ◉ LIVE" : new Date(songDuration).toISOString().substr(11, 8)),
        false
      );

      embed.setFooter(
        `Requested by ${song.requested.tag} | Time remaining ${new Date(left)
          .toISOString()
          .substr(11, 8)}`,
        song.requested.displayAvatarURL({ dynamic: true })
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
