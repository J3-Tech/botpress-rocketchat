const handlePromise = (next, promise) => {
  return promise.then(res => {
    next()
    return res
  })
  .catch(err => {
    next(err)
    throw err
  })
}

const handleText = (event, next, rocketchat) => {
  if (event.platform !== 'rocketchat' || event.type !== 'text') {
    return next()
  }

  const channelId = event.raw.channelId
  const text = event.text
  const options = event.raw.options

  return handlePromise(next, rocketchat.sendText(channelId, text, options))
}


module.exports = {
  'text': handleText,
  pending: {}
}
