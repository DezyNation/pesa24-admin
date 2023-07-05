import React, { useState, useEffect, useMemo } from 'react'
import {
    Box,
    Stack,
    Text,
    Button,
    useToast,
} from '@chakra-ui/react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Layout from '../layout';
import BackendAxios from '@/lib/utils/axios';
import Cookies from 'js-cookie';

const SupportTickets = () => {
    const Toast = useToast({ position: 'top-right' })
    const [rowData, setRowData] = useState([])
    const [columnDefs, setColumnDefs] = useState([
        {
            field: "id",
            headerName: "Ticket ID"
        },
        {
            field: "name",
            headerName: "User",
            cellRenderer: 'userCellRenderer'
        },
        {
            field: "body",
            headerName: "Message",
        },
        {
            field: "document",
            headerName: "Attachments",
        },
        {
            field: "transaction_id",
            headerName: "Linked Transaction ID",
        },
        {
            field: "admin_remarks",
            headerName: "Admin Remarks",
            editable: true
        },
        {
            field: "status",
            headerName: "Status",
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['raised', 'read', 'responded', 'resolved', 'refund processed'],
            },
            singleClickEdit: true,
        },
        {
            field: "created_at",
            headerName: "Created At",
        },
        {
            field: "updated_at",
            headerName: "Updated At",
        },
    ])

    const defaultColDef = useMemo(() => {
        return {
            resizable: true,
            filter: true,
            floatingFilter: true,
        };
    }, []);

    useEffect(() => {
        BackendAxios.get(`/api/admin/tickets`).then(res => {
            setRowData(res.data)
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }, [])

    const userCellRenderer = (params) => {
        return (
            <Box>
                <Text>({params.data.user_id}) {params.value} - {params.data.phone_number}</Text>
            </Box>
        )
    }

    function onCellValueChange(params) {
        BackendAxios.post(`/api/admin/tickets`, {
            id: params.data.id,
            status: params.data.status,
            admin_remarks: params.data.admin_remarks
        }).then((res) => {
            if (res.data === 1) {
                Toast({
                    status: 'success',
                    description: `Ticket Updated`
                })
            }
            else {
                Toast({
                    description: `Ticket Not Updated`
                })
            }
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    return (
        <>
            <Layout pageTitle={'Support Tickets'}>
                <Box w={'full'} h={12}></Box>
                <Box
                    h={'sm'} w={'full'}
                    rounded={16} overflow={'hidden'}
                    className='ag-theme-alpine ag-theme-pesa24-blue'
                >
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        components={{
                            'userCellRenderer': userCellRenderer
                        }}

                        onCellValueChanged={onCellValueChange}
                    >

                    </AgGridReact>
                </Box>
            </Layout>
        </>
    )
}

export default SupportTickets