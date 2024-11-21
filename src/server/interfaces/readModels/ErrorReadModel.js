class ErrorReadModel {
    constructor() {
        this.errors = [];
    }

    // Method to log error events
    onApiCallFailed(event) {
        this.errors.push(event);
        console.error(JSON.stringify(event, null, 2));
    }

    // Method to retrieve logged errors with optional filtering
    getErrors(filter = {}) {
        const { type, after } = filter;
        return this.errors.filter(error => {
            let matches = true;
            if (type) {
                matches = matches && error.type === type;
            }
            if (after) {
                matches = matches && new Date(error.timestamp) >= new Date(after);
            }
            return matches;
        });
    }

    // Method to clear logged errors
    clearErrors() {
        this.errors = [];
    }
}

export default ErrorReadModel;