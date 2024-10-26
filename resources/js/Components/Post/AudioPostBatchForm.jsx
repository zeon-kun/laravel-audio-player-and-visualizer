import { useState } from 'react';
import axios from 'axios';
import { appUrl } from '@/config.env';

export default function AudioPostBatchForm({ onClose, onSubmitSuccess }) {
    const [description, setDescription] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('audio_zip', audioFile);
        formData.append('description', description);

        try {
            const res = await axios.post(`post/batch/store`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            });

            if (res.status === 200) {
                onSubmitSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Error uploading audio zip", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Audio File</label>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files[0])}
                    className="border rounded w-full py-2 px-3 text-gray-700"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border rounded w-full py-2 px-3 text-gray-700"
                    required
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={loading}
                >
                    {loading ? 'Uploading...' : 'Submit'}
                </button>
                <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
