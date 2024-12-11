import axios from 'axios';
import Cookies from 'js-cookie';

export class ApiClient {
    constructor(baseURL = 'http://localhost:8000/api') {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Update token handling in interceptor
        this.client.interceptors.request.use((config) => {
            const token = Cookies.get('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Register a new user
     * @param {string} nickname - User nickname (must be unique)
     * @param {string} password - Password (min 8 chars, must contain uppercase, lowercase and numbers)
     * @returns {Promise<{id: string, nickname: string, photo_url: string|null, token: string}>}
     */
    async register(nickname, password) {
        const response = await this.client.post('/auth/register', {
            nickname,
            password,
        });
        this._handleAuthResponse(response);
        return response.data;
    }

    /**
     * Login user
     * @param {string} nickname - User nickname
     * @param {string} password - User password
     * @returns {Promise<{id: string, nickname: string, photo_url: string|null, token: string}>}
     */
    async login(nickname, password) {
        const response = await this.client.post('/auth/login', {
            nickname,
            password,
        });
        this._handleAuthResponse(response);
        return response.data;
    }

    /**
     * Update user's profile photo
     * @param {File} file - Image file (jpg, png, etc.)
     * @returns {Promise<{photo_url: string}>}
     */
    async updatePhoto(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await this.client.put('/users/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    /**
     * Get paginated list of users for gallery
     * @param {string} [search] - Optional search query for nicknames
     * @param {number} [page=1] - Page number
     * @param {number} [limit=20] - Items per page
     * @returns {Promise<{
     *   users: Array<{id: string, nickname: string, photo_url: string|null}>,
     *   total: number,
     *   page: number,
     *   pages: number
     * }>}
     */
    async getUserGallery(search, page = 1, limit = 20) {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        const response = await this.client.get(`/users/gallery?${params}`);
        return response.data;
    }

    /**
     * Get current user's profile
     * @returns {Promise<{
     *   id: string,
     *   nickname: string,
     *   photo_url: string|null,
     *   created_at: string
     * }>}
     */
    async getProfile() {
        const response = await this.client.get('/users/profile');
        return response.data;
    }

    /**
     * Get user by ID
     * @param {string} userId - User's ID
     * @returns {Promise<{
     *   id: string,
     *   nickname: string,
     *   photo_url: string|null
     * }>}
     */
    async getUser(userId) {
        const response = await this.client.get(`/users/${userId}`);
        return response.data;
    }

    /**
     * Create a new note
     * @param {string} content - Note content
     * @param {string} receiverId - Receiver's user ID
     * @param {boolean} [isAnonymous=false] - Whether to send anonymously
     * @returns {Promise<{
     *   id: string,
     *   content: string,
     *   sender_id: string,
     *   receiver_id: string,
     *   is_anonymous: boolean,
     *   anonym_id?: string,
     *   created_at: string
     * }>}
     */
    async createNote(content, receiverId, isAnonymous = false) {
        const response = await this.client.post('/notes', {
            content,
            receiver_id: receiverId,
            is_anonymous: isAnonymous,
        });
        return response.data;
    }

    /**
     * Get paginated list of sent notes
     * @param {number} [page=1] - Page number
     * @param {number} [limit=20] - Items per page
     * @returns {Promise<{
     *   notes: Array<{
     *     id: string,
     *     content: string,
     *     receiver_id: string,
     *     receiver_nickname: string,
     *     is_anonymous: boolean,
     *     created_at: string
     *   }>,
     *   total: number,
     *   page: number,
     *   pages: number
     * }>}
     */
    async getSentNotes(page = 1, limit = 20) {
        const params = new URLSearchParams({ page, limit });
        const response = await this.client.get(`/notes/sent?${params}`);
        return response.data;
    }

    /**
     * Get paginated list of received notes
     * @param {number} [page=1] - Page number
     * @param {number} [limit=20] - Items per page
     * @returns {Promise<{
     *   notes: Array<{
     *     id: string,
     *     content: string,
     *     sender_id?: string,
     *     sender_nickname?: string,
     *     anonym_id?: string,
     *     is_anonymous: boolean,
     *     created_at: string,
     *     is_read: boolean
     *   }>,
     *   total: number,
     *   page: number,
     *   pages: number
     * }>}
     */
    async getReceivedNotes(page = 1, limit = 20) {
        const params = new URLSearchParams({ page, limit });
        const response = await this.client.get(`/notes/received?${params}`);
        return response.data;
    }

    /**
     * Get count of unread notes
     * @returns {Promise<{count: number}>}
     */
    async getUnreadCount() {
        const response = await this.client.get('/notes/unread/count');
        return response.data;
    }

    /**
     * Mark a note as read
     * @param {string} noteId - Note's ID
     * @returns {Promise<{success: boolean}>}
     */
    async markNoteAsRead(noteId) {
        const response = await this.client.put(`/notes/${noteId}/read`);
        return response.data;
    }

    // Update helper methods
    _handleAuthResponse(response) {
        if (response.data.token) {
            // Store token in HTTP-only cookie
            Cookies.set('token', response.data.token, { 
                expires: 7, // 7 days
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        }
    }

    logout() {
        Cookies.remove('token');
    }
}

// Create and export default instance
export default new ApiClient();
