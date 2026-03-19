const API_BASE = '/api';

export async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 204) {
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                errors: [`HTTP ${response.status}: ${response.statusText}`]
            }));
            const errorMessage = errorData.errors
                ? errorData.errors.join(', ')
                : `Request failed with status ${response.status}`;

            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error(`API request failed: ${error}`);
    }
}
