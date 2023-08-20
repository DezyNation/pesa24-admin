import Head from "next/head";
import React, { useState, useEffect } from 'react'
import {
  HStack,
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightAddon,
  Input,
  PinInput,
  PinInputField,
  Button,
  Text,
  useToast,
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react'
import { BsEyeSlash, BsEye } from 'react-icons/bs'
import { useFormik } from "formik";
import Link from "next/link";
import axios from "axios";
import Cookies from 'js-cookie'
var bcrypt = require('bcryptjs')
import { useRouter } from 'next/router'
import BackendAxios, { FormAxios } from "@/lib/utils/axios";

const Auth = () => {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [otpBeingSent, setOtpBeingSent] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasGps, setHasGps] = useState(true)
  const [authMethod, setAuthMethod] = useState("email")

  const Toast = useToast({
    position: 'top-right'
  })
  const Router = useRouter()


  const formik = useFormik({
    initialValues: {
      user_id: "",
      password: "",
      otp: "",
    }
  })

  function sendOtp() {
    setOtpBeingSent(true)
    if (formik.values.user_id && formik.values.password) {
      axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send-otp`, {
        authMethod: authMethod,
        ...(authMethod === "email" && { "email": formik.values.user_id }),
        ...(authMethod === "phone" && { "phone_number": formik.values.user_id }),
        password: formik.values.password,
      }, {
        withCredentials: true,
        headers: {
          "X-XSRF-TOKEN": Cookies.get("XSRF-TOKEN"),
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
      }).then((res) => {
        if (res.status == 200) {
          Toast({
            status: "success",
            title: "OTP Sent!",
            description: "An OTP has been sent to your registered email",
            position: "top-right"
          })
          setOtpBeingSent(false)
          setIsOtpSent(true)
        }
      }).catch((err) => {
        Toast({
          status: "error",
          title: "Error Occured",
          description: err.response?.data?.message || err.response?.data || err.message,
          position: "top-right"
        })
        setOtpBeingSent(false)
        setIsOtpSent(false)
      })
    }
    else {
      Toast({
        description: "Email and password can't be blank.",
        position: "top-right"
      })
    }
  }


  useEffect(() => {
    getLocation()
  }, [])

  // Getting user location
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        Cookies.set("latlong", position.coords.latitude + "," + position.coords.longitude)
      })
      setHasGps(true)
    } else {
      Toast({
        status: "error",
        title: "Location Error",
        description: "No GPS detected. Try logging in with another device."
      })
      setHasGps(false)
    }
  }

  useEffect(() => {
    if (isNaN(formik.values.user_id)) {
      setAuthMethod("email")
    }
    else {
      setAuthMethod("phone")
    }
  }, [formik.values.user_id])

  // Handle login after OTP submission
  async function handleLogin() {
    setIsLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/login`, JSON.stringify({
        "authMethod": authMethod,
        ...(authMethod === "email" && { "email": formik.values.user_id }),
        ...(authMethod === "phone" && { "phone_number": formik.values.user_id }),
        "otp": formik.values.otp,
        "password": formik.values.password,
        "remember": 1,
        "latlong": Cookies.get("latlong"),
        "organization_code": process.env.NEXT_PUBLIC_ORGANISATION,
      }), {
        withCredentials: true,
        headers: {
          "X-XSRF-TOKEN": Cookies.get("XSRF-TOKEN"),
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
      }).then((res) => {
        var hashedValue = bcrypt.hashSync(`${res.data.id + process.env.NEXT_PUBLIC_SALT + res.data.name}`, 2)
        Cookies.set("verified", hashedValue)
        localStorage.setItem("userId", res.data.id)
        Cookies.set("userId", res.data.id)
        localStorage.setItem("userName", res.data.name)
        Cookies.set("userName", res.data.name)
        localStorage.setItem("userType", res.data.role[0].name)

        localStorage.setItem("profilePic", `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${res.data.profile_pic}`)
        BackendAxios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token.original.access_token}`
        FormAxios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token.original.access_token}`
        Cookies.set('access-token', res.data.token.original.access_token)
        if (res.data.profile_complete == 0) localStorage.setItem("isProfileComplete", false)
        if (res.data.profile_complete == 1) localStorage.setItem("isProfileComplete", true)
      })
      Router.push("/dashboard?pageid=dashboard")

    } catch (error) {
      Toast({
        status: "error",
        title: "Error Occured",
        description: error.response.data.message || error.response.data || error.message,
        isClosable: true,
        duration: 3000,
        position: "top-right"
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head><title>PESA24 - Admin Panel</title></Head>
      <VStack p={4}>
        <Text fontSize={'2xl'} fontWeight={'semibold'} mb={6}>PESA24 Admin Login</Text>
        <VStack
          p={4} bg={'blue.50'}
          border={'1px'}
          borderColor={'blue.200'}
          w={['full', 'sm']}
          rounded={16} spacing={8}
        >
          <FormControl>
            <FormLabel>User ID</FormLabel>
            <Input
              placeholder="Enter User ID"
              bg={'white'} name={"user_id"}
              onChange={formik.handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input type={passwordVisible ? "text" : "password"} placeholder={'Enter Password'} bg={'white'} name={"password"} onChange={formik.handleChange} />
              <InputRightAddon children={passwordVisible ? <BsEye /> : <BsEyeSlash />} cursor={'pointer'} onClick={() => setPasswordVisible(!passwordVisible)} />
            </InputGroup>
          </FormControl>
          {/*  */}
          <HStack spacing={4}>
            <Link href={'https://dashboard.pesa24.in/auth/reset-password'}>
              <Button colorScheme={'twitter'} variant={'outline'}>Reset Password</Button>
            </Link>
            <Button colorScheme={'twitter'} onClick={() => sendOtp()} isDisabled={!hasGps} isLoading={otpBeingSent}>Send OTP</Button>
          </HStack>
        </VStack>
      </VStack>

      {/* OTP Modal */}
      <Modal
        isOpen={isOtpSent}
        onClose={() => setIsOtpSent(false)}
        isCentered={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Text>
              Enter OTP
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack>
              <HStack spacing={4}>
                <PinInput otp onComplete={(values) => formik.setFieldValue("otp", values)}>
                  <PinInputField bg={'aqua'} />
                  <PinInputField bg={'aqua'} />
                  <PinInputField bg={'aqua'} />
                  <PinInputField bg={'aqua'} />
                </PinInput>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme={'twitter'}
              variant={'outline'}
              isLoading={otpBeingSent}
              onClick={() => sendOtp()}
            >
              Resend OTP
            </Button>
            <Button
              colorScheme={'twitter'}
              ml={4} isLoading={isLoading}
              onClick={() => handleLogin()}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  )
}

export default Auth