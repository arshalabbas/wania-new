module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`${client.user.username} is online!`);
    client.user.setActivity({ name: "/play", type: "LISTENING" });
  },
};
