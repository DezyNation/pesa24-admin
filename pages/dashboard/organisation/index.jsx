import React, { useEffect, useState } from 'react'
import Layout from '../layout'
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    Text,
    useToast,
    Stack,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from '@chakra-ui/react'
import BackendAxios, { FormAxios } from '@/lib/utils/axios'
import { useFormik } from 'formik'
import Cookies from 'js-cookie'

const Index = () => {
    const Toast = useToast({ position: 'top-right' })
    const [organisations, setOrganisations] = useState([])
    const { isOpen, onOpen, onClose } = useDisclosure()

    function fetchOrganisations(){
        BackendAxios.get('/api/admin/organizations').then(res => {
            setOrganisations(res.data)
        }).catch(err => {
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            Toast({
                status: 'error',
                title: 'Error while fetching organisations',
                description: err.response?.data?.message || err.response?.data || err.message
            })
        })
    }

    useEffect(() => {
        fetchOrganisations()
    }, [])


    const Formik = useFormik({
        initialValues: {
            organizationId: "",
            firmName: "",
            authorisedNumbers: "",
            code: "",
            firmAddress: "",
            email: "",
            phoneNumber: "",
            coi: "",
            gst: "",
            mou: "",
            aoa: "",
            firmPan: "",
            signatoryPan: "",
            signatoryAadhaar: "",
        },
        onSubmit: (values) => {
            FormAxios.post(`/api/admin/update-organization`, values).then(res => {
                Toast({
                    status: 'success',
                    description: 'Whitelable organisation updated'
                })
                onClose()
                fetchOrganisations()
            }).catch(err => {
                Toast({
                    status: 'error',
                    title: 'Error while creating organisation',
                    description: err.response?.data?.message || err.response?.data || err.message
                })
                onClose()
            })
        }
    })

    useEffect(()=>{
        BackendAxios.get(`/api/admin/organizations/${Formik.values.organizationId}`).then(res=>{
            if(res.data.length){
                Formik.setFieldValue("firmName", res.data[0].firm_name)
                Formik.setFieldValue("phoneNumber", res.data[0].phone_number)
                Formik.setFieldValue("firmAddress", res.data[0].firm_address)
                Formik.setFieldValue("email", res.data[0].email)
                Formik.setFieldValue("coi", res.data[0].coi)
                Formik.setFieldValue("gst", res.data[0].gst)
                Formik.setFieldValue("mou", res.data[0].mou)
                Formik.setFieldValue("aoa", res.data[0].aoa)
                Formik.setFieldValue("firmPan", res.data[0].firm_pan)
                Formik.setFieldValue("signatoryPan", res.data[0].signatory_pan)
                Formik.setFieldValue("signatoryAadhaar", res.data[0].signatory_aadhaar)
            }
        })
    },[Formik.values.organizationId])

    return (
        <>
            <Layout pageTitle={'All Whitelabel Organisations'}>
                <Box my={6} p={3} bg={'twitter.500'} color={'#FFF'} roundedTop={16}>
                    <Text>Your Whitelabel Organisations</Text>
                </Box>
                <Box p={4}>
                    <Stack direction={['column', 'row']} gap={[8, 16]} justifyContent={'flex-start'}>
                        {
                            organisations.map((organisation, key) => (
                                <Box
                                    w={['full', 'sm']}
                                    boxShadow={'lg'}
                                    rounded={16}
                                    key={key} p={4}
                                    bg={'#FFF'}
                                    onClick={() => {
                                        Formik.setFieldValue("organizationId", organisation.id)
                                        onOpen()
                                    }}
                                >
                                    <Text
                                        fontWeight={'semibold'}
                                        textTransform={'capitalize'}
                                        fontSize={'lg'} pb={2}
                                    >{organisation.firm_name} ({organisation.code})
                                    </Text>
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontSize={'xs'} fontWeight={'semibold'}>PAN:</Text>
                                        <Text fontSize={'xs'} textTransform={'uppercase'}>{organisation.firm_pan}</Text>
                                    </HStack>
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontSize={'xs'} fontWeight={'semibold'}>AoA:</Text>
                                        <Text fontSize={'xs'} textTransform={'uppercase'}>{organisation.aoa}</Text>
                                    </HStack>
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontSize={'xs'} fontWeight={'semibold'}>CoI:</Text>
                                        <Text fontSize={'xs'} textTransform={'uppercase'}>{organisation.coi}</Text>
                                    </HStack>
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontSize={'xs'} fontWeight={'semibold'}>GST:</Text>
                                        <Text fontSize={'xs'} textTransform={'uppercase'}>{organisation.gst}</Text>
                                    </HStack>
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontSize={'xs'} fontWeight={'semibold'}>MoU:</Text>
                                        <Text fontSize={'xs'} textTransform={'uppercase'}>{organisation.mou}</Text>
                                    </HStack>
                                    <br />
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontSize={'xs'} fontWeight={'semibold'}>Signatory PAN:</Text>
                                        <Text fontSize={'xs'} textTransform={'uppercase'}>{organisation.signatory_pan}</Text>
                                    </HStack>
                                    <HStack justifyContent={'space-between'}>
                                        <Text fontSize={'xs'} fontWeight={'semibold'}>Signatory Aadhaar:</Text>
                                        <Text fontSize={'xs'} textTransform={'uppercase'}>{organisation.signatory_aadhaar}</Text>
                                    </HStack>
                                    <br />
                                    <Text fontSize={'xs'}>{organisation.email}</Text>
                                    <Text fontSize={'xs'}>{organisation.phone_number}</Text>
                                </Box>
                            ))
                        }
                    </Stack>
                </Box>
            </Layout>

            <Modal size={'3xl'} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Organisation</ModalHeader>
                    <ModalBody>
                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Company Name</FormLabel>
                                <Input name='firmName' value={Formik.values.firmName} onChange={Formik.handleChange} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Phone Number</FormLabel>
                                <Input name='phoneNumber' value={Formik.values.phoneNumber} onChange={Formik.handleChange} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Email</FormLabel>
                                <Input name='email' value={Formik.values.email} onChange={Formik.handleChange} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>COI</FormLabel>
                                <Input name='coi' value={Formik.values.coi} onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                        </Stack>

                        <FormControl pb={4} w={['full', 'lg']}>
                            <FormLabel>Company Address</FormLabel>
                            <Textarea name='firmAddress' value={Formik.values.firmAddress} onChange={Formik.handleChange} />
                        </FormControl>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>GST</FormLabel>
                                <Input name='gst' value={Formik.values.gst} onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>MOU</FormLabel>
                                <Input name='mou' value={Formik.values.mou} onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>AOA</FormLabel>
                                <Input name='aoa' value={Formik.values.aoa} onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Firm PAN</FormLabel>
                                <Input name='firmPan' value={Formik.values.firmPan} onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                        </Stack>

                        <Stack mb={4} direction={['column', 'row']} spacing={8}>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Signatory PAN</FormLabel>
                                <Input name='signatoryPan' value={Formik.values.signatoryPan} onChange={Formik.handleChange} textTransform={'uppercase'} />
                            </FormControl>
                            <FormControl pb={4} w={['full', 'xs']}>
                                <FormLabel>Signatory Aadhaar</FormLabel>
                                <Input name='signatoryAadhaar' value={Formik.values.signatoryAadhaar} type='phone' onChange={Formik.handleChange} />
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack p={4} justifyContent={'flex-end'}>
                            <Button colorScheme='twitter' variant={'outline'} w={'auto'} onClick={onClose}>Cancel</Button>
                            <Button colorScheme='twitter' w={'auto'} onClick={Formik.handleSubmit} >Save</Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default Index