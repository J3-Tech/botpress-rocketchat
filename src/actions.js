const createText = (roomId, message) => {
	return {
		platform: 'rocketchat',
		type: 'text',
		text: message,
		raw: {
			
		}
	};
}

module.exports = {
	createText
}
