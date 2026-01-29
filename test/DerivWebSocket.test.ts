import { DerivWebSocket } from '../src/deriv/DerivWebSocket';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

describe('DerivWebSocket', () => {
    let deriv: DerivWebSocket;
    const token = process.env.DERIV_API_TOKEN;
    const appId = process.env.DERIV_APP_ID;

    if (!token || !appId) {
        throw new Error("Missing DERIV_API_TOKEN or DERIV_APP_ID in .env");
    }

    beforeAll(() => {
        deriv = new DerivWebSocket({
            apiToken: token,
            appId: appId,
            reconnect: false
        });
    });

    afterAll(async () => {
        if (deriv) {
            deriv.disconnect();
            // Allow time for socket to close and logs to flush
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });

    // Increase timeout for WebSocket operations
    jest.setTimeout(30000);

    it('should connect, authorize, and handle requests', (done) => {
        let authorized = false;

        const logHandler = async (log: any) => {
            if (log.type === 'info' && log.message.includes('Auth Data') && !authorized) {
                authorized = true;
                // Remove listener to prevent multiple calls
                deriv.off('log', logHandler);

                try {
                    expect(deriv.getStatus().authorized).toBe(true);

                    // Now test request
                    console.log("Sending ping request...");
                    const response = await deriv.request({ ping: 1 });
                    console.log("Ping response received:", response);

                    expect(response).toBeDefined();
                    expect(response.ping).toBe('pong');
                    expect(response.req_id).toBeDefined();

                    // Test invalid request (should return error, not timeout)
                    const errorResponse = await deriv.request({ invalid_request_forever: 1 });
                    expect(errorResponse.msg_type).toBe('error');
                    expect(errorResponse.error.code).toBe('UnrecognisedRequest');

                    done();
                } catch (error) {
                    done(error);
                }
            } else if (log.type === 'error') {
                console.error("Connection Error:", log);
            }
        };

        deriv.on('log', logHandler);
        deriv.connect();
    });
});
