const { Client, Collection } = require("discord.js");
const fs = require("fs");
const { join } = require("path");
const { token, radioToken } = require("./config.json");

const client = new Client({ intents: 32767 });
const radioClient = new Client({ intents: 32767 });

client.radioClient = radioClient;
client.commands = new Collection();
client.queue = new Map();

//deploying all commands
require("./deploy-commands");

//event handler
const eventFiles = fs.readdirSync(join(__dirname, "events")).filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

//command handler
const categoryFolders = fs.readdirSync(join(__dirname, "commands"));

categoryFolders.forEach((category) => {
  const commandFiles = fs
    .readdirSync(join(__dirname, "commands", category))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${category}/${file}`);
    client.commands.set(command.data.name, command);
  }
});

radioClient.on("ready", () => {
  console.log(`${radioClient.user.username} is with ${client.user.username}`);
});

// client.on("interaction", (interaction) => {

// })

client.login(token);
radioClient.login(radioToken);
