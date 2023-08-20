import React, { useState, useEffect } from 'react'
import Layout from '../layout'
import {
    Box,
    Text,
    Switch,
    Input,
    Select,
    Button,
    Flex,
    Image,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useToast
} from '@chakra-ui/react'
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie'

const ManageServices = () => {
    const [services, setServices] = useState([])
    const Toast = useToast({ position: 'top-right' })
    const [selectedService, setSelectedService] = useState({
        showModal: false,
        type: "",
        service_name: "",
        image_url: "",
        id: "",
        is_active: false,
        api_call: false,
        down_message: "",
        price: "",
        eko_id: "",
        paysprint_id: "",
        intent: "update"
    })
    function fetchServices() {
        BackendAxios.get("/api/admin/services").then(res => {
            setServices(res.data)
        }).catch(err=>{
            if (err?.response?.status == 401) {
              Cookies.remove("verified");
              window.location.reload();
            }
            console.log(err)
        })
    }
    useEffect(() => {
        fetchServices()
    }, [])

    function updateServiceStatus() {
        BackendAxios.post("/api/admin/service-status", selectedService).then(res => {
            Toast({
                status: 'success',
                description: 'Service status updated'
            })
            fetchServices()
            setSelectedService({ showModal: false })
        }).catch(err => {
            Toast({
                status: 'error',
                description: err.response.data.message || err.response.data || err.message
            })
        })
    }

    function createService() {
        BackendAxios.post("/api/admin/services", { ...selectedService }).then(res => {
            Toast({
                status: 'success',
                description: 'Service created'
            })
            fetchServices()
            setSelectedService({ showModal: false })
        }).catch(err => {
            console.log(err)
            Toast({
                status: 'error',
                description: "Error"
            })
        })
    }

    return (
        <>
            <Layout pageTitle={'Manage Services'}>

                <Box mt={12} mb={6}>
                    <HStack justifyContent={'space-between'}>
                        <Text pb={4} fontSize={'lg'}>Services Status</Text>
                        <Button 
                        colorScheme='twitter'
                        onClick={() => setSelectedService({ intent: "create", showModal: true })}
                        >Add New Service</Button>
                    </HStack>
                    <Flex alignItems={'center'} direction={'row'} justifyContent={'flex-start'} gap={6}>
                        {services.map((service, key) => (
                            <Box
                                key={key} pos={'relative'}
                                p={4} w={'56'}
                                height={'xs'}
                                rounded={8} cursor={'pointer'}
                                boxShadow={'lg'}
                                display={'flex'}
                                flexDir={'column'}
                                alignItems={'center'}
                                justifyContent={'space-between'}
                                onClick={() => setSelectedService({
                                    showModal: true,
                                    id: service.id,
                                    service_name: service.service_name,
                                    image_url: service.image_url,
                                    is_active: service.is_active,
                                    api_call: service.api_call,
                                    down_message: service.down_message,
                                    intent: "update"
                                })}
                                paddingTop={12}
                            >
                                {
                                    service.is_active == 0 && <Text fontSize={10} pos={'absolute'} top={4} right={4} p={1} bg={'orange.500'} color={'white'}>INACTIVE</Text>
                                }
                                {/* {
                                    service.api_call == 0 && <Text fontSize={10} pos={'absolute'} top={4} right={4} p={1} bg={'red.500'} color={'white'}>DISABLED</Text>
                                } */}
                                <Image src={service.image_url} w={'80%'} mb={4} />
                                <Box>
                                    <Text textTransform={'capitalize'}>{service.service_name}</Text>
                                    <HStack justifyContent={'flex-start'} gap={2}>
                                        <Text fontSize={14} textAlign={'left'} fontWeight={'bold'}>Is Active</Text>
                                        <Text fontSize={14} textAlign={'left'}>{service.is_active === 1 ? "Yes" : "No"}</Text>
                                    </HStack>
                                    <HStack justifyContent={'flex-start'} gap={2}>
                                        <Text fontSize={14} textAlign={'left'} fontWeight={'bold'}>Has API Call</Text>
                                        <Text fontSize={14} textAlign={'left'}>{service.api_call === 1 ? "Yes" : "No"}</Text>
                                    </HStack>
                                </Box>
                            </Box>
                        ))
                        }
                    </Flex>
                </Box>
            </Layout>

            <Modal isOpen={selectedService.showModal} onClose={() => setSelectedService({ showModal: false })}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Edit Service Status
                    </ModalHeader>
                    <ModalBody>
                        {
                            selectedService.intent == "create" &&
                            <>
                                <Text>Service Category</Text>
                                <Select name={'type'} onChange={e => setSelectedService({ ...selectedService, type: e.target.value })}>
                                    <option value="aeps">AePS</option>
                                    <option value="bbps">BBPS</option>
                                    <option value="dmt">DMT</option>
                                    <option value="payout">Payout</option>
                                    <option value="recharge">Recharge</option>
                                    <option value="other">Other</option>
                                </Select>
                            </>
                        }
                        <Text mt={4}>Service Name</Text>
                        <Input value={selectedService.service_name} onChange={e => setSelectedService({ ...selectedService, service_name: e.target.value })} />
                        <br />
                        <Text mt={4}>Image URL</Text>
                        <Input value={selectedService.image_url} onChange={e => setSelectedService({ ...selectedService, image_url: e.target.value })} />
                        <br />
                        {selectedService.intent == "create" &&
                            <>
                                <Text mt={4}>Amount</Text>
                                <Input value={selectedService.price} onChange={e => setSelectedService({ ...selectedService, price: e.target.value })} />
                                <Text mt={4}>Eko ID</Text>
                                <Input value={selectedService.eko_id} onChange={e => setSelectedService({ ...selectedService, eko_id: e.target.value })} />
                                <Text mt={4}>Paysprint ID</Text>
                                <Input value={selectedService.paysprint_id} onChange={e => setSelectedService({ ...selectedService, paysprint_id: e.target.value })} />
                            </>
                        }
                        <br />
                        <HStack gap={4}>
                            <Text>Is Active</Text>
                            <Switch defaultChecked={selectedService.is_active} onChange={e => setSelectedService({ ...selectedService, is_active: e.target.checked })}></Switch>
                        </HStack>
                        <br />
                        <HStack gap={4} mb={4}>
                            <Text>Has API Call</Text>
                            <Switch defaultChecked={selectedService.api_call} onChange={e => setSelectedService({ ...selectedService, api_call: e.target.checked })}></Switch>
                        </HStack>
                        <Text>Down Message</Text>
                        <Input value={selectedService.down_message} onChange={e => setSelectedService({ ...selectedService, down_message: e.target.value })} />
                    </ModalBody>
                    <ModalFooter>
                        <HStack justifyContent={'flex-end'}>
                            {
                                selectedService.intent == "update" ?
                                    <Button colorScheme='twitter' onClick={() => updateServiceStatus()}>Save</Button> :
                                    <Button colorScheme='twitter' onClick={() => createService()}>Create</Button>
                            }
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ManageServices