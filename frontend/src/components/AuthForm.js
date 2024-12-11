'use client';
import { useState } from 'react';
import { api } from '@/api';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const validateForm = (nickname, password) => {
        if (!nickname || nickname.length < 3) {
            throw new Error('Nickname must be at least 3 characters long');
        }
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSuccess(false);

        const formData = new FormData(e.target);
        const nickname = formData.get('nickname');
        const password = formData.get('password');

        try {
            // Validate form before API call
            validateForm(nickname, password);

            if (isLogin) {
                await api.login(nickname, password);
            } else {
                await api.register(nickname, password);
            }
            
            setSuccess(true);
            router.refresh(); // Refresh the page data
            
            // Redirect after a short delay
            setTimeout(() => {
                router.push('/profile');
                router.refresh();
            }, 1500);
        } catch (err) {
            if (err.response?.status === 400) {
                setError(err.response.data.detail || 'Invalid credentials');
            } else if (err.response?.status === 409) {
                setError('Nickname already exists');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? 'Login' : 'Register'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="nickname">
                            Nickname
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mt-2">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-500 text-sm mt-2 text-center">
                            Success! Redirecting to your personal space...
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full mt-4 text-sm text-blue-500 hover:underline"
                >
                    {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
            </div>
        </div>
    );
}
