'use client';
import { useState, useEffect } from 'react';

export default function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        // Set target date to midnight of the next day
        const targetDate = new Date();
        targetDate.setHours(24, 0, 0, 0);

        const updateCountdown = () => {
            const now = new Date();
            const difference = targetDate - now;

            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / (1000 * 60)) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        const timer = setInterval(updateCountdown, 1000);
        updateCountdown();

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm mb-2">До открытия галереи...</p>
            <p className="font-mono text-xl">{timeLeft}</p>
        </div>
    );
}
