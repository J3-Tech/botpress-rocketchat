import util from 'util'
import path from 'path'
import fs from 'fs'

import * as incoming from './incoming';
import * as outgoing from './outgoing';
import * as umm from './umm';
import * as actions from './actions';
import { EventTypes } from './events';

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
    if (event.platform == 'rocketchat') {
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
    if (event.platform !== 'rocketchat') {
        return next();
    }
    switch (event.type) {
        case 'message':
            {
                if (!event.roomId) {
                    return next('Space name missing in message event');
                }
                outgoing.sendMessage(loadConfig(), event.roomId, event.text);
                break;
            }
        default:
            {
                return next(`Unsupported event type: ${event.type}`);
            }
    }
}

module.exports = {

    config: {
        scheme: { type: 'string', default: 'http', env: 'ROCKETCHAT_SCHEME', required: true },
        host: { type: 'string', default: 'demo.rocket.chat', env: 'ROCKETCHAT_HOST', required: true },
        port: { type: 'string', default: '80', env: 'ROCKETCHAT_PORT', required: true },
        user: { type: 'string', default: '', env: 'ROCKETCHAT_USER', required: true },
        password: { type: 'string', default: '', env: 'ROCKETCHAT_PASSSWORD', required: true }
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

        bp.rocketchat = {};
        bp.rocketchat.sendMessage = async(roomId, message) =>
            bp.middlewares.sendOutgoing(
                actions.createMessageOutgoingEvent(roomId, message)
            );
        bp.rocketchat.createMessage = actions.createMessageOutgoingEvent;

        umm.registerUmmConnector(bp);
    },

    ready: async function(bp, configurator) {
        const router = bp.getRouter('botpress-rocketchat')
        router.get('/config', (req, res) => {
            res.send(loadConfig())
        })

        router.post('/config', (req, res) => {
            const { scheme, host, port, user, password } = req.body

            saveConfig({ scheme, host, port, user, password })

            res.sendStatus(200)
        })

        await outgoing.createClient(loadConfig())
        incoming.setupIncomingEvents(bp);
    }
}