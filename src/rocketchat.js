import RocketChatApi from 'rocketchat';

class RocketChat {
	constructor(config){
		this.config = config;
	}

	setConfig(config) {
    this.config = config
  }

	connect() {
		this.client = new RocketChatApi.RocketChatApi(
			this.config.protocol,
			this.config.host,
			this.config.port,
			this.config.user,
			this.config.password
		);
	}
}

module.exports = RocketChat;
