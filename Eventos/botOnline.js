require('../index')

const Discord = require('discord.js')
const client = require('../index')
const { scheduleTasks } = require('../Comandos/Main/scheduler');

client.on('ready', () => {
    console.log(`🔥 Estou online em ${client.user.username}!`);
    scheduleTasks(client);
});