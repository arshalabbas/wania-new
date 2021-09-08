const { errorEmbed } = require("../utils/global");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      if (command.developer && interaction.user.id !== "751736021661778004")
        return interaction.reply({ embeds: [errorEmbed("You can't use this command.")] });

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
