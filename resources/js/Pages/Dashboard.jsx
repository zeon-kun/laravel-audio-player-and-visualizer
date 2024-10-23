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

export default function Dashboard({ auth }) {
    const [data, setData] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData(pageIndex, pageSize);
    }, [pageIndex, pageSize]);

    const fetchData = async (pageIndex, pageSize) => {
        try {
            const res = await axios.get(`${appUrl}/post`, {
                params: { page: pageIndex + 1, per_page: pageSize },
            });
            setData(res.data.data.data);
            setPageCount(res.data.data.last_page, 10);
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
        },
        {
            header: 'Description',
            accessorKey: 'description',
        },
        {
            header: 'Audio',
            accessorKey: 'audio_path',
            cell: ({ row }) => <AudioCell audioPath={row.original.audio_path} />,
        },
        {
            header: 'Chart',
            accessorKey: 'audio_chart',
            cell: ({ row }) => <AudioChartCell audioPath={row.original.audio_path} />
        },
        {
            header: 'Action',
            accessorKey: 'action',
            cell: ({ row }) => <AudioDownloadCell id={row.original.id} title={row.original.title} />
        }
    ], []);

    const table = useReactTable({
        columns,
        data: data,
        pageCount: pageCount,
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
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function' ? updater(table.getState().pagination) : updater;
            console.log("Pagination changed: ", newState);
            setPageIndex(newState.pageIndex);
            setPageSize(newState.pageSize);
        },
    });

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
                            <div className='flex gap-10 mb-4'>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Add New Audio Post
                                </button>

                                {/* Modal that opens AudioPostForm */}
                                <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                                    <AudioPostForm
                                        onClose={() => setIsModalOpen(false)}
                                        onSubmitSuccess={handleFormSubmitSuccess}
                                    />
                                </Modal>

                                {/* Do the same for Edit and Delete, both of this action also use  */}
                            </div>
                            <table className="table-auto w-full text-left">
                                <thead className="bg-gray-200">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-4 py-2 border-b text-center"> {/* Added text-center class here */}
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
        </AuthenticatedLayout>
    );
}
