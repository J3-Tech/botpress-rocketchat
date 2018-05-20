import * as actions from './actions';

function processOutgoing({ event, blocName, instruction }) {
    if ('text' in instruction) {
        return actions.createMessageOutgoingEvent(
            event.roomId,
            instruction.text
        );
    }

    const unrecognizedInstruction = {...instruction };
    if ('text' in instruction) delete unrecognizedInstruction.text;
    throw new Error(
        `Unrecognized instruction on Slack in bloc '${blocName}': ${unrecognizedInstruction}`
    );
}

export function registerUmmConnector(bp) {
    const { umm } = bp;
    if (umm && umm.registerConnector) {
        umm.registerConnector({
            platform: 'rocketchat',
            processOutgoing: args => processOutgoing({...args, bp }),
            templates: []
        });
    }
}