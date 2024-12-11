'use client';
import { useState } from 'react';
import Image from 'next/image';
import { api } from '@/api';

export default function ProfilePhoto({ photoUrl, onPhotoUpdate }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePhotoClick = () => {
        document.getElementById('photoInput').click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const result = await api.updatePhoto(file);
            onPhotoUpdate(result.photo_url);
        } catch (err) {
            setError('Failed to update photo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-32 h-32 mx-auto mb-4">
            <div 
                onClick={handlePhotoClick}
                className="cursor-pointer relative w-full h-full rounded-full overflow-hidden bg-gray-200 hover:opacity-90 transition-opacity"
            >
                {photoUrl ? (
                    <Image
                        src={photoUrl}
                        alt="Profile photo"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
            
            <input
                id="photoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
            />
            
            {loading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </div>
    );
}
