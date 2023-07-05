import React, { useState, useEffect } from 'react'
import Layout from '../layout'
import {
    Text,
    Box,
    Button,
    Input,
    HStack,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr, Td, Th,
    useToast
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie'

const ManageCategories = () => {
    const Toast = useToast({
        position: 'top-right'
    })
    const [categories, setCategories] = useState([])
    const CategoryFormik = useFormik({
        initialValues: {
            categoryName: "",
        },
        onSubmit: values => {
            BackendAxios.post("/api/admin/categories", values).then(res => {
                fetchCategories()
                CategoryFormik.handleReset()
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

    function deleteCategory(categoryId) {
        BackendAxios.post("/api/admin/delete-category", {
            categoryId: categoryId
        }).then(res => {
            Toast({
                status: "success",
                description: "Category deleted successfully"
            })
            fetchCategories()
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

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <>
            <Layout pageTitle={'Manage Categories'}>
                <Text fontSize={'lg'} fontWeight={'bold'}>Manage Categories For BBPS Commission</Text>
                <Box p={3} my={6} bg={'twitter.500'} roundedTop={16}>
                    <Text color={'#FFF'}>
                        Register New Category
                    </Text>
                </Box>
                <HStack justifyContent={'space-between'}>
                    <Box>
                        <Text>Category Name</Text>
                        <Input
                            placeholder='e.g, Recharge, Water, etc.'
                            name='categoryName' width={'xs'}
                            value={CategoryFormik.values.categoryName}
                            onChange={CategoryFormik.handleChange}
                        />
                    </Box>
                    <Button colorScheme='twitter' onClick={CategoryFormik.handleSubmit}>Save</Button>
                </HStack>

                <TableContainer mt={16} w={'full'}>
                    <Table variant={'striped'}>
                        <Thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Name</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                categories.map((category, key) => (
                                    <Tr key={key}>
                                        <Td>{key + 1}</Td>
                                        <Td>{category.name}</Td>
                                        <Td>
                                            <Button size={'sm'} colorScheme='red' onClick={()=>deleteCategory(category.id)}>Delete</Button>
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

export default ManageCategories