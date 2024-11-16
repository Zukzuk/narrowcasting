const express = require('express');
const router = express.Router();

const { handleError } = require('../../deprecated/utils');

function AppApi(models) {
    const {
        versionReadModel
    } = models;

    /**
     * @openapi
     * /api/version:
     *   get:
     *     summary: Get the application version
     *     description: Returns the current semantic version of the application as plain text.
     *     responses:
     *       200:
     *         description: Successfully retrieved version
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: "1.2.3"
     *               description: Semantic version of the application
     *       500:
     *         description: Internal server error
     */
    router.get('/version', async (req, res) => {
        try {
            const response = await versionReadModel.query();
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.type('text').send(response); // Send as plain text
        } catch (error) {
            handleError(error, res, "Error requesting version");
        }
    });

    return router;
}

module.exports = AppApi;
