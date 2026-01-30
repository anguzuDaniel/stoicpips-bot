import axios from 'axios';

async function testCors() {
    console.log("Testing CORS Headers...");
    try {
        const res = await axios.options("http://localhost:3000/api/v1/admin/bug-reports/123/status");

        const allowedMethods = res.headers['access-control-allow-methods'];
        console.log("Allowed Methods:", allowedMethods);

        if (allowedMethods && allowedMethods.includes('PATCH')) {
            console.log("✅ CORS Check PASSED: PATCH is allowed.");
        } else {
            console.error("❌ CORS Check FAILED: PATCH is missing.");
        }
    } catch (e: any) {
        console.error("Request Failed:", e.message);
    }
}

testCors();
