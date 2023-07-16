import React from 'react'
import { VStack, Box, Text, HStack, Show } from '@chakra-ui/react'
import Link from "next/link"
import { FaUserSecret } from 'react-icons/fa'

const DataCard = ({ title, data, icon, color }) => {
  return (
    <>
      <HStack
        mb={[6, 0]}
        spacing={4}
        rounded={4}
        minW={['46%', '52']}
        p={3} bg={'white'}
        boxShadow={'md'}
        transition={'.3s ease'}
        borderRightWidth={`8px`}
        borderRightColor={`${color}`}
        _hover={{bg: color, color: '#FFF'}}
      >
        <Show above='md'>
          <Box bg={`#FFF`}
            boxSize={[8, 14]}
            rounded={'inherit'}
            display={'grid'}
            placeContent={'center'}
          >
            {icon}
          </Box>
        </Show>
        <VStack alignItems={'flex-start'} justifyContent={'space-between'} spacing={0}>
          <Text fontSize={'10'}>{title}</Text>
          <Text fontSize={'28'} fontWeight={'semibold'}>{Number(data)?.toFixed(2) || 0}</Text>
        </VStack>
      </HStack>
    </>
  )
}

export const TransactionCard = ({ title, color, amount, quantity, showRupee }) => {
  return (
    <>
      <Box
        p={4} rounded={12}
        // minW={['full', '72']}
        flex={1}
        boxShadow={'md'}
        bg={'white'}
      >
        <Text w={'fit-content'} px={2} rounded={'full'} bg={color} color={'white'}>{title}</Text>
        <HStack pt={4} justifyContent={'space-between'}>
          <VStack w={'full'} alignItems={'flex-start'} pr={2} borderRight={'1px'} borderRightColor={'#999'}>
            <Text fontSize={'xs'} color={'#666'}>Amount</Text>
            <Text fontSize={'xl'} color={'#333'}>{showRupee ? '₹' : null} {amount}</Text>
          </VStack>
          <VStack w={'full'} alignItems={'flex-start'} pl={2}>
            <Text fontSize={'xs'} color={'#666'}>Transactions</Text>
            <Text fontSize={'xl'} color={'#333'}>{quantity}</Text>
          </VStack>
        </HStack>
      </Box>
    </>
  )
}


export const ServiceCard = ({ text, url }) => {
  return (
    <>
      <Link href={url}>
        <Box
          my={2} mr={4} ml={0} p={4}
          bg={'white'}
          boxShadow={'base'}
          rounded={16}
          w={['full', '56']}
          transitionDuration={'.3s'}
          transitionTimingFunction={'ease'}
          _hover={{ bg: '#1da1f2', color: 'white' }}
        >
          <FaUserSecret fontSize={'2rem'} /><br />
          <Text fontWeight={'medium'} textTransform={'capitalize'}>{text}</Text>
        </Box>
      </Link>
    </>
  )
}


export default DataCard