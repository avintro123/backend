class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message; // Fixed typo: 'messagee' to 'message'
        this.success = statusCode < 400; // Fixed: used assignment operator instead of comparison operator
    }
}
