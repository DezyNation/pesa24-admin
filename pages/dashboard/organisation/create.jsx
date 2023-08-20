import React from 'react'
import Layout from '../layout'
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Select,
    HStack,
    Stack,
    Button,
    Text,
    Textarea,
    useToast
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { FormAxios } from '@/lib/utils/axios'
import Cookies from 'js-cookie'

const Create = () => {
    const Toast = useToast({ position: 'top-right' })
    const Formik = useFormik({
        initialValues: {
            firmName: "",
            authorisedNumbers: "",
            code: "",
            firmAddress: "",
            email: "",
            phoneNumber: "",
            coi: "",
            coiAttachment: null,
            gst: "",
            gstAttachment: null,
            mou: "",
            mouAttachment: null,
            aoa: "",
            aoaAttachment: null,
            firmPan: "",
            firmPanAttachment: null,
            signatoryPan: "",
            signatoryPanAttachment: null,
            signatoryAadhaar: "",
            signatoryAadhaarAttachment: null,
            signatoryPhoto: null,
        },
        onSubmit: (values) => {
            FormAxios.post(`/api/admin/create-organization`, values).then(res => {
                Toast({
                    status: 'success',
                    description: 'Whitelable organisation added'
                })
            }).catch(err=>{
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                Toast({
                    status: 'error',
                    title: 'Error while creating organisation',
                    description: err.response?.data?.message || err.response?.data || err.message
                })
            })
        }
    })

    return (
        <>
            <Layout pageTitle={'Register Whitelabel Organisation'}>
                <Box my={6} p={3} bg={'twitter.500'} color={'#FFF'} roundedTop={16}>
                    <Text>Register New Whitelabel Organisations</Text>
                </Box>
                <Box w={'full'} p={[4, 8]}>
                    {/* <form action="#" id='form'> */}
                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Company Name</FormLabel>
                                <Input name='firmName' onChange={Formik.handleChange} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Comapny Code</FormLabel>
                                <Input name='code' onChange={Formik.handleChange} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Phone Number</FormLabel>
                                <Input name='phoneNumber' onChange={Formik.handleChange} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Email</FormLabel>
                                <Input name='email' onChange={Formik.handleChange} />
                            </FormControl>
                        </Stack>

                        <FormControl pb={4} w={['full', 'lg']}>
                            <FormLabel>Company Address</FormLabel>
                            <Textarea name='firmAddress' onChange={Formik.handleChange} />
                        </FormControl>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>COI</FormLabel>
                                <Input name='coi' onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload COI</FormLabel>
                                <Input name='coiAttachment' type='file' onChange={e => Formik.setFieldValue("coiAttachment", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>GST</FormLabel>
                                <Input name='gst' onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload GST</FormLabel>
                                <Input name='gstAttachment' type='file' onChange={e => Formik.setFieldValue("gstAttachment", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>MOU</FormLabel>
                                <Input name='mou' onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload MOU</FormLabel>
                                <Input name='mouAttachment' type='file' onChange={e => Formik.setFieldValue("mouAttachment", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>AOA</FormLabel>
                                <Input name='aoa' onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload AOA</FormLabel>
                                <Input name='aoaAttachment' type='file' onChange={e => Formik.setFieldValue("aoaAttachment", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Firm PAN</FormLabel>
                                <Input name='firmPan' onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload PAN</FormLabel>
                                <Input name='firmPanAttachment' type='file' onChange={e => Formik.setFieldValue("firmPanAttachment", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Signatory PAN</FormLabel>
                                <Input name='signatoryPan' onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload Signatory PAN</FormLabel>
                                <Input name='signatoryPanAttachment' type='file' onChange={e => Formik.setFieldValue("signatoryPanAttachment", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Signatory Aadhaar</FormLabel>
                                <Input name='signatoryAadhaar' type='phone' onChange={Formik.handleChange} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload Signatory Aadhaar</FormLabel>
                                <Input name='signatoryAadhaarAttachment' type='file' onChange={e => Formik.setFieldValue("signatoryAadhaarAttachment", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Upload Signatory Photo</FormLabel>
                                <Input name='signatoryPhoto' type='file' onChange={e => Formik.setFieldValue("signatoryPhoto", e.currentTarget.files[0])} />
                            </FormControl>
                        </Stack>
                        <HStack p={4} justifyContent={'flex-end'}>
                            <Button colorScheme='twitter' w={'auto'} onClick={Formik.handleSubmit} >Save</Button>
                        </HStack>
                    {/* </form> */}
                </Box>
            </Layout>
        </>
    )
}

export default Create