import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { appUrl } from '@/config.env';
import Modal from '@/Components/Modal';
import AudioPostForm from '@/Components/Post/AudioPostForm';
import AudioCell from '@/Components/Post/AudioCell';
import AudioChartCell from '@/Components/Post/AudioChartCell';
import AudioDownloadCell from '@/Components/Post/AudioDownloadCell';
import AudioPostBatchForm from '@/Components/Post/AudioPostBatchForm';
import { Edit, Trash } from 'lucide-react';
import AudioPostEditForm from '@/Components/Post/AudioPostEditForm';
import AudioPostDeleteForm from '@/Components/Post/AudioPostDeleteForm';
import AudioBatchDownload from '@/Components/Post/AudioBatchDownload';

export default function Dashboard({ auth }) {
    const [data, setData] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isPostBatchModalOpen, setIsPostBatchModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [isBatchDownloadModalOpen, setIsBatchDownloadModalOpen] = useState(false);

    useEffect(() => {
        fetchData(pageIndex, pageSize);
    }, [pageIndex, pageSize]);

    const fetchData = async (pageIndex, pageSize) => {
        try {
            const targetedRoute = auth.user.isAdmin == true ? "admin" : "me";
            // console.log("isAdmin value is " + auth.user.isAdmin + "target" + targetedRoute);
            const res = await axios.get(`${appUrl}/post/index/${targetedRoute}`, {
                params: { page: pageIndex + 1, per_page: pageSize },
            });
            console.log(res.data.data.data)
            setData(res.data.data.data);
            setPageCount(res.data.data.last_page);
        } catch (error) {
            console.log("Error fetching posts: ", error);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Id',
            accessorKey: 'id',
        },
        {
            header: 'Title',
            accessorKey: 'title',
            cell: ({ row }) => {
                const title = row.original.title;
                return title.length > 20 ? `${title.substring(0, 20)}...` : title;
            }
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: ({ row }) => {
                const description = row.original.description;
                return description.length > 20 ? `${description.substring(0, 20)}...` : description;
            }
        },
        {
            header: 'Audio',
            accessorKey: 'audio_path',
            cell: ({ row }) => <AudioCell audioPath={row.original.audio_path} />,
        },
        {
            header: 'Chart',
            accessorKey: 'audio_chart',
            cell: ({ row }) => <AudioChartCell audioPath={row.original.audio_path} />,
        },
        {
            header: 'Action',
            accessorKey: 'action',
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <AudioDownloadCell id={row.original.id} title={row.original.title} />
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                        onClick={() => handleEdit(row.original)}
                    >
                        <Edit />
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                        onClick={() => openDeleteModal(row.original.id)}
                    >
                        <Trash />
                    </button>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        columns,
        data,
        pageCount,
        manualPagination: true,
        state: {
            pagination: { pageIndex, pageSize },
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: ({ pageIndex, pageSize }) => {
            setPageIndex(pageIndex);
            setPageSize(pageSize);
        },
    });

    const handleEdit = (post) => {
        setSelectedPost(post);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setPostToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmitSuccess = () => {
        fetchData(pageIndex, pageSize);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className='flex flex-col p-6'>
                            {/* Quick Action */}
                            <div className='flex gap-4 mb-4'>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => setIsPostModalOpen(true)}
                                >
                                    Add New Audio Post
                                </button>

                                {/* Modal for AudioPostForm */}
                                <Modal show={isPostModalOpen} onClose={() => setIsPostModalOpen(false)}>
                                    <AudioPostForm
                                        onClose={() => setIsPostModalOpen(false)}
                                        onSubmitSuccess={handleFormSubmitSuccess}
                                    />
                                </Modal>

                                {/* Batch Upload Modal */}
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => setIsPostBatchModalOpen(true)}
                                >
                                    Add Batch Audio
                                </button>
                                <Modal show={isPostBatchModalOpen} onClose={() => setIsPostBatchModalOpen(false)}>
                                    <AudioPostBatchForm
                                        onClose={() => setIsPostBatchModalOpen(false)}
                                        onSubmitSuccess={handleFormSubmitSuccess}
                                    />
                                </Modal>
                                {/* Batch Download */}
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => setIsBatchDownloadModalOpen(true)}
                                >
                                    Batch Download Audio
                                </button>

                                {/* Batch Download Modal */}
                                <Modal show={isBatchDownloadModalOpen} onClose={() => setIsBatchDownloadModalOpen(false)}>
                                    <AudioBatchDownload onClose={() => setIsBatchDownloadModalOpen(false)} isAdmin={auth.user.isAdmin} />
                                </Modal>

                                {/* Edit Modal */}
                                <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                                    {selectedPost && (
                                        <AudioPostEditForm
                                            post={selectedPost}
                                            onClose={() => setIsEditModalOpen(false)}
                                            onSubmitSuccess={handleFormSubmitSuccess}
                                        />
                                    )}
                                </Modal>

                                {/* Delete Modal */}
                                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                                    {postToDelete && (
                                        <AudioPostDeleteForm
                                            postId={postToDelete}
                                            onClose={() => setIsDeleteModalOpen(false)}
                                            onSubmitSuccess={handleFormSubmitSuccess}
                                        />
                                    )}
                                </Modal>
                            </div>
                            <table className="table-auto w-full text-left">
                                <thead className="bg-gray-200">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-4 py-2 border-b text-center">
                                                    {header.isPlaceholder ? null : header.column.columnDef.header}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-100">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-4 py-2 border-b text-center">
                                                    {cell.column.columnDef.cell ? cell.column.columnDef.cell(cell.getContext()) : cell.getValue()}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="pagination mt-4 flex justify-between items-center">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className={`px-4 py-2 border rounded ${!table.getCanPreviousPage() ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {table.getState().pagination.pageIndex + 1} of {pageCount}
                                </span>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className={`px-4 py-2 border rounded ${!table.getCanNextPage() ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout >
    );
}
