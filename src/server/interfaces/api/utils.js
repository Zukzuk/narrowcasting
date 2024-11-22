export function handleError(error, res, message) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}