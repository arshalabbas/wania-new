const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder().setName("loop").setDescription("loop the entire queue");

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

    serverQueue.loop = !serverQueue.loop;
    await interaction.reply({
      content: `You turned ${serverQueue.loop ? "**ON**" : "**OFF**"} loop.`,
      ephemeral: true,
    });
    await serverQueue.textChannel.send({
      content: `Loops is ${serverQueue.loop ? "**ON**" : "**OFF**"}`,
    });
  },
};
