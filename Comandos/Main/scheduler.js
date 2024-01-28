const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const moment = require('moment-timezone');
const Discord = require('discord.js');
const { ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');

// Abra o banco de dados SQLite
let db = new sqlite3.Database('./data/agendamentos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('6');
});

// Adicione o parâmetro client à função
function scheduleTasks(client) {
    // Agende uma tarefa para ser executada a cada minuto
    cron.schedule('* * * * *', () => {
        // Consulte todos os agendamentos pendentes no banco de dados
        db.all(`SELECT * FROM agendamentos WHERE status = 'pendente'`, [], (err, rows) => {
            if (err) {
                throw err;
            }

            rows.forEach((row) => {
                const dateTimePT = moment.tz(`${row.data} ${row.hora}`, 'YYYY-MM-DD HH:mm:ss', 'Europe/Lisbon'); // Combine a data e a hora antes de converter
                const agora = moment().tz("Europe/Lisbon"); // Converta o horário atual para o fuso horário de Portugal
            
                // Se o agendamento for daqui a uma hora
                if (dateTimePT.diff(agora, 'minutes') <= 60 && dateTimePT.diff(agora, 'minutes') > 0) {
                    // Obtenha a guilda usando o ID manualmente
                    const guild = client.guilds.cache.get('1191515880690032650');

                    // Verifique se a guilda existe
                    if (!guild) {
                        console.error(`Guilda não encontrada`);
                        return;
                    }

                    // Chame a função iniciarAgendamento
                    iniciarAgendamento(client, guild, row);
                }
            });
        });
    });
}

module.exports = { scheduleTasks };

async function iniciarAgendamento(client, guild, agendamento) {
    // Encontre a categoria "ativo" pelo ID
    let activeCategory = guild.channels.cache.get('1196616908594745424');

    // Verifique se a categoria "ativo" existe
    if (!activeCategory) {
        console.error(`Categoria não encontrada`);
        return;
    }

    // Encontre a role "User"
    let userRole = guild.roles.cache.find(role => role.name === "User");

    // Verifique se a role "User" existe
    if (!userRole) {
        console.error(`Role "User" não encontrada`);
        return;
    }

    // Crie um novo canal de chamado na categoria "ativo"
    const channel = await guild.channels.create({
        name: `a-${agendamento.id}`,
        type: ChannelType.GuildText,
        parent: activeCategory.id, // Use the ID of the category
        permissionOverwrites: [
            {
                id: guild.id, // role ID for @everyone
                deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone to view/read this channel
            },
            {
                id: userRole.id, // role ID for "User"
                allow: [PermissionsBitField.Flags.ViewChannel], // Allow "User" role to view/read this channel
            },
        ],
    });

    // Crie um embed
    const embed = new EmbedBuilder()
        .setTitle('Novo Agendamento')
        .setDescription(`Agendamento iniciado por <@${agendamento.userRoleId}>`)
        .setColor('#0099ff');

    // Envie a mensagem com o embed
    channel.send({ embeds: [embed] });

    // Atualize o status do agendamento para "ativo"
    db.run(`UPDATE agendamentos SET status = 'ativo' WHERE id = ?`, [agendamento.id], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Agendamento ${agendamento.id} definido como ativo`);
    });
}