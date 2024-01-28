const fs = require("fs")

module.exports = async (client) => {

    const SlashsArray = []
    const subfolder = 'Main';

    fs.readdir(`./Comandos/${subfolder}/`, (error, files) => {
        if (error) {
            console.error(`Error reading directory: ${error}`);
            return;
        }
    
        if (!Array.isArray(files)) {
            console.error(`'files' is not an array: ${files}`);
            return;
        }
    
        files.forEach(file => {
            if (!file.endsWith('.js')) return;
            const fileContent = require(`../Comandos/${subfolder}/${file}`);
            if (!fileContent.name) return;
            client.slashCommands.set(fileContent.name, fileContent);

            SlashsArray.push(fileContent)
        });
    });

    client.on("ready", async () => {
        client.guilds.cache.forEach(guild => guild.commands.set(SlashsArray))
    });
};