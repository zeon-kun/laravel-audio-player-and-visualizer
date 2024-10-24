import axios from 'axios';
import { appUrl } from '@/config.env';
import { Download } from 'lucide-react';

export default function AudioDownloadCell({ id, title }) {
    const handleDownload = async () => {
        try {
            const response = await axios.get(`${appUrl}/post/download/${id}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audio_${id}_${title}.wav`); // Customize the filename as needed
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading the audio file: ", error);
        }
    };

    return (
        <button onClick={handleDownload} className="bg-blue-500 text-white p-2.5 rounded">
            <Download />
        </button>
    );
}
