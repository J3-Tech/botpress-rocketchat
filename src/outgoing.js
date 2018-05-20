import rocketchat from 'rocketchat';

let client = null;

export async function createClient(config) {
    client = new rocketchat.RocketChatApi(config.scheme, config.host, config.port, config.user, config.password);
}

export async function sendMessage(config, roomId, message) {
    client.login(config.user, config.password, function(err, body) {
        client.sendMsg(roomId, message, function(err, body) {
            if (err)
                console.log(err);
            else
                console.log(body);
        })
    });
}