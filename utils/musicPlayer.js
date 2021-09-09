const {
  getVoiceConnection,
  createAudioResource,
  StreamType,
  createAudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const { MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
//const spdl = require("spdl-core").default;
const YouTube = require("youtube-sr").default;
const { randomColor } = require("./colors");
const { errorEmbed, images } = require("./global");

async function musicPlayer(client, song, interaction) {
  const queue = client.queue.get(interaction.guild.id);

  const connection = getVoiceConnection(interaction.guild.id);

  if (!song) return client.queue.delete(interaction.guild.id);

  let stream = null;

  try {
    if (song.url.includes("youtube.com")) {
      stream = ytdl(song.url, { highWaterMark: 1 << 25, filter: "audioonly" });
    } else if (song.url.includes("spotify.com")) {
      const searchResult = await YouTube.searchOne(`${song.title} ${song.artist}`).catch((error) =>
        console.error(error)
      );

      if (!searchResult)
        return queue.textChannel.send({ embeds: [errorEmbed("No song found :,-)")] });

      stream = ytdl(searchResult.url, { highWaterMark: 1 << 25, filter: "audioonly" });
    }
  } catch (error) {
    if (queue) {
      queue.songs.shift();
      musicPlayer(client, queue.songs[0], interaction);
    }

    console.error(error);
    return queue.textChannel.send({
      embeds: [errorEmbed("something went wrong...")],
    });
  }

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch (error) {
      connection.destroy();
      client.queue.delete(interaction.guild.id);
    }
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => client.queue.delete(interaction.guild.id));

  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    metadata: {
      title: song.title,
      url: song.url,
      requestedId: "751736021661778004",
    },
  });
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  player.play(resource);
  connection.subscribe(player);

  let playingMessage = null;

  queue.player = player;

  player.on(AudioPlayerStatus.Playing, async () => {
    const embed = new MessageEmbed()
      .setAuthor("Now playing", images.waniaSwing)
      .setColor(randomColor())
      .setTitle(song.title)
      .setURL(song.url)
      .setThumbnail(song.thumbnail)
      .setFooter(
        `Requested by ${song.requested.tag}`,
        song.requested.displayAvatarURL({ dynamic: true })
      );

    if (song.artist) embed.setDescription(`Artist - **${song.artist}**`);

    playingMessage = await queue.textChannel.send({ embeds: [embed] });
  });

  player.on(AudioPlayerStatus.Paused, () => {
    queue.playing = false;
    queue.textChannel.send({ content: "⏸️ Music is paused." });
  });

  player.on(AudioPlayerStatus.Playing, () => {
    if (queue.playing) return;
    queue.playing = true;
    queue.textChannel.send({ content: "🎶 Continue playing." });
  });

  player.on(AudioPlayerStatus.Idle, () => {
    if (playingMessage && !playingMessage.deleted) playingMessage.delete();
    if (queue.loop) {
      let lastSong = queue.songs.shift();
      queue.songs.push(lastSong);
      musicPlayer(client, queue.songs[0], interaction);
    } else {
      queue.songs.shift();
      musicPlayer(client, queue.songs[0], interaction);
    }
  });

  player.on("error", (error) => {
    console.error(error.message);
    const metadata = error.resource.metadata;
    queue.textChannel.send({
      embeds: [
        errorEmbed(
          `error when trying to play the song [${metadata.title}](${metadata.url})\nrequestted by <@${metadata.requestedId}>`
        ),
      ],
    });
  });
}

module.exports = musicPlayer;
