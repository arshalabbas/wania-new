const { SlashCommandBuilder } = require("@discordjs/builders");
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus } = require("@discordjs/voice");
const { loading, greenCheck } = require("../../utils/emojies");
const { errorEmbed } = require("../../utils/global");

const data = new SlashCommandBuilder().setName("join").setDescription("Bot join the voice channel");

module.exports = {
  data,
  category: "Music",
  async execute(client, interaction, byBot, ready) {
    const { channel } = interaction.member.voice;
    const botChannel = interaction.guild.me.voice.channel;

    if (!channel)
      return await interaction.reply({
        embeds: [errorEmbed("You need to join voice channel.")],
        ephemeral: true,
      });

    const serverQueue = client.queue.get(interaction.guild.id);

    let connection = getVoiceConnection(interaction.guild.id);
    if (!byBot && connection && serverQueue)
      return interaction.reply({
        embeds: [errorEmbed("Music is already playing")],
        ephemeral: true,
      });

    if (serverQueue && channel !== botChannel)
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
        ephemeral: true,
      });

    if (!byBot && channel === botChannel)
      return await interaction.reply({
        embeds: [errorEmbed(`I already joined in your voice channel.`)],
        ephemeral: true,
      });

    const permissions = channel.permissionsFor(channel.guild.me);
    if (!permissions.has("CONNECT"))
      return interaction.reply({ embeds: [errorEmbed("Missing permission: `connect`")] });
    if (!permissions.has("SPEAK"))
      return interaction.reply({ embeds: [errorEmbed("Missing permission: `speak`")] });

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    if (byBot) ready(true);

    if (!byBot) {
      connection.on(
        VoiceConnectionStatus.Connecting,
        async () =>
          await interaction.reply({ content: `${loading} Connecting to <#${channel.id}>` })
      );

      connection.on(
        VoiceConnectionStatus.Ready,
        async () =>
          await interaction.editReply({ content: `${greenCheck} Connected to <#${channel.id}>` })
      );
    }
  },
};
