import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import Layout from "../layout";
import BackendAxios from "@/lib/utils/axios";
import { Modal } from "@chakra-ui/react";
import { ModalOverlay } from "@chakra-ui/react";
import { ModalContent } from "@chakra-ui/react";
import { ModalHeader } from "@chakra-ui/react";
import { ModalBody } from "@chakra-ui/react";
import { PinInput } from "@chakra-ui/react";
import { PinInputField } from "@chakra-ui/react";
import { HStack } from "@chakra-ui/react";
import { ModalFooter } from "@chakra-ui/react";
import Cookies from "js-cookie";

const ResetPassword = () => {
  const Toast = useToast({
    position: "top-right",
  });
  const [lastRemarks, setLastRemarks] = useState("");
  const { isOpen, onToggle } = useDisclosure();

  const PasswordFormik = useFormik({
    initialValues: {
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
      otp: "",
    },
  });

  function handlePasswordReset() {
    BackendAxios.post("/api/user/new-password", {
      old_password: PasswordFormik.values.old_password,
      new_password: PasswordFormik.values.new_password,
      new_password_confirmation: PasswordFormik.values.new_password_confirmation,
      otp: PasswordFormik.values.otp,
    })
      .then((res) => {
        Toast({
          status: "success",
          title: "Success",
          description: "Your password was changed succesfully.",
        });
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        Toast({
          status: "error",
          title: "Error Occured",
          description: err?.response?.data?.message || err?.response?.data || err?.message,
        });
      });
  }

  function sendOtp() {
    BackendAxios.post("/password/send-otp")
      .then((res) => {
        onToggle();
        Toast({
          status: "success",
          description: "OTP Sent To Your Phone",
        });
      })
      .catch((err) => {
        Toast({
          status: "error",
          description:
            err?.response?.data?.message || err?.response?.data || err?.message,
        });
      });
  }

  return (
    <>
      <Layout pageTitle={"Reset Password"}>
        <Box
          bg={"white"}
          boxShadow={"md"}
          p={4}
          w={["full", "sm"]}
          rounded={16}
          mx={"auto"}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Text fontSize={"lg"} mb={12}>
            Reset Your Password
          </Text>
          <VStack spacing={8}>
            <FormControl>
              <FormLabel textAlign={"center"} fontSize={12}>
                Enter Old Passwod
              </FormLabel>
              <Input
                name={"old_password"}
                placeholder={"Enter Old Passwod"}
                onChange={PasswordFormik.handleChange}
                bg={"aqua"}
              />
            </FormControl>
            <FormControl>
              <FormLabel textAlign={"center"} fontSize={12}>
                Enter New Password
              </FormLabel>
              <Input
                name={"new_password"}
                type={"password"}
                placeholder={"Enter New Password"}
                onChange={PasswordFormik.handleChange}
                bg={"aqua"}
              />
            </FormControl>
            <FormControl>
              <FormLabel textAlign={"center"} fontSize={12}>
                Confirm New Password
              </FormLabel>
              <Input
                name={"new_password_confirmation"}
                placeholder={"Confirm New Password"}
                onChange={PasswordFormik.handleChange}
                bg={"aqua"}
              />
            </FormControl>
            <Button colorScheme={"twitter"} onClick={sendOtp}>
              Done
            </Button>
          </VStack>
        </Box>
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
                onComplete={(value) => PasswordFormik.setFieldValue("otp", value)}
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
              <Button colorScheme="twitter" onClick={handlePasswordReset}>
                Submit
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ResetPassword;
