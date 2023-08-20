import React, { useState, useEffect } from 'react'
import Layout from '../../layout'
import {
    Box,
    Button,
    Text,
    HStack,
    Stack,
    VisuallyHidden,
    FormControl,
    FormLabel,
    Input,
    Select
} from '@chakra-ui/react'
import BackendAxios from '@/lib/utils/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { useFormik } from 'formik';
import Cookies from 'js-cookie';

const ExportPDF = () => {
    const doc = new jsPDF('landscape')
    doc.autoTable({ html: '#printable-table' })
    doc.output('dataurlnewwindow');
}

const Ledger = () => {
    const today = new Date()
    const [rowData, setRowData] = useState([])
    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: "User ID",
            field: "transaction_by",
            cellRenderer: 'userCellRenderer'
        },
        {
            headerName: "Transaction ID",
            field: "transaction_id",
        },
        {
            headerName: 'Credit Amount',
            field: 'credit_amount'
        },
        {
            headerName: 'Debit Amount',
            field: 'debit_amount'
        },
        {
            headerName: 'Transaction For',
            field: 'service_type'
        },
        {
            headerName: 'Opening Balance',
            field: 'opening_balance'
        },
        {
            headerName: 'Closing Balance',
            field: 'closing_balance'
        },
        {
            headerName: 'Description',
            field: 'metadata'
        },
        {
            headerName: 'Timestamp',
            field: 'created_at'
        },
    ])
    const [printableRow, setPrintableRow] = useState(rowData)
    const [pagination, setPagination] = useState({
        current_page: "1",
        total_pages: "1",
        first_page_url: "",
        last_page_url: "",
        next_page_url: "",
        prev_page_url: "",
    })
    const Formik = useFormik({
        initialValues: {
            from: "",
            to: ""
        }
    })

    function fetchLedger(pageLink) {
        BackendAxios.post(pageLink || `/api/admin/transactions-period?page=1`, {
            from: Formik.values.from,
            to: Formik.values.to+'T'+'23:59'
        }).then((res) => {
            setPagination({
                current_page: res.data.current_page,
                total_pages: parseInt(res.data.last_page),
                first_page_url: res.data.first_page_url,
                last_page_url: res.data.last_page_url,
                next_page_url: res.data.next_page_url,
                prev_page_url: res.data.prev_page_url,
            })
            setRowData(res.data.slice(0, 20))
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            console.log(err)
        })
    }

    useEffect(() => {
        const timer = setInterval(() => {
            fetchLedger()
        }, 3000);
        return () => {
            clearTimeout(timer)
        }
    }, [])

    const userCellRenderer = (params) => {
        return (
            <Text>
                ({params.data.trigered_by}) {params.data.trigered_by_name} - {params.data.trigered_by_phone}
            </Text>
        )
    }


    return (
        <>
            <Layout pageTitle={'Transactions Ledger'}>
                <HStack my={4} justifyContent={'space-between'}>
                    <Text fontSize={'lg'} fontWeight={'semibold'}>Live Transactions</Text>
                </HStack>

                <HStack spacing={2} py={4} bg={'white'} justifyContent={'center'}>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger(pagination.first_page_url)}
                    ><BsChevronDoubleLeft />
                    </Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger(pagination.prev_page_url)}
                    ><BsChevronLeft />
                    </Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'solid'}
                    >{pagination.current_page}</Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger(pagination.next_page_url)}
                    ><BsChevronRight />
                    </Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger(pagination.last_page_url)}
                    ><BsChevronDoubleRight />
                    </Button>
                </HStack>
                <Box
                    rounded={16} overflow={'hidden'}
                    className='ag-theme-alpine ag-theme-pesa24-blue'
                    h={'2xl'}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={{
                            filter: true,
                            floatingFilter: true,
                            resizable: true,
                        }}
                        components={{
                            'userCellRenderer': userCellRenderer
                        }}

                        onFilterChanged={
                            (params) => {
                                setPrintableRow(params.api.getRenderedNodes().map((item) => {
                                    return (
                                        item.data
                                    )
                                }))
                            }
                        }
                    >

                    </AgGridReact>
                </Box>
                <HStack spacing={2} py={4} bg={'white'} justifyContent={'center'}>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger(pagination.first_page_url)}
                    ><BsChevronDoubleLeft />
                    </Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger(pagination.prev_page_url)}
                    ><BsChevronLeft />
                    </Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'solid'}
                    >{pagination.current_page}</Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger(pagination.next_page_url)}
                    ><BsChevronRight />
                    </Button>
                    <Button
                        colorScheme={'twitter'}
                        fontSize={12} size={'xs'}
                        variant={'outline'}
                        onClick={() => fetchLedger()}
                    ><BsChevronDoubleRight />
                    </Button>
                </HStack>

            </Layout>
        </>
    )
}

export default Ledger