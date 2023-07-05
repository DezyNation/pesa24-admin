import React, { useState, useEffect } from "react";
import {
  HStack,
  Box,
  Stack,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  PinInput,
  PinInputField,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Formik, useFormik } from "formik";
import Layout from "../layout";
import BackendAxios from "@/lib/utils/axios";
import { useDisclosure } from "@chakra-ui/react";
import { Modal } from "@chakra-ui/react";
import { ModalOverlay } from "@chakra-ui/react";
import { ModalContent } from "@chakra-ui/react";
import { ModalHeader } from "@chakra-ui/react";
import { ModalBody } from "@chakra-ui/react";
import { ModalFooter } from "@chakra-ui/react";
import Cookies from "js-cookie";

const ResetMpin = () => {
  const { isOpen, onToggle } = useDisclosure();
  const Toast = useToast({
    position: "top-right",
  });
  const MpinFormik = useFormik({
    initialValues: {
      old_mpin: "",
      new_mpin: "",
      new_mpin_confirmation: "",
      otp: "",
    },
  });

  function handleMpinReset() {
    BackendAxios.post(
      "/api/user/new-mpin",
      JSON.stringify({
        old_mpin: MpinFormik.values.old_mpin,
        new_mpin: MpinFormik.values.new_mpin,
        new_mpin_confirmation: MpinFormik.values.new_mpin_confirmation,
        otp: MpinFormik.values.otp,
      })
    )
      .then((res) => {
        onToggle();
        Toast({
          status: "success",
          title: "Success",
          description: "Your MPIN was changed succesfully.",
        });
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        onToggle();
        Toast({
          status: "error",
          title: "Error Occured",
          description: err?.response?.data?.message || err?.response?.data || err?.message,
        });
      });
  }

  function sendOtp(){
    BackendAxios.post("/password/send-otp").then(res => {
        onToggle()
        Toast({
            status: 'success',
            description: 'OTP Sent To Your Phone',
        })
    }).catch(err => {
        Toast({
            status: 'error',
            description: err?.response?.data?.message || err?.response?.data || err?.message,
        })
    })
  }

  return (
    <>
      <Layout pageTitle={"Reset MPIN"}>
        <VStack w={"full"} justifyContent={"center"}>
          <Box
            bg={"white"}
            boxShadow={"md"}
            p={6}
            w={["full", "sm"]}
            rounded={16}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Text fontSize={"lg"} mb={12}>
              Reset Your MPIN
            </Text>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel textAlign={"center"} fontSize={12}>
                  Enter Old MPIN
                </FormLabel>
                <HStack spacing={6} justifyContent={"center"}>
                  <PinInput
                    size={"sm"}
                    otp
                    onChange={(value) =>
                      MpinFormik.setFieldValue("old_mpin", value)
                    }
                  >
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                  </PinInput>
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel textAlign={"center"} fontSize={12}>
                  Enter New MPIN
                </FormLabel>
                <HStack spacing={6} justifyContent={"center"}>
                  <PinInput
                    size={"sm"}
                    otp
                    mask
                    onChange={(value) =>
                      MpinFormik.setFieldValue("new_mpin", value)
                    }
                  >
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                  </PinInput>
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel textAlign={"center"} fontSize={12}>
                  Verify New MPIN
                </FormLabel>
                <HStack spacing={6} justifyContent={"center"}>
                  <PinInput
                    size={"sm"}
                    otp
                    onChange={(value) =>
                      MpinFormik.setFieldValue("new_mpin_confirmation", value)
                    }
                  >
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                    <PinInputField bg={"aqua"} />
                  </PinInput>
                </HStack>
              </FormControl>
              <Button colorScheme={"twitter"} onClick={sendOtp}>
                Done
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Layout>

      <Modal isOpen={isOpen} onClose={onToggle} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={"center"}>
            Enter OTP Sent To Your Phone
          </ModalHeader>
          <ModalBody>
            <HStack justifyContent={"center"}>
              <PinInput
                otp
                onComplete={(value) => MpinFormik.setFieldValue("otp", value)}
              >
                <PinInputField bg={"aqua"} />
                <PinInputField bg={"aqua"} />
                <PinInputField bg={"aqua"} />
                <PinInputField bg={"aqua"} />
              </PinInput>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <HStack justifyContent={"flex-end"}>
              <Button colorScheme="twitter" onClick={handleMpinReset}>Submit</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ResetMpin;
