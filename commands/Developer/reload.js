const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { join } = require("path");
const { errorEmbed } = require("../../utils/global");

let commands = [];

const folders = fs.readdirSync(join(__dirname, ".."));
folders.forEach((f) => {
  const files = fs.readdirSync(join(__dirname, "..", f)).filter((file) => file.endsWith(".js"));
  files.forEach((file) => {
    commands.push([file.split(".").slice(0, -1).join("."), file.split(".").slice(0, -1).join(".")]);
  });
});

const data = new SlashCommandBuilder()
  .setName("reload")
  .setDescription("only for developers")
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("Choose the command to reload.")
      .addChoices(commands)
      .setRequired(true)
  );

module.exports = {
  data,
  category: "Developer",
  async execute(client, interaction) {
    const commandName = interaction.options.getString("command");
    folders.forEach((f) => {
      const files = fs.readdirSync(join(__dirname, "..", f));
      if (files.includes(commandName + ".js")) {
        const file = `../${f}/${commandName}.js`;
        try {
          delete require.cache[require.resolve(file)];
          client.commands.delete(commandName);
          const pull = require(file);
          client.commands.set(commandName, pull);
          return interaction.reply({
            content: `command **${commandName}** successfully reloaded.`,
            ephemeral: true,
          });
        } catch (error) {
          interaction.reply({ embeds: [errorEmbed(`could not reload: **${commandName}**`)] });
          return console.error(error.stack || error);
        }
      }
    });
  },
};
