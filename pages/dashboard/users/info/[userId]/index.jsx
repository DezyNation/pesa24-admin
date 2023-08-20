import React, { useEffect, useState, useRef } from 'react'
import Layout from '@/pages/dashboard/layout'
import { useRouter } from 'next/router'
import Pdf from 'react-to-pdf'
import BackendAxios from '@/lib/utils/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'
import { useToast } from '@chakra-ui/react'
import { HStack } from '@chakra-ui/react'
import { Stack } from '@chakra-ui/react'
import { Avatar } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { VStack } from '@chakra-ui/react'
import { MdCall, MdEmail, MdPrint } from 'react-icons/md'
import { Button } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react';
import Cookies from 'js-cookie';

const UserInfo = () => {
    const router = useRouter()
    const { userId } = router.query
    const Toast = useToast({ position: 'top-right' })
    const pdfRef = useRef(null)
    const [userInfo, setUserInfo] = useState({})
    useEffect(() => {
        if (router.isReady) {
            if (!userId) {
                Toast({
                    status: 'error',
                    title: 'Error while fetching user info',
                    description: 'Direct access not allowed!'
                })
                return
            }
            BackendAxios.post(`/api/admin/user/info/${userId}`).then(res => {
                setUserInfo(res.data?.data || {})
            }).catch(err => {
                if (err?.response?.status == 401) {
                  Cookies.remove("verified");
                  window.location.reload();
                }
                Toast({
                    status: 'error',
                    title: 'Error while fetching user info',
                    description: err?.response?.data?.message || err?.response?.data || err?.message
                })
            })
        }
    }, [router.isReady])

    return (
        <>
            <Layout pageTitle={userId}>
                <Stack mt={8} gap={[8]} direction={['column', 'row']} id={'info-sheet'} ref={pdfRef}>
                    <VStack flex={['unset', 1]}>
                        <Image
                            src={userInfo.profile_pic ? `${process.env.NEXT_PUBLIC_BACKEND_URL + "/storage/" + userInfo.profile_pic}` : "https://png.pngtree.com/png-vector/20220807/ourmid/pngtree-man-avatar-wearing-gray-suit-png-image_6102786.png"}
                            boxSize={['36', '48']} rounded={'full'} overflow={'hidden'}
                        />
                        <Text mt={4} textTransform={'capitalize'}>{userInfo.roles?.length ? userInfo.roles[0].name : "NA"}</Text>
                        <Text mt={4} fontSize={'xs'} color={'darkslategray'}>
                            Joined on: 09-06-2023
                        </Text>
                    </VStack>
                    <Box flex={['unset', 3]}>
                        <Text fontSize={['xl', '3xl']} textTransform={'uppercase'} fontWeight={'semibold'}>{userInfo.name}</Text>
                        <HStack color={'darkslategray'} fontSize={'xs'}>
                            <Text pr={6} borderRight={'1px'} borderColor={'rgba(0,0,0,0.1)'}>{userInfo.gender}</Text>
                            <Text pl={4}>D.o.B {userInfo.dob}</Text>
                        </HStack>
                        <br /><br />
                        <VStack
                            w={'full'} alignItems={'flex-start'}
                            justifyContent={'flex-start'} gap={2}>
                            <Stack
                                pb={8}
                                w={'full'} direction={['column', 'row']}
                                justifyContent={'flex-start'} gap={[4, 16]}>
                                <HStack spacing={4}>
                                    <MdCall size={24} />
                                    <Text>+91 {userInfo.phone_number}</Text>
                                </HStack>
                                <HStack spacing={4}>
                                    <MdEmail size={24} />
                                    <Text>{userInfo.email}</Text>
                                </HStack>
                            </Stack>
                            <HStack spacing={4}>
                                <Text fontWeight={'semibold'} w={40}>Aadhaar Number: </Text>
                                <Text>{userInfo.aadhaar}</Text>
                            </HStack>
                            <HStack spacing={4}>
                                <Text fontWeight={'semibold'} w={40}>PAN Number: </Text>
                                <Text>{userInfo.pan_number}</Text>
                            </HStack>
                            <HStack spacing={4} alignItems={'flex-start'}>
                                <Text fontWeight={'semibold'} w={40}>Address: </Text>
                                <Box maxW={['full', '70%']}>
                                    <Text>{userInfo.line}</Text>
                                    <Text>{userInfo.city}</Text>
                                    <Text>{userInfo.state} - {userInfo.pincode}</Text>
                                </Box>
                            </HStack>
                        </VStack>
                    </Box>
                </Stack>
                <Stack className='hide-print' mt={8} gap={8} direction={['column', 'row']}>
                    <Box flex={['unset', 1]}>

                    </Box>
                    <Box flex={['unset', 3]}>
                        <Text fontSize={'md'} fontWeight={'semibold'}>Download Documents</Text>
                        <HStack pt={4}>
                            <Button size={['xs', 'md']}>Aadhaar XML</Button>
                            <Button size={['xs', 'md']}>Aadhaar Front</Button>
                            <Button size={['xs', 'md']}>Aadhaar Back</Button>
                            <Button size={['xs', 'md']}>PAN Card</Button>
                        </HStack>
                    </Box>
                </Stack>
                <Box pos={'absolute'} top={28} right={8}>
                    <Pdf targetRef={pdfRef} filename="UserInfo.pdf" options={{ orientation: 'landscape', }}>
                        {
                            ({ toPdf }) => <Button
                                rounded={'full'}
                                size={'sm'}
                                variant={'ghost'}
                                colorScheme={'whatsapp'}
                                leftIcon={<MdPrint />}
                                onClick={toPdf}
                                className='hide-print'
                            >Print
                            </Button>
                        }
                    </Pdf>
                </Box>
            </Layout>
        </>
    )
}

export default UserInfo