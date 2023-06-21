import React, { useState, useEffect, useRef } from 'react'
import Layout from '../../layout'
import {
    Box,
    Button,
    Text,
    HStack,
    VisuallyHidden,
} from '@chakra-ui/react'
import BackendAxios from '@/lib/utils/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { SiMicrosoftexcel } from 'react-icons/si';
import { Stack } from '@chakra-ui/react';
import { useFormik } from 'formik';
import { FormControl } from '@chakra-ui/react';
import { FormLabel } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';

const ExportPDF = () => {
    const doc = new jsPDF('landscape')

    doc.autoTable({ html: '#printable-table' })
    doc.output('dataurlnewwindow');
}

const Ledger = () => {
    const [rowData, setRowData] = useState([])
    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: "Transaction ID",
            field: "transaction_id"
        },
        {
            headerName: "Done By",
            field: "trigered_by",
            cellRenderer: 'userCellRenderer',
            width: 150
        },
        {
            headerName: "Phone",
            field: "transaction_by_phone",
            width: 150
        },
        {
            headerName: "Description",
            field: "description"
        },
        {
            headerName: "Type",
            field: "service_type",
            width: 120
        },
        {
            headerName: "Credit",
            field: "credit_amount",
            cellRenderer: 'creditCellRenderer',
            width: 120
        },
        {
            headerName: "Debit",
            field: "debit_amount",
            cellRenderer: 'debitCellRenderer',
            width: 120
        },
        {
            headerName: "Opening Balance",
            field: "opening_balance",
            width: 120
        },
        {
            headerName: "Closing Balance",
            field: "closing_balance",
            width: 120
        },
        {
            headerName: "Created At",
            field: "created_at",
            width: 150
        },
        {
            headerName: "Updated At",
            field: "updated_at",
            width: 150
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
        BackendAxios.get(pageLink || `/api/admin/transactions?from=${Formik.values.from}&to=${Formik.values.to}page=1`).then((res) => {
            setPagination({
                current_page: res.data.current_page,
                total_pages: parseInt(res.data.last_page),
                first_page_url: res.data.first_page_url,
                last_page_url: res.data.last_page_url,
                next_page_url: res.data.next_page_url,
                prev_page_url: res.data.prev_page_url,
            })
            setRowData(res.data.data)
            setPrintableRow(res.data.data)
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        fetchLedger()
    }, [])

    const creditCellRenderer = (params) => {
        return (
            <Text px={1} fontWeight={'semibold'} flex={'unset'} w={'fit-content'} color={params.value > 0 && "green.400"}>
                {params.value}
            </Text>
        )
    }

    const debitCellRenderer = (params) => {
        return (
            <Text px={1} fontWeight={'semibold'} flex={'unset'} w={'fit-content'} color={params.value > 0 && "red.400"}>
                {params.value}
            </Text>
        )
    }

    const userCellRenderer = (params) => {
        return (
            <Text>
                ({params.data.trigered_by}) {params.data.transaction_by}
            </Text>
        )
    }

    const tableRef = useRef(null)
    return (
        <>
            <Layout pageTitle={'Transactions Ledger'}>
                <Text fontSize={'lg'} fontWeight={'semibold'}>Transactions Ledger</Text>
                <HStack my={4}>
                    <DownloadTableExcel
                        filename="TransactionsLedger"
                        sheet="transactions"
                        currentTableRef={tableRef.current}
                    >
                        <Button
                            size={['xs', 'sm']}
                            colorScheme={'whatsapp'}
                            leftIcon={<SiMicrosoftexcel />}
                        >
                            Export Excel
                        </Button>
                    </DownloadTableExcel>
                    <Button onClick={ExportPDF} colorScheme={'red'} size={'sm'}>Export PDF</Button>
                </HStack>

                <Box p={2} bg={'twitter.500'}>
                    <Text color={'#FFF'}>Search Transactions</Text>
                </Box>
                <Stack
                    p={4} spacing={8} w={'full'}
                    direction={['column', 'row']}
                >
                    <FormControl w={['full', 'xs']}>
                        <FormLabel>From Date</FormLabel>
                        <Input
                            name='from' onChange={Formik.handleChange}
                            type='date' bg={'white'}
                        />
                    </FormControl>
                    <FormControl w={['full', 'xs']}>
                        <FormLabel>To Date</FormLabel>
                        <Input
                            name='to' onChange={Formik.handleChange}
                            type='date' bg={'white'}
                        />
                    </FormControl>
                </Stack>
                <HStack mb={4} justifyContent={'flex-end'}>
                    <Button
                        onClick={() => fetchLedger()}
                        colorScheme={'twitter'}
                    >Search</Button>
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
                    h={'xl'}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={{
                            filter: true,
                            floatingFilter: true,
                            resizable: true,
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
                        components={{
                            'creditCellRenderer': creditCellRenderer,
                            'debitCellRenderer': debitCellRenderer,
                            'userCellRenderer': userCellRenderer,
                        }}
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
                        onClick={() => fetchLedger(pagination.last_page_url)}
                    ><BsChevronDoubleRight />
                    </Button>
                </HStack>

                <VisuallyHidden>
                    <table id='printable-table' ref={tableRef}>
                        <thead>
                            <tr>
                                <th>#</th>
                                {
                                    columnDefs.filter((column) => {
                                        if (column.headerName != "Description") {
                                            return (
                                                column
                                            )
                                        }
                                    }).map((column, key) => {
                                        return (
                                            <th key={key}>{column.headerName}</th>
                                        )
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                printableRow.map((data, key) => {
                                    return (
                                        <tr key={key}>
                                            <td>{key + 1}</td>
                                            <td>{data.transaction_id}</td>
                                            <td>{data.trigered_by}</td>
                                            <td>{data.name}</td>
                                            <td>{data.service_type}</td>
                                            <td>{data.credit_amount}</td>
                                            <td>{data.debit_amount}</td>
                                            <td>{data.opening_balance}</td>
                                            <td>{data.closing_balance}</td>
                                            <td>{data.created_at}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </VisuallyHidden>

            </Layout>
        </>
    )
}

export default Ledger