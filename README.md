# Botpress RocketChat

Rocketchat connector for Botpress

## Example usage

```js
module.exports = function(bp) {
    bp.hear({
        type: /message|text/i,
        text: /qq/
    }, (event, next) => {
        bp.rocketchat.sendMessage('GENERAL', 'test');
    })
}
```

## Reference

### Incoming

```js
bp.hear({
    platform: 'rocketchat',
    type: 'message',
    text: 'hello'
}, (event, next) => {
    bp.rocketchat.sendMessage('GENERAL', 'Welcome!')
})