import React, { useState, useEffect } from 'react'
import Layout from '../layout'
import {
    Text,
    Box,
    Stack,
    Button,
    Input,
    HStack,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr, Td, Th,
    useToast,
    Select
} from '@chakra-ui/react'
import { Form, useFormik } from 'formik'
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie'

const ManageOperators = () => {
    const Toast = useToast({
        position: 'top-right'
    })
    const [categories, setCategories] = useState([])
    const [operators, setOperators] = useState([])
    const Formik = useFormik({
        initialValues: {
            categoryId: "",
            operatorName: "",
            ekoId: "",
            paysprintId: "",
        },
        onSubmit: values => {
            BackendAxios.post("/api/admin/operators", values).then(res => {
                Toast({
                    status: 'success',
                    description: "Operator Added"
                })
                fetchOperators()
                Formik.handleReset()
            }).catch(err => {
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                Toast({
                    status: "error",
                    description: err.response.data.message || err.response.data || err.message
                })
            })
        }
    })

    function deleteOperator(operatorId) {
        BackendAxios.post("/api/admin/delete-operator", {
            operatorId: operatorId
        }).then(res => {
            Toast({
                status: "success",
                description: "Operator deleted successfully"
            })
            fetchOperators()
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: "error",
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }
    function fetchCategories() {
        BackendAxios.get("/api/admin/categories").then(res => {
            setCategories(res.data)
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: "error",
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }
    function fetchOperators() {
        BackendAxios.get("/api/admin/operators").then(res => {
            setOperators(res.data)
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: "error",
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    useEffect(() => {
        fetchCategories()
        fetchOperators()
    }, [])

    return (
        <>
            <Layout pageTitle={'Manage Operators'}>
                <Text fontSize={'lg'} fontWeight={'bold'}>Manage Operators For BBPS Commission</Text>
                <Box p={2} my={6} bg={'twitter.500'}>
                    <Text color={'#FFF'}>
                        Register New Operator
                    </Text>
                </Box>
                <Stack
                    justifyContent={'space-between'}
                    direction={['column', 'row']}
                >
                    <Box>
                        <Text>Category</Text>
                        <Select
                            name='categoryId'
                            value={Formik.values.categoryId}
                            onChange={Formik.handleChange} w={'xs'}
                            placeholder='Select Category'
                        >
                            {
                                categories.map((category, key) => (
                                    <option value={category.id} key={key}>{category.name}</option>
                                ))
                            }
                        </Select>
                    </Box>
                    <Box>
                        <Text>Operator Name</Text>
                        <Input
                            placeholder='e.g, Airtel, Tata Power DDL etc.'
                            name='operatorName' width={'xs'}
                            onChange={Formik.handleChange}
                        />
                    </Box>
                    <Box>
                        <Text>EKO</Text>
                        <Input
                            name='ekoId'
                            onChange={Formik.handleChange}
                        />
                    </Box>
                    <Box>
                        <Text>Paysprint ID</Text>
                        <Input
                            name='paysprintId'
                            onChange={Formik.handleChange}
                        />
                    </Box>
                </Stack>
                <HStack pt={6} justifyContent={'flex-end'}>
                    <Button colorScheme='twitter' onClick={Formik.handleSubmit}>Save</Button>
                </HStack>

                <TableContainer mt={16} w={'full'}>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Operator Name</Th>
                                <Th>Category Name</Th>
                                <Th>Paysprint ID</Th>
                                <Th>Eko ID</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                operators.map((operator, key) => (
                                    <Tr key={key}>
                                        <Td>{key + 1}</Td>
                                        <Td>{operator.category_name}</Td>
                                        <Td>{operator.name}</Td>
                                        <Td>{operator.eko_id}</Td>
                                        <Td>{operator.paysprint_id}</Td>
                                        <Td>
                                            <Button size={'sm'} colorScheme='red' onClick={() => deleteOperator(operator.id)}>Delete</Button>
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

export default ManageOperators