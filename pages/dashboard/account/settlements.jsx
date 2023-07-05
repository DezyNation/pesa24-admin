import React, { useState, useEffect, useRef } from 'react'
import Layout from '../layout'
import {
    Stack,
    Text,
    VStack,
    HStack,
    Button,
    Box,
    VisuallyHidden,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    PinInput,
    PinInputField
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { SiMicrosoftexcel } from 'react-icons/si'
import { FaFileCsv, FaFilePdf, FaPrint } from 'react-icons/fa'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { BsCheck, BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronLeft, BsChevronRight, BsX } from 'react-icons/bs';
import BackendAxios from '@/lib/utils/axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { DownloadTableExcel } from 'react-export-table-to-excel';
import Cookies from 'js-cookie'

const ExportPDF = () => {
    const doc = new jsPDF('landscape')

    doc.autoTable({ html: '#printable-table' })
    doc.output('dataurlnewwindow');
}

const FundRequests = () => {
    const Toast = useToast({
        position: 'top-right'
    })
    const { isOpen, onClose, onOpen } = useDisclosure()
    const [currentCell, setCurrentCell] = useState({})
    const [mpin, setMpin] = useState("")
    const [rowData, setRowData] = useState([])
    const [columnDefs, setColumnDefs] = useState([
        {
            field: "status",
            headerName: "Status",
            editable: true,
            cellRenderer: 'statusCellRenderer'
        },
        { headerName: "Request Timestamp", field: 'created_at' },
        { headerName: "Trnxn ID", field: 'id' },
        { headerName: "Amount", field: 'amount' },
        { headerName: "Requested Bank", field: 'bank_name' },


        { headerName: "User Name", field: 'name', cellRenderer: 'userCellRenderer' },
        { headerName: "User Phone", field: 'phone_number' },
        { headerName: "User Remarks", field: 'message' },
        {
            headerName: "Admin Remarks",
            field: 'admin_remarks',
            editable: true,
            singleClickEdit: true,
            cellEditor: 'agTextCellEditor',
        },
        { headerName: "Update Timestamp", field: 'updated_at' },
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

    function fetchRequests(pageLink) {
        BackendAxios.get(pageLink || '/api/admin/settlement-requests').then(res => {
            // setPagination({
            //     current_page: res.data.current_page,
            //     total_pages: parseInt(res.data.last_page),
            //     first_page_url: res.data.first_page_url,
            //     last_page_url: res.data.last_page_url,
            //     next_page_url: res.data.next_page_url,
            //     prev_page_url: res.data.prev_page_url,
            // })
            setRowData(res.data)
            setPrintableRow(res.data)
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            console.log(err)
            Toast({
                status: 'error',
                title: 'Error Occured',
                description: err.response?.data?.message || err.response?.data || err.message
            })
        })
    }

    useEffect(() => {
        fetchRequests()
    }, [])


    const statusCellRenderer = (params) => {
        function updateRequest(updateTo) {
            if (updateTo == "reversed" && params.data.admin_remarks) {
                BackendAxios.post(`/api/admin/settlement-requests`, {
                    beneficiaryId: params.data.user_id,
                    id: params.data.id,
                    status: updateTo,
                    approved: false,
                    adminRemarks: params.data.admin_remarks
                }).then(res => {
                    Toast({
                        status: 'success',
                        description: 'Status Updated'
                    })
                    fetchRequests()
                }).catch(err => {
                    console.log(err)
                    Toast({
                        status: 'error',
                        description: err.response.data.message || err.response.data || err.message
                    })
                })
            }
            if (updateTo == "reversed" || updateTo == "deleted" && !params.data.admin_remarks) {
                Toast({
                    description: 'Please add remarks also'
                })
            }
        }

        return (
            <>
                <HStack h={'full'} pos={'relative'}>
                    {params.data.status == "pending" &&
                        <Button size={'xs'} leftIcon={<BsCheck />} colorScheme='whatsapp' onClick={() => {
                            setCurrentCell(params)
                            onOpen()
                        }}>Approve</Button>
                    }
                    {params.data.status != "pending" &&
                        <Button
                            size={'xs'}
                            colorScheme={params.data.status == "approved" ? 'whatsapp' : params.data.status == "deleted" ? 'red' : 'orange'}
                            textTransform={'capitalize'}
                        >{params.data.status}
                        </Button>
                    }
                    {
                        params.data.status == "pending" &&
                        <Button size={'xs'} leftIcon={<BsX />} colorScheme='orange' onClick={() => updateRequest("reversed")}>Reject</Button>
                    }
                </HStack>
            </>
        )
    }

    const userCellRenderer = (params) => {
        return (
            <>
                <Text>{params.data.name} {params.data.user_id}</Text>
            </>
        )
    }

    function approveRequest(params) {
        Toast({
            description: 'Payout initiated'
        })

        BackendAxios.post('api/paysprint/payout/new-payout', {
            amount: params.data.amount,
            userId: params.data.user_id,
            mpin: mpin
        }).then(() => {
            BackendAxios.post(`/api/admin/settlement-requests`, {
                id: params.data.id,
                beneficiaryId: params.data.user_id,
                status: "approved",
                adminRemarks: params.data.admin_remarks || "Request approved!",
                approved: true
            }).then(res => {
                Toast({
                    status: 'success',
                    description: 'Payout Successful!'
                })
                fetchRequests()
                onClose()
            }).catch(err => {
                Toast({
                    status: 'error',
                    description: err.response?.data?.message || err.response?.data || err.message
                })
            })
        }).catch(err => {
            Toast({
                status: 'error',
                description: err.response?.data?.message || err.response?.data || err.message
            })
        })
    }

    const tableRef = useRef(null)
    return (
        <>
            <Layout pageTitle={'Settlement Request'}>
                <Text fontWeight={'semibold'} fontSize={'lg'}>Fund Settlement Requests From Your Members</Text>

                <Box py={6} pos={'relative'}>
                    <Text fontWeight={'medium'} pb={4}>Manage Fund Settlements</Text>
                    <HStack spacing={4} my={4}>
                        <DownloadTableExcel
                            filename="UsersList"
                            sheet="users"
                            currentTableRef={tableRef.current}
                        >
                            <Button size={['xs', 'sm']} colorScheme={'whatsapp'} leftIcon={<SiMicrosoftexcel />}>Excel</Button>
                        </DownloadTableExcel>
                        <Button size={['xs', 'sm']} colorScheme={'red'} leftIcon={<FaFilePdf />} onClick={ExportPDF}>PDF</Button>
                        <Button size={['xs', 'sm']} colorScheme={'facebook'} leftIcon={<FaPrint />} onClick={ExportPDF}>Print</Button>
                    </HStack>

                    {/* <HStack spacing={2} py={4} bg={'white'} justifyContent={'center'}>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchRequests(pagination.first_page_url)}
                        ><BsChevronDoubleLeft />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchRequests(pagination.prev_page_url)}
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
                            onClick={() => fetchRequests(pagination.next_page_url)}
                        ><BsChevronRight />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchRequests(pagination.last_page_url)}
                        ><BsChevronDoubleRight />
                        </Button>
                    </HStack> */}
                    <Box
                        rounded={16} overflow={'hidden'}
                        className='ag-theme-alpine ag-theme-pesa24-blue'
                        w={'full'} h={['sm', 'xl']}>
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
                                'statusCellRenderer': statusCellRenderer,
                                'userCellRenderer': userCellRenderer
                            }}
                        >

                        </AgGridReact>
                    </Box>
                    {/* <HStack spacing={2} py={4} bg={'white'} justifyContent={'center'}>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchRequests(pagination.first_page_url)}
                        ><BsChevronDoubleLeft />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchRequests(pagination.prev_page_url)}
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
                            onClick={() => fetchRequests(pagination.next_page_url)}
                        ><BsChevronRight />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchRequests(pagination.last_page_url)}
                        ><BsChevronDoubleRight />
                        </Button>
                    </HStack> */}


                    <VisuallyHidden>
                        <table id='printable-table' ref={tableRef}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    {
                                        columnDefs.map((column, key) => {
                                            if (column.field != "receipt") {
                                                return (
                                                    <th key={key}>{column.headerName}</th>
                                                )
                                            }
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
                                                <td>{data.status}</td>
                                                <td>{data.created_at}</td>
                                                <td>{data.transaction_id}</td>
                                                <td>{data.amount}</td>
                                                <td>{data.bank_name}</td>
                                                <td>{data.transaction_type}</td>
                                                <td>{data.name}</td>
                                                <td>{data.beneficiary_id}</td>
                                                <td>{data.phone_number}</td>
                                                <td>{data.updated_at}</td>
                                                <td>{data.user_id}</td>
                                                <td>{data.remarks}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </VisuallyHidden>

                </Box>
            </Layout>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign={'center'}>
                        Enter your MPIN to confirm payout.
                    </ModalHeader>
                    <ModalBody>
                        <HStack alignItems={'center'} justifyContent={'center'}>
                            <PinInput otp onComplete={value => setMpin(value)}>
                                <PinInputField bg={'aqua'} />
                                <PinInputField bg={'aqua'} />
                                <PinInputField bg={'aqua'} />
                                <PinInputField bg={'aqua'} />
                            </PinInput>
                        </HStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack justifyContent={'flex-end'}>
                            <Button colorScheme='twitter' onClick={() => approveRequest(currentCell)}>Confirm</Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default FundRequests