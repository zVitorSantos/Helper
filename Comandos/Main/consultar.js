const Discord = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment-timezone');

// Abra o banco de dados SQLite
let db = new sqlite3.Database('./data/agendamentos.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('4');
});

module.exports = {
    name: 'consultar', // Nome do comando
    description: 'Consulta todos os agendamentos', 
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'status',
            description: 'O status dos agendamentos a consultar',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Todos', value: 'todos' },
                { name: 'Chamado', value: 'chamado' },
                { name: 'Concluído', value: 'concluido' },
                { name: 'Pendente', value: 'pendente' } 
            ]
        }
    ],

    run: async (client, interaction) => {
        const status = interaction.options.getString('status');

        let query = `SELECT * FROM agendamentos`;
        if (status !== 'todos') {
            if (status === 'pendente') {
                query += ` WHERE status NOT IN ('chamado', 'ativo', 'concluido')`;
            } else {
                query += ` WHERE status = '${status}'`;
            }
        }

        db.all(query, [], (err, rows) => {
            if (err) {
                throw err;
            }
        
            if (rows.length === 0) {
                let responseMessage;
                switch (status) {
                    case 'todos':
                        responseMessage = 'Não tem nada.';
                        break;
                    case 'chamado':
                        responseMessage = 'Não há nenhum chamado.';
                        break;
                    case 'concluido':
                        responseMessage = 'Não há agendamentos concluídos.';
                        break;
                    case 'pendente':
                        responseMessage = 'Não há agendamentos pendentes.';
                        break;
                    default:
                        responseMessage = 'Não há agendamentos.';
                }
                return interaction.reply(responseMessage);
            }
    
            const embed = new EmbedBuilder()
                .setTitle('Agendamentos')
                .setColor('#0099ff');
    
            rows.forEach((row) => {
                let fieldValue;
                if (row.status === 'pendente') {
                    const dataPT = moment(row.data).format('YYYY-MM-DD');
                    const horaPT = moment(row.hora, 'HH:mm:ss').format('HH:mm');
                    const dateTimePT = `${dataPT} ${horaPT}`;
                    const horaBR = moment.tz(dateTimePT, 'YYYY-MM-DD HH:mm', 'Europe/Lisbon').tz('America/Sao_Paulo').format('HH:mm');
                    fieldValue = `**Data:** ${dataPT}\n**Hora:** ${horaPT} (PT), ${horaBR} (BR)\n**Conteúdo:**\n${row.conteudo}\n**Status:** ${row.status}\n`;
                } else {
                    fieldValue = `**Data:** ${dataPT}\n**Hora:** ${horaPT} (PT), ${horaBR} (BR)\n**Status:** ${row.status}\n`;
                }
            
                const field = { name: `**ID: ${row.id}**\n`, value: fieldValue }; // Armazene o campo em uma variável

                embed.addFields(field);
            });

            interaction.reply({ embeds: [embed] });

        });
    }
}