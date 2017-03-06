/*
  Botpress module template. This is your module's entry point.
  Please have a look at the docs for more information about config, init and ready.
  https://docs.botpress.io
*/
//import checkVersion from 'botpress-version-manager';

import outgoing from './outgoing'
import actions from './actions';

import _ from 'lodash';
import Promise from 'bluebird';

import RocketChat from './rocketchat';

let rocketchat = null
const outgoingPending = outgoing.pending

const outgoingMiddleware = (event, next) => {
  if (event.platform !== 'rocketchat') {
    return next()
  }

  if (!outgoing[event.type]) {
    return next('Unsupported event type: ' + event.type)
  }

  const setValue = method => (...args) => {
    if (event.__id && outgoingPending[event.__id]) {
      outgoingPending[event.__id][method].apply(null, args)
      delete outgoingPending[event.__id]
    }
  }

  outgoing[event.type](event, next, rocketchat)
  .then(setValue('resolve'), setValue('reject'))
}


module.exports = {

  config: {
    protocol: { type: 'string', default: 'http', env: 'ROCKETCHAT_PROTOCOL' },
    host: { type: 'string', default: 'demo.rocket.chat', env: 'ROCKETCHAT_HOST' },
    port: { type: 'string', default: '80', env: 'ROCKETCHAT_PORT' },
    user: { type: 'string', default: '', env: 'ROCKETCHAT_USER' },
    password: { type: 'string', default: '', env: 'ROCKETCHAT_PASSSWORD' }
  },

  init: async function(bp, configurator) {
    //checkVersion(bp, __dirname)
		bp.middlewares.register({
      name: 'rocketchat.sendMessages',
      type: 'outgoing',
      order: 100,
      handler: outgoingMiddleware,
      module: 'botpress-rocketchat',
      description: 'Sends out messages that targets platform = rocketchat.' +
      ' This middleware should be placed at the end as it swallows events once sent.'
		});

    bp.rocketchat = {};
    _.forIn(actions, (action, name) => {
      bp.rocketchat[name] = actions[name];
      let sendName = name.replace(/^create/, 'send');
      bp.rocketchat[sendName] = Promise.method(function(){
        var msg = action.apply(this, arguments)

        console.log(msg);

        bp.middlewares.sendOutgoing(msg)

        return promise
      })
    })
  },

  ready: async function(bp, configurator) {

    const config = await configurator.loadAll()
    rocketchat = new RocketChat(config);
    const router = bp.getRouter('botpress-rocketchat', { 'auth': req => !/\/action-endpoint/i.test(req.originalUrl) })

    const setConfigAndRestart = async newConfigs => {
      await configurator.saveAll(newConfigs)
      rocketchat.setConfig(newConfigs)
      rocketchat.connect()
    }

    rocketchat.connect();

    router.get('/config', async (req, res) => {
      res.json(await configurator.loadAll())
    })

    router.post('/config', async (req, res) => {
      setConfigAndRestart(req.body)
      res.json(await configurator.load())
    })
  }
}
