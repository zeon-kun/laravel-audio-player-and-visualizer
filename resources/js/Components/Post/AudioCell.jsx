import { Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import axios from '@/bootstrap';

export default function CustomAudioPlayer({ audioPath }) {
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');

    const fetchAudioUrl = async () => {
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
            const audioURL = URL.createObjectURL(audioBlob);
            setAudioUrl(audioURL);
        } catch (error) {
            console.log('Error fetching audio: ', error);
        }
    };


    return (
        <div className="flex items-center justify-center w-full">
            <button
                onClick={fetchAudioUrl}
                className={`text-white p-3 rounded-md ${isPlaying ? 'bg-red-500' : 'bg-blue-500'} transition-colors duration-300`}
            >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <AudioPlayer
                ref={playerRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
            />
        </div>
    );
}
