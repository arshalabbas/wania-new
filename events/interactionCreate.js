const { errorEmbed } = require("../utils/global");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      if (command.category === "Developer" && interaction.user.id !== "751736021661778004")
        return interaction.reply({
          embeds: [errorEmbed("You can't use this command.")],
          ephemeral: true,
        });

      if (command.category === "Music") {
        const queue = interaction.client.queue.get(interaction.guild.id);

        if (queue && interaction.channel.id !== queue.textChannel.id)
          return interaction.reply({
            content: `Music is currently playing and channel bonded to <#${queue.textChannel.id}>\nYou can use this command there :)`,
            ephemeral: true,
          });
      }

      command.execute(interaction.client, interaction);
    } catch (error) {
      await interaction.reply({
        content: "somehting went wrong when trying to execute this command",
        ephemeral: true,
      });
      console.error(error);
    }
  },
};
