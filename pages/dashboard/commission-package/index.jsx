import React, { useMemo, useEffect, useState } from 'react'
import Layout from '../layout'
import {
    Box,
    Text,
    HStack,
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightAddon,
    Select,
    PinInput,
    PinInputField,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Switch,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Stack,
    useToast,
    useDisclosure
} from '@chakra-ui/react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import CommissionStructure from '@/lib/commission-structure/CommissionStructure'
import { BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronLeft, BsChevronRight, BsTrash } from 'react-icons/bs'
import { useFormik } from 'formik'
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie';


const CommissionSetup = () => {
    const [packageSearchQuery, setPackageSearchQuery] = useState("")
    const Toast = useToast({
        position: 'top-right'
    })
    const [mpin, setMpin] = useState("")
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [modalStatus, setModalStatus] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [gridObject, setGridObject] = useState({})
    const [allPackages, setAllPackages] = useState([])
    const [selectedPackage, setSelectedPackage] = useState("")
    const [selectedService, setSelectedService] = useState("")
    const [focussedPackageTitle, setFocussedPackageTitle] = useState("")
    const [focussedPackageId, setFocussedPackageId] = useState("")
    const [selectedBbpsOperatorId, setSelectedBbpsOperatorId] = useState("")
    const [pagination, setPagination] = useState({
        current_page: "1",
        total_pages: "1",
        first_page_url: "",
        last_page_url: "",
        next_page_url: "",
        prev_page_url: "",
    })
    const [fetchedUser, setFetchedUser] = useState({
        id: "",
        user_name: "",
        firm_name: "",
        wallet: "",
        phone: "",
    })

    const [isAssignModalOpen, setIsAssignModalOpen] = useState({
        status: false,
        selectedPackageId: "",
        name: ""
    })

    const [rowData, setRowData] = useState([
    ])

    const [columnDefs, setColumnDefs] = useState([
    ])

    const defaultColDef = useMemo(() => {
        return {
            resizable: true,
            editable: true,
            singleClickEdit: true,
            filter: true,
            floatingFilter: true,
        };
    }, []);

    const Formik = useFormik({
        initialValues: {
            package_name: "",
            is_default: "0",
            is_active: "0",
        },
        onSubmit: values => {
            if (!values.package_name) {
                return Toast({
                    description: 'Package name can not be empty'
                })
            }
            BackendAxios.post('/api/admin/create-package', values).then(() => {
                Toast({
                    status: 'success',
                    description: 'Package Created'
                })
                fetchAllPackages()
            }).catch(err => {
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                Toast({
                    status: 'error',
                    description: err.message
                })
            })
        }
    })


    const VerificationFormik = useFormik({
        initialValues: {
            beneficiaryId: "",
            packageId: ""
        },
        onSubmit: values => {
            if (!values.beneficiaryId && !values.packageId) {
                Toast({
                    description: 'Please enter correct details'
                })
            }
            else {
                BackendAxios.post(`/api/admin/new-fund`, values).then(res => {
                    Toast({
                        status: 'success',
                        description: 'Package assigned successfully!'
                    })
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
        }
    })


    function fetchAllPackages(pageLink) {
        BackendAxios.get(pageLink || '/api/admin/packages?page=1').then(res => {
            setPagination({
                current_page: res.data.current_page,
                total_pages: parseInt(res.data.last_page),
                first_page_url: res.data.first_page_url,
                last_page_url: res.data.last_page_url,
                next_page_url: res.data.next_page_url,
                prev_page_url: res.data.prev_page_url,
            })
            setAllPackages(res.data.data)
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                description: `Error while fetching packages`
            })
        })
    }

    function fetchAllCommission(selectedPackageId, serviceName, emptyRow) {
        BackendAxios.get(`api/admin/commissions/${serviceName}/${selectedPackageId}`).then(res => {
            if (res.data.length == 0) {
                setRowData(emptyRow)
            }
            else {
                setRowData(res.data)
            }
            setModalStatus(true)
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: "error",
                description: "Error while fetching commission"
            })
        })
    }

    function onCellValueChange(params) {
        if (
            selectedService != "aeps-mini-statement" &&
            selectedService != "bbps"
        ) {
            if (params.data.from && params.data.to && params.data.fixed_charge) {
                BackendAxios.post(`/api/admin/commissions/${selectedService}`, {
                    ...params.data,
                    package_id: selectedPackage,
                    from: parseInt(params.data.from),
                    to: parseInt(params.data.to),
                }).then(() => {
                    Toast({
                        status: 'success',
                        description: `Commission Updated`
                    })
                }).catch(err => {
                    if (err?.response?.status == 401) {
                      Cookies.remove("verified");
                      window.location.reload();
                    }
                    Toast({
                        status: 'error',
                        description: `Error while updating commission`
                    })
                })
            }
        }
        if (selectedService == "aeps-mini-statement") {
            BackendAxios.post(`/api/admin/commissions/${selectedService}`, {
                ...params.data,
                package_id: selectedPackage
            }).then(() => {
                Toast({
                    status: 'success',
                    description: `Commission Updated`
                })
            }).catch(err => {
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                Toast({
                    status: 'error',
                    description: `Error while updating commission`
                })
            })
        }
        if (selectedService == "bbps") {
            if (params.data.operator_name && params.data.fixed_charge) {
                BackendAxios.post(`/api/admin/commissions/${selectedService}`, {
                    ...params.data,
                    package_id: selectedPackage
                }).then(() => {
                    Toast({
                        status: 'success',
                        description: `Commission Updated`
                    })
                }).catch(err => {
                    if (err?.response?.status == 401) {
                      Cookies.remove("verified");
                      window.location.reload();
                    }
                    Toast({
                        status: 'error',
                        description: `Error while updating commission`
                    })
                })
            }
        }
        if (selectedService == "cms") {
            if (params.data.biller_id && params.data.fixed_charge) {
                BackendAxios.post(`/api/admin/commissions/${selectedService}`, {
                    ...params.data,
                    package_id: selectedPackage
                }).then(() => {
                    Toast({
                        status: 'success',
                        description: `Commission Updated`
                    })
                }).catch(err => {
                    if (err?.response?.status == 401) {
                      Cookies.remove("verified");
                      window.location.reload();
                    }
                    Toast({
                        status: 'error',
                        description: `Error while updating commission`
                    })
                })
            }
        }
    }

    async function deleteCommission(keyword, id) {
        await BackendAxios.post(`/api/admin/commissions/delete/${keyword}/${id}`).then(res => {
            Toast({
                status: 'success',
                description: 'Commission Deleted Successfully!'
            })
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                title: 'Error while deleting commission',
                description: err.response?.data?.message || err.response?.data || err.message
            })
        })
    }

    useEffect(() => {
        if (selectedService == "bbps") {
            BackendAxios.get("/api/admin/operators").then(res => {
                const operatorNames = res.data.map((operator) => (operator.name))
                setColumnDefs(columnDefs.map((columnDef) => {
                    if (columnDef.field === 'operator_name') {
                        return {
                            ...columnDef,
                            cellEditorParams: {
                                values: operatorNames,
                            },
                        };
                    }
                    return columnDef;
                }))
            }).catch(err => {
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                console.log(err)
            })
        }
        if (selectedService == "cms") {
            BackendAxios.get('/api/cms-billers').then(res => {
                const billerIds = res.data.map((biller)=>(biller.biller_id))
                setColumnDefs(columnDefs.map((columnDef) => {
                    if (columnDef.field === 'biller_id') {
                        return {
                            ...columnDef,
                            cellEditorParams: {
                                values: billerIds,
                            },
                        };
                    }
                    return columnDef;
                }))
            }).catch(err => {
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                console.log(err)
            })
        }
    }, [selectedService])

    const SwitchCellRender = (params) => {
        return (
            <Switch
                defaultChecked={params.value === 1}
                onChange={() => {
                    params.node.setDataValue("is_flat", params.value == 1 ? 0 : 1)
                }}
            ></Switch>
        )
    }

    const ActionsCellRender = (params) => {
        return (
            <HStack spacing={4} h={'full'} alignItems={'center'}>
                <Button
                    rounded={'full'}
                    size={'xs'}
                    colorScheme={'whatsapp'}
                    fontSize={'sm'}
                    onClick={() => params.api.applyTransaction({ add: [{ is_flat: 1 }] })}
                >
                    +
                </Button>
                <Button
                    rounded={'full'}
                    size={'xs'}
                    colorScheme={'red'}
                    onClick={() => {
                        if(!params.data.id){
                            params.api.applyTransaction({ remove: params.api.getSelectedRows() })
                            return
                        }
                        deleteCommission(selectedService, params.data.id).then(() => {
                            params.api.applyTransaction({ remove: params.api.getSelectedRows() })
                        })
                    }}
                >
                    <BsTrash />
                </Button>
            </HStack>
        )

    }

    function searchPackage() {
        // allPackages.filter((package)=>(packageSearchQuery))
    }

    function handleModal(packageId, keyword) {
        setSelectedPackage(packageId)
        setSelectedService(keyword)
        const structure = CommissionStructure.find((item) => {
            if (item.id == keyword) {
                setModalTitle(item.title)
                return item
            }
        })
        if (structure) {
            setGridObject(structure)
            setColumnDefs(structure.columnDefs)
            fetchAllCommission(packageId, keyword, structure.rowData)
        }
    }


    useEffect(() => {
        fetchAllPackages('/api/admin/packages?page=1')
        BackendAxios.get('/api/admin/package-count').then(res => {

        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            console.log(err)
        })
    }, [])

    const verifyBeneficiary = (queriedUserId) => {
        // Logic to verifiy beneficiary details
        BackendAxios.post(`/api/admin/user/info/${VerificationFormik.values.beneficiaryId}`).then((res) => {
            Formik.setFieldValue("beneficiaryId", res.data.data.id)
            setFetchedUser({
                ...fetchedUser,
                id: res.data.data.id,
                user_name: res.data.data.first_name + " " + res.data.data.last_name,
                firm_name: res.data.data.firm_name,
                phone: res.data.data.phone_number,
                wallet: res.data.data.wallet,

            })
        }).catch((err) => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                description: err.response.data.message || err.response.data || 'User not found!'
            })
            setFetchedUser({
                user_name: "",
                firm_name: "",
                wallet: "",
                phone: "",
            })
        })
    }

    function updatePackageDetails(dataToUpdate, selectedPackageId) {
        BackendAxios.post(`/api/admin/update-package-defaults`, {
            packageId: selectedPackageId,
            column: Object.keys(dataToUpdate)[0],
            value: Object.values(dataToUpdate)[0],
        }).then(res => {
            Toast({
                status: "success",
                description: "Details Updated Successfully"
            })
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

    function deletePackage() {
        BackendAxios.post(`/api/admin/packages/delete/${focussedPackageId}`, {
            mpin: mpin
        }).then(res => {
            Toast({
                status: 'success',
                description: "Package was deleted successfully"
            })
            fetchAllPackages()
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

    function assignPackage() {
        if (!VerificationFormik.values.beneficiaryId) {
            Toast({
                description: "Please enter User ID"
            })
            return
        }
        BackendAxios.post("/api/admin/assign-package", {
            user_id: fetchedUser?.id,
            package_id: isAssignModalOpen.selectedPackageId
        }).then(res => {
            if (res.data) {
                Toast({
                    status: 'success',
                    description: "Package assigned to user successfully!"
                })
            } else {
                Toast({
                    description: "Package could not be assigned"
                })
            }
            setIsAssignModalOpen({ status: false })
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
            <Layout pageTitle={'Define Commission Rate'}>
                <Box p={3} bg={'twitter.500'} color={'white'} roundedTop={16}>
                    <Text>Create New Commission Package</Text>
                </Box>
                <Stack
                    spacing={6} my={6}
                    direction={['column', 'row']}
                >
                    <FormControl w={'xs'}>
                        <FormLabel>Package Name</FormLabel>
                        <Input
                            name={'package_name'} bg={'white'}
                            placeholder={'Enter package name'}
                            onChange={Formik.handleChange}
                        />
                    </FormControl>
                    <FormControl w={'xs'}>
                        <FormLabel>Is Default</FormLabel>
                        <Select name='is_default' onChange={Formik.handleChange}>
                            <option value="0" selected>No</option>
                            <option value="1">Yes</option>
                        </Select>
                    </FormControl>
                    <FormControl w={'xs'}>
                        <FormLabel>Is Active</FormLabel>
                        <Select name='is_active' onChange={Formik.handleChange}>
                            <option value="0" selected>No</option>
                            <option value="1">Yes</option>
                        </Select>
                    </FormControl>
                </Stack>

                <HStack justifyContent={'flex-end'} mb={8}>
                    <Button colorScheme={'twitter'} onClick={Formik.handleSubmit}>Create</Button>
                </HStack>

                <Box mt={'28'}>
                    <Text color={'#555'}>Commission Setup For Existing Packages</Text>
                    <HStack mt={6} mb={2}>
                        <Input
                            value={packageSearchQuery}
                            bg={'white'} w={['full', 'xs']}
                            onChange={(e) => setPackageSearchQuery(e.target.value)}
                            placeholder={'Enter commission package name to search'}
                        />
                        <Button onClick={searchPackage} colorScheme={'twitter'}>Search</Button>
                    </HStack>

                    <HStack spacing={2} mt={12} py={4} bg={'white'} justifyContent={'center'}>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchAllPackages(pagination.first_page_url)}
                        ><BsChevronDoubleLeft />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchAllPackages(pagination.prev_page_url)}
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
                            onClick={() => fetchAllPackages(pagination.next_page_url)}
                        ><BsChevronRight />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                            onClick={() => fetchAllPackages(pagination.last_page_url)}
                        ><BsChevronDoubleRight />
                        </Button>
                    </HStack>
                    <TableContainer>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Assign To User</Th>
                                    <Th>Creator Name</Th>
                                    <Th>Package Name</Th>
                                    <Th>Total Users</Th>
                                    <Th>Default</Th>
                                    <Th>Status</Th>
                                    {/* <Th>AePS Cash Wihtdrawal</Th>
                                    <Th>AePS Aadhaar Pay</Th>
                                    <Th>AePS Mini Statement</Th>
                                    <Th>BBPS</Th> */}
                                    <Th>Payout</Th>
                                    <Th>DMT</Th>
                                    {/* <Th>Recharge</Th>
                                    <Th>LIC</Th>
                                    <Th>CMS</Th>
                                    <Th>Fastag</Th> */}
                                    <Th>Delete Package</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    allPackages.map((item, key) => {
                                        return (
                                            <Tr key={key}>
                                                <Td>{key + 1}</Td>
                                                <Td>
                                                    <Button
                                                        colorScheme='orange'
                                                        size={'sm'}
                                                        onClick={() => {
                                                            setIsAssignModalOpen({
                                                                status: true,
                                                                selectedPackageId: item.id,
                                                                name: item.name
                                                            })
                                                        }}
                                                    >Select User</Button>
                                                </Td>
                                                {/* Name of person who created these packages */}
                                                <Td>{item.user_name}</Td>
                                                <Td>
                                                    <Input
                                                        w={'36'}
                                                        defaultValue={item.name}
                                                        onChange={e => setFocussedPackageTitle(e.target.value)}
                                                        p={0} border={0} variant={'unstyled'}
                                                        onBlur={() => updatePackageDetails({ name: focussedPackageTitle }, item.id)}
                                                    />
                                                </Td>
                                                <Td>{item.assigned_users_count || 0}</Td>
                                                <Td>
                                                    <Switch
                                                        defaultChecked={item.is_default === 1}
                                                        onChange={e => updatePackageDetails({ is_default: e.target.checked }, item.id)}
                                                    ></Switch>
                                                </Td>
                                                <Td>
                                                    <Switch
                                                        defaultChecked={item.status === 1}
                                                        onChange={e => updatePackageDetails({ status: e.target.checked }, item.id)}
                                                    ></Switch>
                                                </Td>
                                                    {/* AEPS Cash Wihtdrawal */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "aeps-cash-withdrawal")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                    {/* AEPS Aadhaar Pay */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "aeps-aadhaar-pay")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                    {/* AEPS Mini Statement */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "aeps-mini-statement")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                    {/* BBPS */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "bbps")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                    {/* Payout */}
                                                <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "payout")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td>
                                                    {/* DMT */}
                                                <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "dmt")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td>
                                                    {/* Recharge */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "recharge")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                    {/* LIC */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "lic")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                    {/* CMS */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "cms")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                    {/* Fastag */}
                                                {/* <Td>
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'blue'}
                                                        onClick={() => handleModal(item.id, "fastag")}
                                                    >
                                                        Set Commission
                                                    </Button>
                                                </Td> */}
                                                <Td>
                                                    {/* Delete */}
                                                    <Button
                                                        size={'sm'}
                                                        colorScheme={'red'}
                                                        onClick={() => { setFocussedPackageId(item.id); onOpen() }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        )
                                    })
                                }
                            </Tbody>
                        </Table>
                    </TableContainer>
                    <HStack spacing={2} py={4} bg={'white'} justifyContent={'center'}>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                        ><BsChevronDoubleLeft />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
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
                        ><BsChevronRight />
                        </Button>
                        <Button
                            colorScheme={'twitter'}
                            fontSize={12} size={'xs'}
                            variant={'outline'}
                        ><BsChevronDoubleRight />
                        </Button>
                    </HStack>
                </Box>
            </Layout>



            {/* Commission Modal */}
            <Modal
                isOpen={modalStatus}
                onClose={() => setModalStatus(false)}
                size={'3xl'}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textTransform={'capitalize'}>
                        Edit Commission for {modalTitle}
                        <ModalCloseButton />
                    </ModalHeader>
                    <ModalBody>
                        <Box className='ag-theme-alpine' h={['sm']}>
                            <AgGridReact
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                components={{
                                    'switchCellRender': SwitchCellRender,
                                    'actionsCellRender': ActionsCellRender
                                }}
                                rowSelection={'single'}
                                onCellValueChanged={onCellValueChange}
                            >

                            </AgGridReact>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <HStack justifyContent={'flex-end'} spacing={4}>
                            <Button
                                variant={'ghost'}
                                onClick={() => setModalStatus(false)}>
                                Cancel
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>


            {/* MPIN Confirmation Modal */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        This action can not be undone!
                    </ModalHeader>
                    <ModalBody>
                        <Text>
                            By deleting this package, you understand that it can't be recovered back.
                        </Text>
                        <Text fontWeight={'bold'}>
                            Enter your MPIN to confirm.
                        </Text>
                        <HStack gap={4} pt={4} justifyContent={'center'}>
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
                            <Button colorScheme='red' onClick={deletePackage}>Delete Now</Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Package assign modal */}
            <Modal
                isOpen={isAssignModalOpen.status}
                onClose={() => setIsAssignModalOpen({ status: false })}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Assign {isAssignModalOpen.name} Package To Any User</ModalHeader>
                    <ModalBody>
                        <Stack
                            direction={['column', 'row']}
                            spacing={6} py={6}
                        >
                            <FormControl w={['full', 'xs']}>
                                <FormLabel>User ID</FormLabel>
                                <InputGroup>
                                    <Input
                                        name={'beneficiaryId'}
                                        value={VerificationFormik.values.beneficiaryId}
                                        onChange={VerificationFormik.handleChange}
                                        placeholder={'Enter Beneficiary User ID'}
                                    />
                                    <InputRightAddon
                                        children={'Verify'}
                                        cursor={'pointer'}
                                        onClick={() => verifyBeneficiary()}
                                    />
                                </InputGroup>
                            </FormControl>
                        </Stack>
                        {
                            fetchedUser.user_name ?
                                <Stack
                                    p={4} bg={'blue.50'}
                                    border={'1px'}
                                    borderColor={'blue.200'}
                                    rounded={16}
                                    direction={['column']}
                                    spacing={6} justifyContent={'space-between'}
                                    textTransform={'capitalize'}
                                >
                                    <Box>
                                        <Text fontWeight={'medium'}>Beneficiary Name</Text>
                                        <Text>{fetchedUser.user_name}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight={'medium'}>Firm Name</Text>
                                        <Text>{fetchedUser.firm_name}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight={'medium'}>Current Balance</Text>
                                        <Text>₹ {fetchedUser.wallet}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight={'medium'}>Phone</Text>
                                        <Text>{fetchedUser.phone}</Text>
                                    </Box>
                                </Stack> : null
                        }
                    </ModalBody>
                    <ModalFooter>
                        <HStack justifyContent={'flex-end'}>
                            <Button colorScheme='twitter' onClick={() => assignPackage()}>Confirm</Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default CommissionSetup