import { useState } from 'react';
import axios from 'axios';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import { appUrl } from '@/config.env';

const AudioBatchDownload = ({ onClose, isAdmin }) => {
    const [error, setError] = useState(null);

    const handleBatchDownload = async () => {
        const targetedRoute = isAdmin === true ? "downloadAdmin" : "downloadMe";
        // console.log("isAdmin value is " + isAdmin + "target" + targetedRoute);
        try {
            const response = await axios.get(`/post/batch/${targetedRoute}`, {
                responseType: 'blob',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'audio_files.zip'); // Set the file name
            document.body.appendChild(link);
            link.click();
            link.remove();
            onClose(); // Close the modal after downloading
        } catch (error) {
            console.error("Error downloading batch audio files: ", error);
            setError('Failed to download audio files. Please try again.');
        }
    };

    return (
        <div className='p-4'>
            <h2 className="text-lg font-bold mb-4">Batch Download Audio Files</h2>
            <p>Are you sure you want to download all audio files? This may take some time depending on the size.</p>
            <InputError message={error} className="mt-2" />
            <div className="mt-4 flex justify-end">
                <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                <DangerButton onClick={handleBatchDownload} className="ml-2">Download</DangerButton>
            </div>
        </div>
    );
};

export default AudioBatchDownload;
