import axios from 'axios';
import Cookies from 'js-cookie';

export class ApiClient {
    constructor(baseURL = 'http://localhost:8000/api') {
        console.log('ApiClient initialized with baseURL:', baseURL);
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true // Enable sending cookies with requests
        });

        // Добавляем логирование при инициализации
        const token = this.getToken();
        console.log('Initial token:', token);
        if (token) {
            this.setAxiosAuthHeader(token);
        }

        // Улучшенный request interceptor
        this.client.interceptors.request.use((config) => {
            const token = this.getToken();
            console.log('Request interceptor - Token:', token);
            console.log('Request headers:', config.headers);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        // Улучшенный response interceptor
        this.client.interceptors.response.use(
            (response) => {
                console.log('Response interceptor - Status:', response.status);
                return response;
            },
            (error) => {
                console.error('Response error:', error.response?.status, error.message);
                if (error.response?.status === 401) {
                    console.log('Unauthorized, clearing token');
                    this.clearToken();
                    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/')) {
                        window.location.href = '/';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Добавляем метод для редиректа
    handleRedirect(path) {
        console.log('Handling redirect to:', path);
        if (typeof window !== 'undefined') {
            // Don't use window.location for client-side navigation
            if (window.router) {
                console.log('Using Next.js router for navigation');
                window.router.replace(path);
            } else {
                console.log('Fallback to window.location');
                window.location.replace(path);
            }
        }
    }

    setAxiosAuthHeader(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    removeAxiosAuthHeader() {
        delete this.client.defaults.headers.common['Authorization'];
    }

    // Централизованное управление токеном
    getToken() {
        return Cookies.get('token');
    }

    setToken(token) {
        console.log('Setting token:', token ? 'token present' : 'no token');
        if (!token) return this.clearToken();
        
        Cookies.set('token', token, { 
            expires: 7,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        this.setAxiosAuthHeader(token);
        console.log('Token set in cookie and headers');
    }

    clearToken() {
        console.log('Clearing token');
        Cookies.remove('token', { path: '/' });
        this.removeAxiosAuthHeader();
        console.log('Token cleared from cookie and headers');
    }

    _handleAuthResponse(response) {
        if (response.data.token) {
            this.setToken(response.data.token);
        }
    }

    logout() {
        this.clearToken();
        this.handleRedirect('/');
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
        
        // Remove delay and use direct navigation
        this.handleRedirect('/profile');
        return response.data;
    }

    /**
     * Login user
     * @param {string} nickname - User nickname
     * @param {string} password - User password
     * @returns {Promise<{id: string, nickname: string, photo_url: string|null, token: string}>}
     */
    async login(nickname, password) {
        console.log('Login attempt for:', nickname);
        const response = await this.client.post('/auth/login', {
            nickname,
            password,
        });
        console.log('Login response:', response.status, response.data.token ? 'token received' : 'no token');
        this._handleAuthResponse(response);
        console.log('Login successful, redirecting...');
        
        // Remove delay and use direct navigation
        this.handleRedirect('/profile');
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
            this.setToken(response.data.token);
        }
    }

    logout() {
        this.clearToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }
}

// Create and export default instance
export default new ApiClient();
