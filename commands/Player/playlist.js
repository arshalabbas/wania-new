const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { errorEmbed, canModifyQueue } = require("../../utils/global");
const YouTube = require("youtube-sr").default;
const ytdl = require("ytdl-core");
const musicPlayer = require("../../utils/musicPlayer");
const { randomColor } = require("../../utils/colors");

const data = new SlashCommandBuilder()
  .setName("playlist")
  .setDescription("queue all the content from the given playlist")
  .addStringOption((option) =>
    option.setName("search").setDescription("enter the youtube playlist url").setRequired(true)
  )
  .addNumberOption((option) =>
    option
      .setName("size")
      .setDescription("enter how many songs you need from the playlist. Max: 50")
  );

module.exports = {
  data,
  async execute(client, interaction) {
    client.commands.get("join").execute(client, interaction, true);

    const { channel } = interaction.member.voice;

    if (!channel)
      return await interaction.reply({
        embeds: [errorEmbed("you need to join voice channel.")],
        ephemeral: true,
      });

    const serverQueue = client.queue.get(interaction.guild.id);

    if (serverQueue && !canModifyQueue(interaction))
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    const search = interaction.options.getString("search");
    const validation = YouTube.isPlaylist(search);

    if (!validation)
      return await interaction.reply({
        embeds: [errorEmbed("You need enter the valid youtube playlist url")],
        ephemeral: true,
      });

    let size = null;

    size = interaction.options.getNumber("size");

    if (size !== null && (size > 50 || size < 1)) size = 50;
    if (size == null) size = 50;

    let playlist = null;
    let videos = [];

    await interaction.reply({ content: `🔍 **searching:** \`${search}\`` });

    try {
      playlist = await YouTube.getPlaylist(search, { limit: size });
      videos = playlist.videos;
    } catch (error) {
      await interaction.editReply({ embeds: [errorEmbed("Something went wrong ;-;")] });
      return console.error(error);
    }

    const newSongs = videos
      .filter((video) => video.title !== "Private video" && video.title !== "Deleted video")
      .map(async (video) => {
        const songInfo = (await ytdl.getInfo(video.url)).videoDetails;
        return (song = {
          title: songInfo.title,
          url: songInfo.video_url,
          duration: songInfo.lengthSeconds,
          thumbnail: songInfo.thumbnails[3].url,
          requested: interaction.user,
        });
      });

    const queueConstruct = {
      textChannel: interaction.channel,
      songs: [],
      loop: false,
      playing: true,
      player: null,
    };

    serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

    const embed = new MessageEmbed()
      .setAuthor("✅ Playlist added", client.user.displayAvatarURL())
      .setTitle(playlist.title)
      .setURL(playlist.url)
      .setThumbnail(playlist.thumbnail)
      .setDescription(`added ${newSongs.length} songs from the playlist`)
      .setColor(randomColor())
      .setFooter(
        `Added by ${interaction.user.tag}`,
        interaction.user.displayAvatarURL({ dynamic: true })
      );

    await interaction.editReply({ embeds: [embed] });

    try {
      musicPlayer(client, queueConstruct.songs[0], interaction);
    } catch (error) {
      console.error(error);
      client.queue.delete(interaction.guild.id);
      const connection = getVoiceConnection(interaction.guild.id);
      if (connection) connection.destroy();
    }
  },
};
