"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { deriv } = require('../config/deriv');
async function buyContractOnDeriv(signal, proposalId) {
    return new Promise((resolve, reject) => {
        const requestId = Date.now();
        const handler = (data) => {
            if (data.req_id === requestId) {
                deriv.off('message', handler);
                if (data.buy) {
                    resolve(data);
                }
                else {
                    reject(new Error('Buy request failed'));
                }
            }
        };
        deriv.on('message', handler);
        deriv.send({
            buy: proposalId,
            price: signal.amount,
            req_id: requestId
        });
        setTimeout(() => {
            deriv.off('message', handler);
            reject(new Error('Timeout buying contract'));
        }, 5000);
    });
}
module.exports = buyContractOnDeriv;
