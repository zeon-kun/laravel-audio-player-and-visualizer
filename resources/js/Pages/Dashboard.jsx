import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { appUrl } from '@/config.env';

export default function Dashboard({ auth }) {
    const [data, setData] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchData(pageIndex, pageSize);
    }, [pageIndex, pageSize]);

    const fetchData = async (pageIndex, pageSize) => {
        try {
            const res = await axios.get(`${appUrl}/post`, {
                params: { page: pageIndex + 1, per_page: pageSize },
            });
            setData(res.data.data);
            setPageCount(res.data.last_page);
        } catch (error) {
            console.log("Error fetching posts: ", error);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
        },
        {
            header: 'Description',
            accessorKey: 'description',
        },
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
    });

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
                            <table className="table-auto w-full text-left">
                                <thead className="bg-gray-200">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-4 py-2 border-b">
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
                                                <td key={cell.id} className="px-4 py-2 border-b">
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
