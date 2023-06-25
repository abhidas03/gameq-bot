const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder, Client } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gameq')
		.setDescription('Create a queue for a game.')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Title the queue.')
				.setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Set a time to play.')
                .setRequired(true)),

	async execute(interaction) {
		const name = interaction.options.getString('name');
		const time = interaction.options.getString('time');
        
        let queueList = [];
        let interestedList = [];

		const queue = new ButtonBuilder()
			.setCustomId('queue')
			.setLabel('Join Queue')
			.setStyle(ButtonStyle.Primary);

		const interested = new ButtonBuilder()
			.setCustomId('interested')
			.setLabel('Interested')
			.setStyle(ButtonStyle.Secondary);

        const leave = new ButtonBuilder()
            .setCustomId('leave')
            .setLabel('Leave')
            .setStyle(ButtonStyle.Secondary);

        const ping = new ButtonBuilder()
            .setCustomId('ping')
            .setLabel('Ping Queue')
            .setStyle(ButtonStyle.Secondary);

        const code = new ButtonBuilder()
            .setLabel('Code')
            .setURL('https://github.com/abhidas03/gameq-bot')
            .setStyle(ButtonStyle.Link);



        const row = new ActionRowBuilder()
        .addComponents(queue, interested, leave, ping, code);

        queueList.push(interaction.user)

        const response = await interaction.reply({
			content: `Queue for ${name} at ${time}\nCurrent Queue: ${queueList.join(', ')}\nInterested: ${interestedList.join(', ')}`,
			components: [row],
		});

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });


        async function handleSelection (i, selection) {
            if (selection === 'queue') {
                if (!queueList.includes(i.user)) {
                    queueList.push(i.user);

                }
                if (interestedList.includes(i.user)) {
                    const index = interestedList.indexOf(i.user);
                    if (index > -1) { 
                        interestedList.splice(index, 1); 
                    }
                }
            }
            else if (selection === 'interested') {
                if (!interestedList.includes(i.user)) {
                    interestedList.push(i.user);
                }
                if (queueList.includes(i.user)) {
                    const index = queueList.indexOf(i.user);
                    if (index > -1) { 
                        queueList.splice(index, 1); 
                    }
                }
            }
            else if (selection === 'leave') {
                if (interestedList.includes(i.user)) {
                    const index = interestedList.indexOf(i.user);
                    if (index > -1) { 
                        interestedList.splice(index, 1); 
                    }
                }
                if (queueList.includes(i.user)) {
                    const index = queueList.indexOf(i.user);
                    if (index > -1) { 
                        queueList.splice(index, 1); 
                    }
                }
            }
        }

        collector.on('collect', async i => {
            const selection = i.customId;
            handleSelection(i, selection)
            await i.update(`Queue for ${name} at ${time}\nCurrent Queue: ${queueList.join(', ')}\nInterested: ${interestedList.join(', ')}`)
            if (selection === 'ping') {
                try {
                    await i.followUp(queueList.join(', '));
                }
                catch {
                    console.log('No Queue');
                }
            }
        });

	},
    
};