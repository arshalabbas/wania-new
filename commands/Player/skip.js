const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("skips the current playing song");

module.exports = {
  data,
  async execute(client, interaction) {
    const serverQueue = client.queue.get(interaction.guild.id);

    const { channel } = interaction.member.voice;
    const botChannel = interaction.guild.me.voice.channel;

    if (!serverQueue)
      return await interaction.reply({ embeds: [errorEmbed("Nothing playing right now.")] });

    if (channel !== botChannel)
      return await interaction.reply({
        embeds: [errorEmbed(`You must be in the same channel as <@${client.user.id}>`)],
      });

    serverQueue.playing = true;
    serverQueue.player.stop();
    await interaction.reply({ content: "⏭️ You skipped the song", ephemeral: true });
    await serverQueue.textChannel.send({ content: `<@${interaction.user.id}> skipped the song.` });
  },
};
