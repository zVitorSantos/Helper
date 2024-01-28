const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { ChannelType, EmbedBuilder, PermissionsBitField} = require('discord.js');

// Abra o banco de dados SQLite
let db = new sqlite3.Database('./data/agendamentos.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('5');
});

module.exports = {
    name: 'finalizar', // Nome do comando
    description: 'Finaliza o chamado atual', // Descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'id',
            type: Discord.ApplicationCommandOptionType.Integer, // Tipo INTEGER
            description: 'O ID do agendamento a ser finalizado',
            required: true,
        },
    ],

    run: async (client, interaction) => {
        // Obtenha o ID do agendamento do argumento
        const agendamentoId = interaction.options.getInteger('id');

        // Verifique se agendamentoId é válido
        if (!agendamentoId) {
            console.error('ID do agendamento inválido');
            return;
        }

        console.log(`Agendamento ID: ${agendamentoId}`);

        const guild = client.guilds.cache.get('1191515880690032650');

        await interaction.deferReply();

        // Verifique se existe um agendamento com o ID fornecido
        db.get(`SELECT * FROM agendamentos WHERE id = ?`, [agendamentoId], async (err, row) => {
            if (err) {
                return console.log(err.message);
            }

            // Se não existir um agendamento com o ID fornecido, retorne uma mensagem de erro
            if (!row) {
                return interaction.reply('Agendamento não encontrado.');
            }

            // Encontre o canal correspondente ao agendamento
            const channel = interaction.guild.channels.cache.find(c => c.name.includes(agendamentoId.toString()));

            // Encontre a role "User"
            const role = interaction.guild.roles.cache.find(r => r.name === "User");

            // Verifique se o canal existe
            if (!channel) {
                return interaction.reply('Canal não encontrado.');
            }

            if (row.status === 'chamado') {
                // Mova o canal para a categoria "concluídos"
                await channel.setParent('1196616746874966056');
            
                // Altere as permissões para que ninguém possa ver o canal
                await channel.permissionOverwrites.set([
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: role.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    }
                ]);
            
                console.log(`Chamado ${agendamentoId} foi movido e ocultado.`);
            } else if (row.status === 'ativo') {
                // Mova o canal para a categoria "concluídos"
                await channel.setParent('1196616746874966056');
            
                // Altere as permissões da role "User" para este canal
                await channel.permissionOverwrites.set([
                    {
                        id: guild.id, 
                        allow: [PermissionsBitField.Flags.ViewChannel],
                        deny: [PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: role.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                        deny: [PermissionsBitField.Flags.SendMessages],
                    }
                ]);
            
                console.log(`Agendamento ${agendamentoId} foi movido.`);
            }
            // Atualize o status do chamado no banco de dados para "concluido"
            db.run(`UPDATE agendamentos SET status = 'concluido' WHERE id = ?`, [agendamentoId], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`Agendamento ${agendamentoId} foi finalizado.`);
            });
        });

        try {
            await interaction.followUp('Chamado finalizado com sucesso!');
        } catch (err) {
            console.error('Não foi possível enviar a mensagem de acompanhamento:', err);
        }
    }
}