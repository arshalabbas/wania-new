const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { errorEmbed, canModifyQueue } = require("../../utils/global");
const YouTube = require("youtube-sr").default;
const Spotify = require("spotify-info.js").Spotify;
const ytdl = require("ytdl-core");
const musicPlayer = require("../../utils/musicPlayer");
const { randomColor } = require("../../utils/colors");
const { getVoiceConnection } = require("@discordjs/voice");
const { spotifyClientId, spotifyToken } = require("../../config");

const data = new SlashCommandBuilder()
  .setName("playlist")
  .setDescription("queue all the content from the given playlist")
  .addStringOption((option) =>
    option.setName("search").setDescription("enter the playlist url").setRequired(true)
  )
  .addNumberOption((option) =>
    option
      .setName("size")
      .setDescription("enter how many songs you need from the playlist. Max: 50")
  );

module.exports = {
  data,
  category: "Music",
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
    const spotifyPlaylistPattern =
      /(?<=https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]{15,})/g;
    const spotifyAlbumPattern = /(?<=https:\/\/open\.spotify\.com\/album\/)([a-zA-Z0-9]{15,})/g;
    const youtubePlaylist = YouTube.isPlaylist(search);
    const spotifyPlaylist = spotifyPlaylistPattern.test(search);
    const spotifyAlbum = spotifyAlbumPattern.test(search);

    let size = null;

    size = interaction.options.getNumber("size");

    if (size !== null && (size > 50 || size < 1)) size = 50;
    if (size == null) size = 50;

    let playlist = null;
    let videos = [];
    let spotify = null;

    if (spotifyPlaylist || spotifyAlbum)
      spotify = new Spotify({ clientID: spotifyClientId, clientSecret: spotifyToken });

    await interaction.reply({ content: `🔍 **searching:** \`${search}\`` });

    if (youtubePlaylist) {
      try {
        playlist = await YouTube.getPlaylist(search, { limit: size });
      } catch (error) {
        await interaction.editReply({ embeds: [errorEmbed("Something went wrong ;-;")] });
        return console.error(error.message);
      }
    } else if (spotifyPlaylist) {
      try {
        playlist = await spotify.getPlaylistByURL(search);
      } catch (error) {
        await interaction.editReply({ embeds: [errorEmbed("Something went wrong ;-;")] });
        return console.error(error.message);
      }
    } else if (spotifyAlbum) {
      try {
        playlist = await spotify.getAlbumByURL(search);
      } catch (error) {
        await interaction.editReply({ embeds: [errorEmbed("Something went wrong ;-;")] });
        return console.error(error.message);
      }
    } else return;

    let newSongs = [];

    if (youtubePlaylist) {
      videos = playlist.videos;
      const allSongsDetails = videos
        .filter((video) => video.title !== "Private video" && video.title !== "Deleted video")
        .map(async (video) => {
          const songInfo = (await ytdl.getInfo(video.url)).videoDetails;
          return (song = {
            title: songInfo.title,
            url: songInfo.video_url,
            duration: songInfo.lengthSeconds,
            artist: songInfo.media.artist,
            thumbnail: songInfo.thumbnails[3].url,
            requested: interaction.user,
          });
        });

      for (i = 0; i <= allSongsDetails.length; i++) {
        newSongs.push(await allSongsDetails[i]);
      }
    } else if (spotifyPlaylist) {
      videos = playlist.tracks.items.slice(0, size).map((song) => {
        return {
          title: song.track.name,
          url: song.track.external_urls.spotify,
          duration: song.track.duration_ms / 1000,
          artist: song.track.artists.map((artist) => artist.name).join(", "),
          thumbnail: song.track.album.images[1].url,
          requested: interaction.user,
        };
      });
      newSongs = videos;
      playlist = {
        title: playlist.name,
        url: playlist.external_urls.spotify,
        thumbnail: playlist.images[0].url,
      };
    } else if (spotifyAlbum) {
      videos = playlist.tracks.items.slice(0, size).map((song) => {
        return {
          title: song.name,
          url: song.external_urls.spotify,
          duration: song.duration_ms / 1000,
          artist: song.artists.map((artist) => artist.name).join(", "),
          thumbnail: playlist.images[1].url,
          requested: interaction.user,
        };
      });
      newSongs = videos;
      playlist = {
        title: playlist.name,
        url: playlist.external_urls.spotify,
        thumbnail: playlist.images[0].url,
      };
    }

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

    if (!serverQueue) {
      client.queue.set(interaction.guild.id, queueConstruct);
      try {
        musicPlayer(client, queueConstruct.songs[0], interaction);
      } catch (error) {
        console.error(error);
        client.queue.delete(interaction.guild.id);
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) connection.destroy();
      }
    }
  },
};
