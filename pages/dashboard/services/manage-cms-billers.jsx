import React, { useEffect, useState } from 'react'
import {
    Box,
    Text,
    Stack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr, Th, Td,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    VStack,
    useToast
} from '@chakra-ui/react'
import Layout from '../layout'
import { useFormik } from 'formik'
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie'

const ManageCmsBillers = () => {
    const Toast = useToast({ position: 'top-right' })
    const Formik = useFormik({
        initialValues: {
            billerId: "",
            name: ""
        },
        onSubmit: values =>{
            BackendAxios.post('/api/admin/add-cms-billers', values).then(res =>{
                fetchBillers()
                Toast({
                    status: 'success',
                    description: 'Biller added successfully'
                })
            }).catch(err =>{
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                Toast({
                    status: 'error',
                    title: 'Error while adding Biller',
                    description: err.response?.data?.message || err.response?.data || err.message
                })
            })
        }
    })
    const [billers, setBillers] = useState([])

    function fetchBillers(){
        BackendAxios.get('/api/cms-billers').then(res=>{
            setBillers(res.data)
        }).catch(err=>{
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                title: 'Error while fetching Billers',
                description: err.response?.data?.message || err.response?.data || err.message
            })
        })
    }

    useEffect(()=>{
        fetchBillers()
    },[])

    function deleteBiller(id){
        BackendAxios.delete(`/api/admin/cms-biller/${id}`).then(res=>{
            Toast({
                status: 'success',
                description: 'Biller deleted successfully'
            })
            fetchBillers()
        }).catch(err => {
            Toast({
                status: 'error',
                title: 'Error while deleting Biller',
                description: err.response?.data?.message || err.response?.data || err.message
            })
        })
    }

    return (
        <>
            <Layout pageTitle={'CMS Billers'}>
                <Text fontSize={'lg'} fontWeight={'bold'}>Manage CMS Billers</Text>
                <Box p={2} my={6} bg={'twitter.500'}>
                    <Text color={'#FFF'}>
                        Add New CMS Biller
                    </Text>
                </Box>
                <Stack
                    p={4} spacing={8}
                    justifyContent={'flex-start'}
                    direction={['column', 'row']}
                >
                    <FormControl>
                        <FormLabel>Biller ID</FormLabel>
                        <Input
                            name='billerId' bg={'#FFF'}
                            w={['full', 'xs']}
                            onChange={Formik.handleChange}
                            placeholder='Biller ID'
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Biller Name</FormLabel>
                        <Input
                            name='name' bg={'#FFF'}
                            w={['full', 'xs']}
                            onChange={Formik.handleChange}
                            placeholder='Biller Name'
                        />
                    </FormControl>
                    {/* <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select name='status' onChange={Formik.handleChange}>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </Select>
                    </FormControl> */}
                </Stack>
                <HStack p={4} justifyContent={'flex-end'}>
                    <Button colorScheme='twitter' onClick={Formik.handleSubmit}>Save</Button>
                </HStack>
                <Box p={24}></Box>
                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Serial No.</Th>
                                <Th>Biller ID</Th>
                                <Th>Biller Name</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                billers.map((biller, key)=> (
                                    <Tr key={key}>
                                        <Td>{key+1}</Td>
                                        <Td>{biller.biller_id}</Td>
                                        <Td>{biller.name}</Td>
                                        <Td>
                                            <HStack spacing={4}>
                                                {/* <Button size={'xs'} colorScheme='green'>Edit</Button> */}
                                                <Button 
                                                size={'xs'} 
                                                colorScheme='red'
                                                onClick={()=>deleteBiller(biller.id)}
                                                >Delete</Button>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))
                            }
                        </Tbody>
                    </Table>
                </TableContainer>
            </Layout>
        </>
    )
}

export default ManageCmsBillers