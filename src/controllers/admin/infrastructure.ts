const axios = require('axios');
const { logAdminAction } = require('../../utils/auditLog');

/**
 * GET /api/v1/admin/infrastructure/health
 * Check health of API and AI Engine services
 */
exports.getInfrastructureHealth = async (req, res) => {
    try {
        const healthChecks = [];

        // Check API health (self)
        const apiStart = Date.now();
        const apiHealth = {
            service: 'API Server',
            status: 'healthy',
            latency: Date.now() - apiStart,
            url: process.env.API_URL || 'http://localhost:4000'
        };
        healthChecks.push(apiHealth);

        // Check AI Engine health
        const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        let aiEngineHealth = {
            service: 'AI Engine',
            status: 'unknown',
            latency: null,
            url: aiEngineUrl
        };

        try {
            const aiStart = Date.now();
            const aiResponse = await axios.get(`${aiEngineUrl}/health`, { timeout: 5000 });
            aiEngineHealth.status = aiResponse.status === 200 ? 'healthy' : 'degraded';
            aiEngineHealth.latency = Date.now() - aiStart;
        } catch (error) {
            aiEngineHealth.status = 'unhealthy';
            aiEngineHealth.error = error.message;
        }
        healthChecks.push(aiEngineHealth);

        // TODO: Integrate Google Cloud Monitoring API for memory usage
        // This would require @google-cloud/monitoring package and service account credentials

        await logAdminAction(req.user.id, 'CHECK_INFRASTRUCTURE_HEALTH');

        res.json({
            timestamp: new Date().toISOString(),
            services: healthChecks,
            overall_status: healthChecks.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'
        });
    } catch (error) {
        console.error('[ADMIN] Infrastructure health check error:', error);
        res.status(500).json({ error: 'Failed to check infrastructure health' });
    }
};
