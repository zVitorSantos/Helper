const Discord = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help', // Nome do comando
    description: 'Exibe informações de ajuda sobre todos os comandos', 
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        // Crie uma nova embed para cada comando
        const embedAgendar = new EmbedBuilder()
                .setTitle('Sistema de agendamento')
                .setDescription('**/agendar**:\nPermite agendar um teste.\nVocê precisa fornecer a data **(dd/mm/aa)**, a hora **(hh:mm)** e o conteúdo do teste. O teste é salvo com um código único.\nUma hora antes do teste, o bot cria um novo canal e envia uma mensagem mencionando todos.\nQuando o teste termina, o administrador pode digitar **/finalizar** para dar o teste como concluído.');

        const embedConsultar = new EmbedBuilder()
                .setTitle('Sistema de consulta')
                .setDescription('**/consultar**:\nExibe uma lista de todos os testes agendados.\nCada teste tem um status que pode ser visualizado.\n**/cancelar**:\nSeguido do código do teste remove o agendamento.');

        const embedChamar = new EmbedBuilder()
                .setTitle('Sistema de chamada imediata')
                .setDescription('**/chamar**:\nCria um canal de chamada e menciona o ajudante.');

        // Responda com todas as embeds
        await interaction.reply({ embeds: [embedAgendar, embedConsultar, embedChamar] });
    }
}