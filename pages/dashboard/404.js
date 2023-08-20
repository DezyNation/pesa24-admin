import React from 'react'
import Layout from './layout'
import { VStack, Text } from '@chakra-ui/react'

const NotFound = () => {
  return (
    <>
        <Layout pageTitle={'Not Found'}>
            <VStack justifyContent={'center'} alignItems={'center'}>
                <Text>This page is still under development.</Text>
            </VStack>
        </Layout>
    </>
  )
}

export default NotFound