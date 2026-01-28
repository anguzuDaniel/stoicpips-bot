"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { deriv } = require('../config/deriv');
async function getProposalFromDeriv(signal) {
    return new Promise((resolve, reject) => {
        const requestId = Date.now();
        const handler = (data) => {
            if (data.req_id === requestId) {
                deriv.off('message', handler);
                if (data.proposal) {
                    resolve(data.proposal);
                }
                else {
                    reject(new Error('No proposal returned'));
                }
            }
        };
        deriv.on('message', handler);
        deriv.send({
            proposal: 1,
            amount: signal.amount,
            basis: 'stake',
            contract_type: signal.contract_type,
            currency: 'USD',
            duration: signal.duration,
            duration_unit: signal.duration_unit,
            symbol: signal.symbol,
            req_id: requestId
        });
        setTimeout(() => {
            deriv.off('message', handler);
            reject(new Error('Timeout getting proposal'));
        }, 5000);
    });
}
module.exports = getProposalFromDeriv;
