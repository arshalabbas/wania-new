module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
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
