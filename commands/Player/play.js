const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const YouTube = require("youtube-sr").default;
const { errorEmbed, images, canModifyQueue } = require("../../utils/global");
const { randomColor } = require("../../utils/colors");
const musicPlayer = require("../../utils/musicPlayer");

const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("play songs in voice channel")
  .addStringOption((option) =>
    option.setName("search").setDescription("Enter the song title or url").setRequired(true)
  );

module.exports = {
  data,
  async execute(client, interaction) {
    client.commands.get("join").execute(client, interaction, true);

    const serverQueue = client.queue.get(interaction.guild.id);

    if (serverQueue && !canModifyQueue(interaction))
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    const search = interaction.options.getString("search");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const urlValid = videoPattern.test(search);

    if (!urlValid && playlistPattern.test(search))
      return client.commands.get("playlist").execute(client, interaction);

    let song = null;
    let songInfo = null;

    await interaction.reply({ content: `🔍 **searching:** \`${search}\`` });

    if (urlValid) {
      try {
        songInfo = (await ytdl.getInfo(search)).videoDetails;
        song = {
          title: songInfo.title,
          url: songInfo.video_url,
          duration: songInfo.lengthSeconds,
          thumbnail: songInfo.thumbnails[3].url,
          requested: interaction.user,
        };
      } catch (error) {
        console.error(error);
        return await interaction.editReply({ embeds: [errorEmbed("something went wrong ;-;")] });
      }
    } else {
      try {
        const searchResult = await YouTube.searchOne(search).catch((error) => console.error(error));
        if (!searchResult)
          return await interaction.editReply({
            embeds: [errorEmbed("No songs found with this title")],
          });

        songInfo = (await ytdl.getInfo(searchResult.url)).videoDetails;
        song = {
          title: songInfo.title,
          url: songInfo.video_url,
          duration: songInfo.lengthSeconds,
          thumbnail: songInfo.thumbnails[3].url,
          requested: interaction.user,
        };
      } catch (error) {
        console.error(error);
        return await interaction.editReply({ embeds: [errorEmbed("Something went wrong ;-;")] });
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      const embed = new MessageEmbed()
        .setAuthor(`✅ Added to queue!`, images.waniaSwing)
        .setColor(randomColor())
        .setTitle(song.title)
        .setURL(song.url)
        .setThumbnail(song.thumbnail)
        .setFooter(
          `Requested by ${song.requested.tag}`,
          song.requested.displayAvatarURL({ dynamic: true })
        );

      return await interaction.editReply({ embeds: [embed] });
    }

    const queueConstruct = {
      textChannel: interaction.channel,
      songs: [],
      loop: false,
      playing: true,
      player: null,
    };

    queueConstruct.songs.push(song);
    client.queue.set(interaction.guild.id, queueConstruct);

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
