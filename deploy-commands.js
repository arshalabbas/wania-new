const fs = require("fs");
const { join } = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [];
const devCommands = [];

const categoryFolders = fs.readdirSync(join(__dirname, "commands"));

categoryFolders.forEach((category) => {
  const commandFiles = fs
    .readdirSync(join(__dirname, "commands", category))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${category}/${file}`);

    if (command.category === "Developer") {
      devCommands.push(command.data.toJSON());
    } else {
      commands.push(command.data.toJSON());
    }
  }
});

const rest = new REST({ version: "9" }).setToken(process.env.token);

(async () => {
  try {
    console.log("Starting registering commands");
    await rest.put(Routes.applicationCommands(process.env.clientId), { body: commands });
    await rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.devGuildId), {
      body: devCommands,
    });
    console.log("Successfully registered all commands");
  } catch (error) {
    console.error(error);
  }
})();
