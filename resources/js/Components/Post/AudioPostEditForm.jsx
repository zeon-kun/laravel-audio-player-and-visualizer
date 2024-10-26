import { useState } from 'react';
import axios from 'axios';
import { appUrl } from '@/config.env';

export default function AudioPostEditForm({ post, onClose, onSubmitSuccess }) {
    const [title, setTitle] = useState(post.title);
    const [description, setDescription] = useState(post.description);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`api/post/${post.id}`, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            });
            if (response.status === 200) {
                onSubmitSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdate} className="p-4">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    {loading ? 'Updating...' : 'Save'}
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
