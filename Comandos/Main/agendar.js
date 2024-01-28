const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment-timezone');

// Abra o banco de dados SQLite
let db = new sqlite3.Database('./data/agendamentos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('1');
});

// Crie a tabela de agendamentos, se ela ainda não existir
db.run(`CREATE TABLE IF NOT EXISTS agendamentos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente'
)`);

// Verifique se um ID já existe no banco de dados
function idExists(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id FROM agendamentos WHERE id = ?`, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? true : false);
            }
        });
    });
}

module.exports = {
    name: 'agendar', // Nome do comando
    description: 'Agenda um novo evento', // Descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'data',
            description: 'A data do evento (dd/mm/aa)',
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'hora',
            description: 'A hora do evento (hh:mm)',
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'conteudo',
            description: 'O conteúdo do evento',
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        }
    ],

    run: async (client, interaction) => {
        let data = interaction.options.getString('data');
        let hora = interaction.options.getString('hora');
        const conteudo = interaction.options.getString('conteudo');
    
        // Verifique se a data e a hora estão no formato correto
        if (!moment(`${data} ${hora}`, 'DD/MM/YYYY HH:mm').isValid()) {
            return await interaction.reply('A data ou a hora estão em um formato inválido. Por favor, use o formato DD/MM/YYYY para a data e HH:mm para a hora.');
        }
    
        // Converta a data e a hora para o fuso horário de Portugal
        let dataHora = moment.tz(`${data} ${hora}`, 'DD/MM/YYYY HH:mm', 'Europe/Lisbon');
    
        // Obtenha a data e hora atuais de Lisboa
        let agora = moment.tz('Europe/Lisbon');
    
        // Verifique se a data e hora fornecidas são anteriores à data e hora atuais
        if (dataHora.isBefore(agora)) {
            return await interaction.reply('Data/hora inválidos.\nPor favor, insira uma data/hora futura.');
        }
    
        data = dataHora.format('YYYY-MM-DD HH:mm:ss');    
    
        // Gere um ID aleatório de 5 dígitos
        let id;
        do {
            id = Math.floor(Math.random() * 90000) + 10000;
        } while (await idExists(id)); // Continue gerando um novo ID até que encontre um que não exista no banco de dados
    
        // Insira o novo agendamento no banco de dados
        db.run(`INSERT INTO agendamentos(id, data, hora, conteudo, status) VALUES(?, ?, ?, ?, ?)`, [id, data, hora, conteudo, 'pendente'], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`Um novo agendamento foi inserido com o ID: ${id}`);
        });
    
        await interaction.reply('Evento agendado com sucesso!');
    }
}