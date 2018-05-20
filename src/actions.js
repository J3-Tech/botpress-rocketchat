import { EventTypes } from './events';

export function createMessageOutgoingEvent(roomId, text) {
    const event = {
        platform: 'rocketchat',
        type: EventTypes.message,
        text: text,
        roomId: roomId,
        raw: { roomId, text }
    }
    return event;
}