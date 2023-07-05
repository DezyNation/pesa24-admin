import React, { useState, useEffect } from 'react'
import {
    TableContainer,
    Table,
    Thead,
    Tr, Th, Td,
    Tbody,
    HStack,
    Text,
    Switch,
    Button,
    Box,
    useToast,
    CircularProgress
} from '@chakra-ui/react'
import Layout from '../../layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import BackendAxios from '@/lib/utils/axios';
import { BsPlus, BsTrash, BsUpload } from 'react-icons/bs';
import fileDownload from 'js-file-download';
import Cookies from 'js-cookie';

const ActionsCellRenderer = (params) => {
    const Toast = useToast({
        position: 'top-right'
    })
    function addAccount() {
        BackendAxios.post('api/admin/paysprint/payout/add-account', {
            id: params.data.id
        }).then(res => {
            Toast({
                status: 'success',
                description: 'Account added!'
            })
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            console.log(err)
            Toast({
                status: 'error',
                description: 'Error while adding account!'
            })
        })
    }

    function uploadDocuments() {
        BackendAxios.post('api/admin/paysprint/payout/upload-documents', {
            id: params.data.id
        }).then(res => {
            Toast({
                status: 'success',
                description: 'Documents uploaded!'
            })
        }).catch(err => {
            console.log(err)
            Toast({
                status: 'error',
                description: 'Error while uploading!'
            })
        })
    }

    function verifyAccount(verificationStatus) {
        BackendAxios.post(`api/admin/settlement-accounts`, {
            id: params.data.id,
            bank_status: verificationStatus,
            is_verified: verificationStatus,
            bank_account_remarks: params.data.bank_account_remarks
        }).then(res => {
            Toast({
                status: 'success',
                description: 'Account updated!'
            })
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            console.log(err)
            Toast({
                status: 'error',
                description: 'Error while updating!'
            })
        })
    }

    function resetAccount() {
        BackendAxios.post(`api/admin/settlement-accounts`, {
            id: params.data.id,
            bank_status: 0,
            is_verified: 0,
            account_number: null,
            bank_name: "",
            bank_account_remarks: ""
        }).then(res => {
            Toast({
                status: 'success',
                description: 'Account reset successful!'
            })
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                description: 'Error while resetting!'
            })
        })
    }

    function confirmReset() {
        if (!params.data.bank_account_remarks) {
            Toast({
                description: 'Please add remarks first'
            })
            return
        }
        Toast({
            duration: 3000,
            position: 'top',
            render: () => (
                <Box bg={'blue.500'} p={2} w={'xs'}>
                    <Text

                        color={'white'}
                        textAlign={'center'}
                    >
                        Reset This Account?
                    </Text>
                    <Text
                        color={'white'}
                        textAlign={'center'}
                        fontSize={'xs'}
                    >The user will have to add his account again to do settlements</Text>
                    <HStack justifyContent={'space-between'} mt={4}>
                        <Button bg={'transparent'} size={'sm'} color={'white'} onClick={resetAccount}>Yes Reset</Button>
                    </HStack>
                </Box>
            )
        })
    }

    return (
        <HStack h={'full'} gap={4}>
            <Switch
                defaultChecked={params.value === 1}
                onChange={() => {
                    verifyAccount(params.data.is_verified == 1 ? 0 : 1)
                }}
            ></Switch>
            <Button
                size={'xs'}
                rounded={'full'}
                colorScheme={'yellow'}
                onClick={addAccount}
                fontSize={18}
            ><BsPlus/></Button>
            {/* <Button
                size={'xs'}
                rounded={'full'}
                colorScheme={'telegram'}
                onClick={uploadDocuments}
                fontSize={18}
            ><BsUpload /></Button> */}
            <Button
                size={'xs'}
                rounded={'full'}
                colorScheme={'red'}
                onClick={confirmReset}
                fontSize={18}
            ><BsTrash/></Button>
        </HStack>
    )
}

const SettlementAccounts = () => {
    const Toast = useToast({
        position: 'top-right'
    })
    const [columnDefs, setColumnDefs] = useState([
        {
            field: "id",
            headerName: "User ID"
        },
        {
            field: "name",
            headerName: "User Name"
        },
        {
            field: "account_number",
            headerName: "Account Number"
        },
        {
            field: "bank_name",
            headerName: "Bank Name"
        },
        {
            field: "ifsc",
            headerName: "IFSC"
        },
        {
            field: 'passbook',
            headerName: "Passbook",
            cellRenderer: 'ImageBtnRenderer'
        },
        {
            field: 'bank_account_remarks',
            headerName: "Admin Remarks",
            editable: true,
            singleClickEdit: true,
            cellEditor: 'agTextCellEditor'
        },
        {
            field: "is_verified",
            headerName: "Actions",
            cellRenderer: 'ActionsCellRenderer',
            pinned: 'right',
            filter: false,
            floatingFilter: false
        },
    ])
    const [rowData, setRowData] = useState([])

    const ImageBtnRenderer = (params) => {
        function downloadFile() {
            if (!params.data.passbook) {
                Toast({
                    description: 'Nothing to download!'
                })
                return
            }
            BackendAxios.post(`/api/admin/file`, {
                address: params.data.passbook
            }, {
                responseType: 'blob'
            }).then(res => {
                fileDownload(res.data, 'Passbook.jpeg')
            })
        }

        return (
            <HStack h={'full'}>
                <Button size={'xs'} colorScheme={'twitter'} onClick={downloadFile}>Download</Button>
            </HStack>
        )
    }

    useEffect(() => {
        BackendAxios.get(`api/admin/settlement-accounts`).then(res => {
            setRowData(res.data.filter((account) => {
                // return account
                if (account.account_number) return account
            }))
        }).catch(err => {
            console.log(err)
            Toast({
                status: 'error',
                description: 'Error while fetching settlement accounts'
            })
        })
    }, [])

    return (
        <>
            <Layout pageTitle={'Settlement Accounts'}>
                <Text>Users' Settlement Accounts</Text>

                <Box
                    h={'lg'} my={16}
                    className='ag-theme-alpine'
                >
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={{
                            filter: true,
                            floatingFilter: true,
                            resizable: true,
                            sortable: true,
                        }}
                        components={{
                            'ActionsCellRenderer': ActionsCellRenderer,
                            'ImageBtnRenderer': ImageBtnRenderer
                        }}
                    />
                </Box>
            </Layout>
        </>
    )
}

export default SettlementAccounts