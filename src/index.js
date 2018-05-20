import util from 'util'
import path from 'path'
import fs from 'fs'

import rocketchat from 'rocketchat';

let rocketChatApi = null
let configFile = null

const saveConfig = (config) => {
    fs.writeFileSync(configFile, JSON.stringify(config))
}

const loadConfig = () => {
    if (!fs.existsSync(configFile)) {
        const config = { scheme: '', host: '', port: '', user: '', password: '' }
        saveConfig(config, configFile)
    }

    return Object.assign(JSON.parse(fs.readFileSync(configFile, 'utf-8')))
}

const callback = (logger) => {
    return (error, response, body) => {
        if (error) {
            logger.debug('[botpress-rocketchat] Error: ' + error.message)
        } else if (body && body.error) {
            logger.debug('[botpress-rocketchat] ' + body.code + ': ' + util.inspect(body.error, false, null))
        }
    }
}

const incomingMiddleware = (event, next) => {
    if (event.platform == 'facebook') {
        let payload = {
            entry: [{
                messaging: [event.raw]
            }]
        }

        dialog.incoming(payload, callback(event.bp.logger))
        event.bp.logger.verbose('[botpress-rocketchat] Incoming message')
    }

    next()
}

const outgoingMiddleware = (event, next) => {
    if (event.platform == 'facebook') {
        // Rebuild response object expected by dialog-api
        let response = {
            message_id: event.__id, // Not the real Facebook message ID, but whatever
            recipient_id: event.raw.to
        }

        // Rebuild payload object expected by dialog-api
        let payload
        if (event.type == 'text') {
            payload = {
                message: {
                    text: event.raw.message,
                    quick_replies: event.raw.quick_replies
                }
            }
        } else if (event.type == 'template') {
            payload = {
                message: {
                    attachment: {
                        type: 'template',
                        payload: event.raw.payload
                    }
                }
            }
        } else if (event.type == 'attachment') {
            payload = {
                message: {
                    attachment: {
                        type: event.raw.type,
                        payload: event.raw
                    }
                }
            }
        } else {
            // noop
        }

        if (payload) {
            dialog.outgoing(payload, response, callback(event.bp.logger))
            event.bp.logger.verbose('[botpress-rocketchat] Outgoing message')
        }
    }

    next()
}

module.exports = {

    config: {
        scheme: { type: 'string', default: 'http', env: 'ROCKETCHAT_SCHEME', required: true },
        host: { type: 'string', default: 'demo.rocket.chat', env: 'ROCKETCHAT_HOST', required: true },
        port: { type: 'string', default: '80', env: 'ROCKETCHAT_PORT' },
        user: { type: 'string', default: '', env: 'ROCKETCHAT_USER' },
        password: { type: 'string', default: '', env: 'ROCKETCHAT_PASSSWORD' }
    },

    init: async function(bp, configuration, helpers) {
        configFile = path.join(bp.projectLocation, bp.botfile.modulesConfigDir, 'botpress-rocketchat.json')
        bp.middlewares.register({
            name: 'rocketchat.sendMessages',
            module: 'botpress-rocketchat',
            type: 'outgoing',
            handler: outgoingMiddleware,
            order: 0,
            description: 'Sends out messages that targets platform = rocketchat.' +
                ' This middleware should be placed at the end as it swallows events once sent.'
        });

        let config = loadConfig()

        rocketChatApi = new rocketchat.RocketChatApi(config.scheme, config.host, config.port, config.user, config.password);
    },

    ready: async function(bp, configurator) {
        const router = bp.getRouter('botpress-rocketchat')
        router.get('/config', (req, res) => {
            res.send(loadConfig())
        })

        router.post('/config', (req, res) => {
            const { scheme, host, port, user, password } = req.body

            saveConfig({ scheme, host, port, user, password })

            rocketChatApi = new rocketchat.RocketChatApi(scheme, host, port, user, password);

            res.sendStatus(200)
        })
    }
}