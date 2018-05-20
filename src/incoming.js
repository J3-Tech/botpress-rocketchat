import { EventTypes } from './events';

export function setupIncomingEvents(bp) {
    const router = bp.getRouter('botpress-rocketchat');
    router.post('/', (req, res) => {
        const event = req.body;
        if (!event || !event.type) {
            return res.status(400).end();
        }
        switch (event.type) {
            case 'MESSAGE':
                {
                    bp.middleware.sendIncoming({
                        type: EventTypes.message,
                        platform: 'rocketchat',
                        text: event.message.text,
                        roomId: event.roomId,
                        user: { id: event.user.name, ...event.user },
                        thread: event.message.thread.name,
                        raw: event
                    });
                    break;
                }
            default:
                {
                    return res.status(400).end();
                }
        }
        res.status(200).end();
    })
}