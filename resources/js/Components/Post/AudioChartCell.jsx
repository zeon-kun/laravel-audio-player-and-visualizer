import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AudioVisualizer } from 'react-audio-visualize';

export default function AudioChartCell({ audioPath }) {
    const [audioBlob, setAudioBlob] = useState(null);
    const visualizerRef = useRef(null);
    const [barColor, setBarColor] = useState('');

    const fetchAudioBlob = async (audioPath) => {
        const formData = new FormData();
        formData.append('audio_path', audioPath);

        try {
            const res = await axios.post('audio', formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            });

            const audioBlob = new Blob([res.data], { type: res.headers['content-type'] });
            setAudioBlob(audioBlob);
        } catch (error) {
            console.error("Error fetching audio: ", error);
            if (error.response?.status === 419) {
                console.error("CSRF token mismatch. Please check your Inertia setup.");
            }
        }
    };

    const getRandomColor = () => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor}`;
    };

    useEffect(() => {
        if (audioPath) {
            fetchAudioBlob(audioPath);
        }
    }, [audioPath]);

    useEffect(() => {
        setBarColor(getRandomColor());
    }, []);

    return (
        <div className="flex items-center justify-center">
            {audioBlob && (
                <AudioVisualizer
                    ref={visualizerRef}
                    blob={audioBlob}
                    width={300}
                    height={75}
                    barWidth={1}
                    gap={0}
                    barColor={barColor}
                />
            )}
            {!audioBlob && <p>Loading audio...</p>}
        </div>
    );
}