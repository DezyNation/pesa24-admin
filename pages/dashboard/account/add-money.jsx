import React, { useState } from 'react'
import Layout from '../layout'
import {
    Box,
    Stack,
    HStack,
    VStack,
    Text,
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftAddon,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalBody,
    ModalHeader,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    PinInputField,
    PinInput,
    useToast
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie'


const AddMoney = () => {
    const { isOpen, onClose, onOpen } = useDisclosure()
    const Toast = useToast({
        position: 'top-right'
    })

    const Formik = useFormik({
        initialValues: {
            amount: "",
            transactionDate: "",
            remarks: "",
            mpin: ""
        }
    })

    function addMoney() {
        BackendAxios.post(`/api/admin/add-admin-funds`, {
            amount: Formik.values.amount,
            mpin: Formik.values.mpin,
            remarks: Formik.values.remarks
        }).then(res => {
            Toast({
                status: 'success',
                description: 'Funds added to your account',
            })
            onClose()
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

    const [rowData, setRowData] = useState([
        {}
    ])

    const [columnDefs, setColumnDefs] = useState([
        { field: "Trnxn ID" },
        { field: "amount" },
        { field: "datetime" },
        { field: "remarks" },
    ])

    return (
        <>
            <Layout pageTitle={'Add Money'}>
                <Text fontWeight={'semibold'} fontSize={'lg'}>Add Money</Text>

                {/* Add Money Form */}
                <Box py={6}>
                    <Box
                        rounded={16}
                        overflow={'hidden'}
                    >
                        <Box
                            bg={'twitter.500'}
                            p={3} color={'white'}
                        >
                            <Text>Add Money To Your Wallet</Text>
                        </Box>
                        <Box p={4}>
                            <Stack
                                direction={['column', 'row']}
                                spacing={6} py={6}
                            >
                                <FormControl w={['full', 'xs']}>
                                    <FormLabel>Enter Amount</FormLabel>
                                    <InputGroup>
                                        <InputLeftAddon children={'₹'} />
                                        <Input
                                            name={'amount'} bg={'white'}
                                            onChange={Formik.handleChange}
                                            placeholder={'Enter amount you want'}
                                        />
                                    </InputGroup>
                                </FormControl>
                                {/* <FormControl w={['full', 'xs']}>
                                    <FormLabel>Transaction Date</FormLabel>
                                    <Input
                                        name={'transactionDate'}
                                        onChange={Formik.handleChange}
                                        type={'date'} bg={'white'}
                                    />
                                </FormControl> */}
                            </Stack>
                            <FormControl py={6}>
                                <FormLabel>Remarks (optional)</FormLabel>
                                <Input
                                    placeholder='Enter here...'
                                    bg={'white'} name={'remarks'}
                                    onChange={Formik.handleChange}
                                />
                            </FormControl>

                            <HStack justifyContent={'flex-end'}>
                                <Button
                                    type='submit' onClick={onOpen}
                                    colorScheme={'twitter'}>Submit</Button>
                            </HStack>
                        </Box>
                    </Box>
                </Box>


                <Box py={6}>
                    <Text fontWeight={'medium'} pb={4}>Recent Transactions</Text>
                    <Box
                        rounded={16} overflow={'hidden'}
                        className='ag-theme-alpine ag-theme-pesa24-blue'
                        w={'full'} h={['sm', 'xs']}>
                        <AgGridReact
                            columnDefs={columnDefs}
                            rowData={rowData}

                        >

                        </AgGridReact>
                    </Box>
                </Box>


                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Confirm Transaction</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack>
                                <FormControl w={['full', 'xs']}>
                                    <FormLabel>Enter Your MPIN</FormLabel>
                                    <HStack spacing={4}>
                                        <PinInput
                                            name={'mpin'} otp
                                            onComplete={value => Formik.setFieldValue("mpin", value)}
                                        >
                                            <PinInputField bg={'aqua'} />
                                            <PinInputField bg={'aqua'} />
                                            <PinInputField bg={'aqua'} />
                                            <PinInputField bg={'aqua'} />
                                        </PinInput>
                                    </HStack>
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant='ghost' onClick={onClose}>Cancel</Button>
                            <Button colorScheme='blue' mr={3} onClick={() => addMoney()}>Done</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Layout>
        </>
    )
}

export default AddMoney