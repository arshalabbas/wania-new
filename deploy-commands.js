const fs = require("fs");
const { join } = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token } = require("./config.json");

//for development
const clientId = "807492889209733142";
const guildId = "779549784712544286";

const commands = [];

const categoryFolders = fs.readdirSync(join(__dirname, "commands"));

categoryFolders.forEach((category) => {
  const commandFiles = fs
    .readdirSync(join(__dirname, "commands", category))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${category}/${file}`);
    commands.push(command.data.toJSON());
  }
});

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Starting registering commands");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log("Successfully registered all commands");
    console.table(commands);
  } catch (error) {
    console.error(error);
  }
})();
