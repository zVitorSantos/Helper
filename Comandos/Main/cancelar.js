const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Abra o banco de dados SQLite
let db = new sqlite3.Database('./data/agendamentos.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('2');
});

module.exports = {
    name: 'cancelar', // Nome do comando
    description: 'Cancela um agendamento', // Descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'id',
            description: 'O ID do agendamento',
            type: Discord.ApplicationCommandOptionType.Integer,
            required: true
        }
    ],

    run: async (client, interaction) => {
        const id = interaction.options.getInteger('id');

        // Delete o agendamento do banco de dados
        db.run(`DELETE FROM agendamentos WHERE id = ?`, id, function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`Agendamento com o ID ${id} foi cancelado.`);
        });

        await interaction.reply(`Agendamento com o ID ${id} foi cancelado com sucesso!`);
    }
}