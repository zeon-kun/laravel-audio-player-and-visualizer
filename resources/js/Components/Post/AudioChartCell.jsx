import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { appUrl } from '@/config.env';
import { AudioVisualizer } from 'react-audio-visualize';

export default function AudioChartCell({ audioPath }) {
    const [audioBlob, setAudioBlob] = useState();
    const visualizerRef = useRef(null);
    const [barColor, setBarColor] = useState('');


    const fetchAudioBlob = async (audioPath) => {
        const formData = new FormData();
        formData.append('audio_path', audioPath);

        try {
            const res = await axios.post(`${appUrl}/audio`, formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const audioBlob = new Blob([res.data], { type: res.headers['content-type'] });
            const audioURL = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioURL);

            audio.oncanplaythrough = () => {
                setAudioBlob(audioBlob);
            };

            audio.onerror = () => {
                console.error("Error loading audio. The audio may be corrupted or in an unsupported format.");
            };

            audio.load();
        } catch (error) {
            console.log("Error fetching audio: ", error);
        }
    };

    const getRandomColor = () => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        return `#${randomColor}`;
    };

    useEffect(() => {
        const color = getRandomColor();
        setBarColor(color);
    }, []);

    return (
        <div className="flex items-center justify-center">
            {fetchAudioBlob(audioPath) && audioBlob && (
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
        </div>
    )
}