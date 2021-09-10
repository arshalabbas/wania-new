const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { randomColor } = require("../../utils/colors");
const { statusSuccess, statusDanger } = require("../../utils/emojies");
const { botInviteURL } = require("../../utils/global");

const data = new SlashCommandBuilder().setName("ping").setDescription("show bot's average latency");

module.exports = {
  data,
  category: "Bot",
  async execute(client, interaction) {
    await interaction.deferReply();

    const embed = new MessageEmbed()
      .setAuthor(`${client.user.username}'s Latency`, client.user.displayAvatarURL())
      .setColor(randomColor())
      .setFooter(
        `Requested by ${interaction.user.username}`,
        interaction.user.displayAvatarURL({ dynamic: true })
      );

    let ping = {
      music: Math.round(client.ws.ping),
      radio: null,
    };

    try {
      const member = await interaction.guild.members.fetch(client.radioClient.user.id);

      if (member) {
        ping.radio = Math.round(client.radioClient.ws.ping);
      }
    } catch {
      ping.radio = null;
    }

    embed.addFields([
      { name: `${statusSuccess} ${client.user.username}`, value: `\`${ping.music} ms\`` },
      {
        name: `${ping.radio ? statusSuccess : statusDanger} ${client.radioClient.user.username}`,
        value: `${
          ping.radio
            ? `\`${ping.radio} ms\``
            : `[Please invite my radio :(](${botInviteURL(client.radioClient.user.id)})`
        }`,
      },
    ]);

    await interaction.editReply({ embeds: [embed] });
  },
};
