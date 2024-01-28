const Discord = require('discord.js');
const { ChannelType, EmbedBuilder, PermissionsBitField } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./data/agendamentos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('3');
});

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
    name: 'chamar',
    description: 'Cria um canal de chamado e menciona o administrador',
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        let userRole = interaction.guild.roles.cache.find(role => role.name === "User");

        const guild = client.guilds.cache.get('1191515880690032650');
        
        if (!userRole) {
            console.error(`Role "User" não encontrada`);
            return;
        }

        // Gere um ID aleatório de 5 dígitos
        let id;
        do {
            id = Math.floor(Math.random() * 90000) + 10000;
        } while (await idExists(id)); 

        let currentDatetime = new Date().toLocaleString("en-GB", {timeZone: "Europe/Lisbon"});
        let currentTime = new Date().toLocaleString("en-GB", {timeZone: "Europe/Lisbon", hour: '2-digit', minute:'2-digit', second:'2-digit'});

        db.run(`INSERT INTO agendamentos (id, status, data, hora, conteudo) VALUES (?, ?, ?, ?, '')`, [id, 'chamado', currentDatetime, currentTime], function(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Chamado ${id} adicionado ao banco de dados.`);
        });

        const channel = await interaction.guild.channels.create({
            name: `c-${id}`,
            type: ChannelType.GuildText,
            parent: '1196616908594745424', // ID da categoria
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

        const adminRole = interaction.guild.roles.cache.find(role => role.name === "StU");

        const embed = new EmbedBuilder()
            .setTitle('Novo Chamado')
            .setDescription(`Um novo chamado foi criado. ${adminRole}`)
            .setColor('#0099ff');

        channel.send({ embeds: [embed] });
    }
}