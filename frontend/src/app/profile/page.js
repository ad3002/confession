'use client';
import { useState, useEffect } from 'react';
import { api } from '@/api';
import { useRouter } from 'next/navigation';
import ProfilePhoto from '@/components/ProfilePhoto';
import CountdownTimer from '@/components/CountdownTimer';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await api.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile:', error);
            if (error.response?.status === 401) {
                router.push('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpdate = (newPhotoUrl) => {
        setProfile(prev => ({ ...prev, photo_url: newPhotoUrl }));
    };

    const handleLogout = () => {
        api.logout();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                {/* Logout button */}
                <div className="text-right mb-6">
                    <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                    >
                        Выйти
                    </button>
                </div>

                {/* Profile Photo */}
                <ProfilePhoto 
                    photoUrl={profile?.photo_url} 
                    onPhotoUpdate={handlePhotoUpdate}
                />

                {/* Nickname */}
                <h1 className="text-2xl font-bold text-center mb-4 dark:text-white">
                    {profile?.nickname}
                </h1>

                {/* Member since */}
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-8">
                    На сайте с {new Date(profile?.created_at).toLocaleDateString()}
                </p>

                {/* Phase 1 - Countdown */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <CountdownTimer />
                </div>
            </div>
        </div>
    );
}
