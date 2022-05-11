"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const notificationService_1 = require("../service/notificationService");
const handler = async (event) => {
    if (!event?.queryStringParameters?.state)
        return {
            statusCode: 400,
        };
    const openOrClose = event.queryStringParameters?.state;
    if (!isDoorState(openOrClose))
        return {
            statusCode: 400,
        };
    try {
        await (0, notificationService_1.notify)(openOrClose);
        return {
            statusCode: 204,
        };
    }
    catch (err) {
        return {
            statusCode: 500,
        };
    }
};
exports.handler = handler;
function isDoorState(state) {
    return state === 'open' || state === 'close';
}
