import { useRef, useState } from 'react';
import axios from 'axios';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';

const AudioPostDeleteForm = ({ postId, onClose, onSubmitSuccess }) => {
    const [error, setError] = useState(null);
    const confirmRef = useRef();

    const handleDelete = async () => {
        if (confirmRef.current.value !== 'DELETE') {
            setError('Please type DELETE to confirm.');
            return;
        }

        try {
            // The correct way to send a DELETE request with Laravel
            const response = await axios.post(`/post/${postId}`, {
                _method: 'DELETE',
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    withCredentials: true
                });

            if (response.status === 200) {
                onSubmitSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error deleting post: ', error);
            setError(error.response?.data?.message || 'Failed to delete post. Please try again.');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Delete Audio Post</h2>
            <p className="mb-4">Are you sure you want to delete this audio post? This action cannot be undone.</p>
            <InputLabel htmlFor="confirmation" value="Type DELETE to confirm" />
            <input
                type="text"
                id="confirmation"
                ref={confirmRef}
                className="border rounded w-full py-2 px-3 text-gray-700 mb-2 mt-2"
                placeholder="DELETE"
            />
            <InputError message={error} className="mb-4" />
            <div className="flex items-center justify-between">
                <SecondaryButton onClick={onClose} className="mr-2">Cancel</SecondaryButton>
                <DangerButton onClick={handleDelete}>Delete</DangerButton>
            </div>
        </div>
    );
};

export default AudioPostDeleteForm;