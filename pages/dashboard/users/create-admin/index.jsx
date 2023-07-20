import React, { useState, useEffect } from "react";
import Layout from "../../layout";
import {
  Box,
  useToast,
  Stack,
  Text,
  VStack,
  HStack,
  Button,
  InputGroup,
  InputRightAddon,
  Input,
  FormControl,
  FormLabel,
  Flex,
  CheckboxGroup,
  Checkbox,
} from "@chakra-ui/react";
import BackendAxios from "@/lib/utils/axios";
import { useFormik } from "formik";
import { BiCheck } from "react-icons/bi";
import Cookies from "js-cookie";
import { Switch } from "@chakra-ui/react";

const CreateAdmin = () => {
  const Toast = useToast({
    position: "top-right",
  });
  const [allAdmins, setAllAdmins] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [fetchedUser, setFetchedUser] = useState({
    user_id: "",
    user_name: "",
    firm_name: "",
    wallet: "",
    phone: "",
    role: "",
    permissions: [],
  });
  const [predefinedPermissions, setPredefinedPermissions] = useState([
    {
      id: "create-user",
      value: "create-user",
    },
    {
      id: "view-user",
      value: "view-user",
    },
    {
      id: "update-user",
      value: "update-user",
    },
    {
      id: "manage-admin",
      value: "manage-admin",
    },
    {
      id: "edit-fund-request",
      value: "edit-fund-request",
    },
    {
      id: "view-fund-request",
      value: "view-fund-request",
    },
    {
      id: "create-fund-transfer",
      value: "create-fund-transfer",
    },
    {
      id: "view-fund-transfer",
      value: "view-fund-transfer",
    },
    {
      id: "edit-fund-transfer",
      value: "edit-fund-transfer",
    },
    {
      id: "delete-fund-request",
      value: "delete-fund-request",
    },
    {
      id: "view-payout-report",
      value: "view-payout-report",
    },
    {
      id: "view-transaction-ledger",
      value: "view-transaction-ledger",
    },
    {
      id: "view-daily-sales",
      value: "view-daily-sales",
    },
    {
      id: "view-user-ledger",
      value: "view-user-ledger",
    },
    {
      id: "view-login-report",
      value: "view-login-report",
    },
    {
      id: "view-support-tickets",
      value: "view-support-tickets",
    },
    {
      id: "edit-support-tickets",
      value: "edit-support-tickets",
    },
    {
      id: "block-admin",
      value: "block-employee",
    },
  ]);

  const verifyBeneficiary = (userId) => {
    // Logic to verifiy beneficiary details
    BackendAxios.post(`/api/admin/user/info/${userId || fetchedUser.user_id}`)
      .then((res) => {
        setFetchedUser({
          ...fetchedUser,
          user_name: "",
          firm_name: "",
          wallet: "",
          phone: "",
          role: "",
          permissions: [],
        });

        setFetchedUser({
          ...fetchedUser,
          user_id: res.data?.data?.id,
          user_name: res.data.data.first_name + " " + res.data.data.last_name,
          firm_name: res.data.data.firm_name,
          phone: res.data.data.phone_number,
          wallet: res.data.data.wallet,
          role: res.data.data.roles[0].name,
          permissions: res.data.data.permissions.map((permission) => {
            return permission.name;
          }),
        });
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        Toast({
          status: "error",
          description: err.message,
        });
        setFetchedUser({
          ...fetchedUser,
          user_name: "",
          firm_name: "",
          wallet: "",
          phone: "",
          role: "",
          permissions: [],
        });
      });
  };

  useEffect(() => {
    BackendAxios.get("/api/admin/all-permissions")
      .then((res) => {
        setPredefinedPermissions();
        setPredefinedPermissions(
          res.data.map((permission) => {
            return {
              id: permission.id,
              value: permission.name,
            };
          })
        );
      })
      .catch((err) => {
        console.log(err);
        Toast({
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }, []);

  function saveUserPermissions() {
    BackendAxios.post("/api/admin/assign-permission", {
      userId: fetchedUser.user_id,
      permission: permissions,
    })
      .then((res) => {
        Toast({
          status: "success",
          description: "User details updated successfully!",
        });
      })
      .catch((err) => {
        Toast({
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }

  function changeRole(role, userId) {
    BackendAxios.post("/api/admin/new-admin", {
      userId: userId || fetchedUser.user_id,
      role: role,
    })
      .then((res) => {
        getAllAdmins();
        Toast({
          status: "success",
          description: `User is now ${role}!`,
        });
        verifyBeneficiary(fetchedUser.user_id);
      })
      .catch((err) => {
        Toast({
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }

  function getAllAdmins() {
    BackendAxios.get(`/api/admin/users-list/admin?page=1`)
      .then((res) => {
        setAllAdmins(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function sendCredentials(userEmail, name) {
    BackendAxios.post(`/admin-send-creds`, {
      email: userEmail,
      name: name,
    })
      .then((res) => {
        Toast({
          status: "success",
          description: "Credentials Sent!",
        });
      })
      .catch((err) => {
        Toast({
          status: "error",
          title: "Error while sending credentials",
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }

  async function blockAdmin(adminId, status) {
    await BackendAxios.get(`/api/admin/block-admin/${adminId}/${status}`)
      .then((res) => {
        Toast({
          status: "success",
          description: "Status updated!",
        });
      })
      .catch((err) => {
        Toast({
          status: "error",
          title: "Error while sending credentials",
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
    getAllAdmins();
  }

  useEffect(() => {
    getAllAdmins();
  }, []);

  return (
    <>
      <Layout pageTitle={"Create Admin"}>
        <Stack
          direction={["column", "row"]}
          gap={8}
          justifyContent={"space-between"}
        >
          <Box p={4} flex={["unset", 2]}>
            <Text fontSize={"lg"} fontWeight={"semibold"} my={4}>
              Manage Admin Members
            </Text>
            <Stack direction={["column", "row"]} spacing={6} py={6}>
              <FormControl w={["full", "xs"]}>
                <FormLabel>User ID</FormLabel>
                <InputGroup>
                  <Input
                    name={"userId"}
                    onChange={(e) =>
                      setFetchedUser({
                        ...fetchedUser,
                        user_id: e.target.value,
                      })
                    }
                    placeholder={"Enter User ID"}
                  />
                  <InputRightAddon
                    children={"Verify"}
                    cursor={"pointer"}
                    onClick={() => verifyBeneficiary()}
                  />
                </InputGroup>
              </FormControl>
            </Stack>
            {fetchedUser.user_name ? (
              <Stack
                p={4}
                bg={"blue.50"}
                border={"1px"}
                w={"max-content"}
                borderColor={"blue.200"}
                rounded={16}
                my={4}
                direction={["column", "row"]}
                spacing={16}
                justifyContent={"space-between"}
                textTransform={"capitalize"}
              >
                <Box>
                  <Text fontWeight={"medium"}>Beneficiary Name</Text>
                  <Text>{fetchedUser.user_name}</Text>
                </Box>
                <Box>
                  <Text fontWeight={"medium"}>Firm Name</Text>
                  <Text>{fetchedUser.firm_name}</Text>
                </Box>
                <Box>
                  <Text fontWeight={"medium"}>Current Balance</Text>
                  <Text>₹ {fetchedUser.wallet}</Text>
                </Box>
                <Box>
                  <Text fontWeight={"medium"}>Phone</Text>
                  <Text>{fetchedUser.phone}</Text>
                </Box>
              </Stack>
            ) : null}

            {fetchedUser.role == "admin" ? (
              <Box my={4}>
                <Button
                  colorScheme={"whatsapp"}
                  mb={6}
                  onClick={() => changeRole("retailer")}
                >
                  Make Retailer
                </Button>

                <Text py={8} pb={4} fontSize={"lg"} fontWeight={"semibold"}>
                  Manage Permissions
                </Text>
                <Text pt={4} fontSize={"sm"}>
                  Basic Permissions
                </Text>
                <Flex
                  direction={"row"}
                  gap={4}
                  justifyContent={"flex-start"}
                  flexWrap={"wrap"}
                  pb={4}
                >
                  <CheckboxGroup
                    onChange={(values) => setPermissions(values)}
                    defaultValue={fetchedUser.permissions}
                  >
                    {predefinedPermissions.map((permission, key) => {
                      if (permission.value.includes("basic"))
                        return (
                          <Checkbox
                            w={["full", "xs"]}
                            value={permission.value}
                            textTransform={"capitalize"}
                            key={key}
                            py={1}
                            rounded={8}
                          >
                            {permission.value.replace(/-/g, " ")}
                          </Checkbox>
                        );
                    })}
                  </CheckboxGroup>
                </Flex>
                <hr />
                <Text pt={4} fontSize={"sm"}>
                  User Related Permissions
                </Text>
                <Flex
                  direction={"row"}
                  gap={4}
                  justifyContent={"flex-start"}
                  flexWrap={"wrap"}
                  pb={4}
                >
                  <CheckboxGroup
                    onChange={(values) => setPermissions(values)}
                    defaultValue={fetchedUser.permissions}
                  >
                    {predefinedPermissions.map((permission, key) => {
                      if (
                        permission.value.includes("user") ||
                        permission.value.includes("role-parent") ||
                        permission.value == "block-employee"
                      )
                        return (
                          <Checkbox
                            w={["full", "xs"]}
                            value={permission.value}
                            textTransform={"capitalize"}
                            key={key}
                            py={1}
                            rounded={8}
                          >
                            {permission.value.replace(/-/g, " ")}
                          </Checkbox>
                        );
                    })}
                  </CheckboxGroup>
                </Flex>
                <hr />
                <Text pt={8} pb={4} fontSize={"sm"}>
                  Reports Related Permissions
                </Text>
                <Flex
                  direction={"row"}
                  gap={4}
                  justifyContent={"flex-start"}
                  flexWrap={"wrap"}
                  pb={4}
                >
                  <CheckboxGroup
                    onChange={(values) => setPermissions(values)}
                    defaultValue={fetchedUser.permissions}
                  >
                    {predefinedPermissions.map((permission, key) => {
                      if (
                        permission.value.includes("report") ||
                        permission.value.includes("sale") ||
                        permission.value.includes("transaction")
                      )
                        return (
                          <Checkbox
                            w={["full", "xs"]}
                            value={permission.value}
                            textTransform={"capitalize"}
                            key={key}
                            py={1}
                            rounded={8}
                          >
                            {permission.value.replace(/-/g, " ")}
                          </Checkbox>
                        );
                    })}
                  </CheckboxGroup>
                </Flex>
                <hr />
                <Text pt={8} pb={4} fontSize={"sm"}>
                  Account Related Permissions
                </Text>
                <Flex
                  direction={"row"}
                  gap={4}
                  justifyContent={"flex-start"}
                  flexWrap={"wrap"}
                  pb={4}
                >
                  <CheckboxGroup
                    onChange={(values) => setPermissions(values)}
                    defaultValue={fetchedUser.permissions}
                  >
                    {predefinedPermissions.map((permission, key) => {
                      if (
                        permission.value.includes("fund") ||
                        permission.value.includes("account")
                      )
                        return (
                          <Checkbox
                            w={["full", "xs"]}
                            value={permission.value}
                            textTransform={"capitalize"}
                            key={key}
                            py={1}
                            rounded={8}
                          >
                            {permission.value.replace(/-/g, " ")}
                          </Checkbox>
                        );
                    })}
                  </CheckboxGroup>
                </Flex>
                <hr />
                <Text pt={8} pb={4} fontSize={"sm"}>
                  Portal Management Permissions
                </Text>
                <Flex
                  direction={"row"}
                  gap={4}
                  justifyContent={"flex-start"}
                  flexWrap={"wrap"}
                  pb={4}
                >
                  <CheckboxGroup
                    onChange={(values) => setPermissions(values)}
                    defaultValue={fetchedUser.permissions}
                  >
                    {predefinedPermissions.map((permission, key) => {
                      if (!permission.value.includes("admin")) {
                        if (
                          permission.value.includes("manage") ||
                          permission.value.includes("preference")
                        )
                          return (
                            <Checkbox
                              w={["full", "xs"]}
                              value={permission.value}
                              textTransform={"capitalize"}
                              key={key}
                              py={1}
                              rounded={8}
                            >
                              {permission.value.replace(/-/g, " ")}
                            </Checkbox>
                          );
                      }
                    })}
                  </CheckboxGroup>
                </Flex>
                <hr />
                <Text pt={8} pb={4} fontSize={"sm"}>
                  Other Permissions
                </Text>
                <Flex
                  direction={"row"}
                  gap={4}
                  justifyContent={"flex-start"}
                  flexWrap={"wrap"}
                  pb={4}
                >
                  <CheckboxGroup
                    onChange={(values) => setPermissions(values)}
                    defaultValue={fetchedUser.permissions}
                  >
                    {predefinedPermissions.map((permission, key) => {
                      if (!permission.value.includes("admin")) {
                        if (
                          !permission.value.includes("manage") &&
                          !permission.value.includes("preference") &&
                          !permission.value.includes("fund") &&
                          !permission.value.includes("user") &&
                          !permission.value.includes("report") &&
                          !permission.value.includes("sale") &&
                          !permission.value.includes("transaction") &&
                          !permission.value.includes("account") &&
                          !permission.value.includes("basic")
                        )
                          return (
                            <Checkbox
                              w={["full", "xs"]}
                              value={permission.value}
                              textTransform={"capitalize"}
                              key={key}
                              py={1}
                              rounded={8}
                            >
                              {permission.value.replace(/-/g, " ")}
                            </Checkbox>
                          );
                      }
                    })}
                  </CheckboxGroup>
                </Flex>
                <Button
                  mt={8}
                  colorScheme={"twitter"}
                  leftIcon={<BiCheck fontSize={20} />}
                  onClick={saveUserPermissions}
                >
                  Save Permissions
                </Button>
              </Box>
            ) : fetchedUser.role == "retailer" ? (
              <Button
                colorScheme={"twitter"}
                onClick={() => changeRole("admin")}
              >
                Make Admin
              </Button>
            ) : null}
          </Box>

          <VStack
            w={["full", "xs"]}
            padding={4}
            pos={"relative"}
            flex={["unset", 1]}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
            h={["auto", "100vh"]}
            overflowY={"scroll"}
          >
            <Box position={["relative", "static"]} top={0}>
              <Text fontSize={"lg"} fontWeight={"semibold"} my={4}>
                Existing Admin Employees
              </Text>

              <VStack
                gap={8}
                pt={8}
                alignItems={"flex-start"}
                justifyContent={"flex-start"}
              >
                {allAdmins.map((admin, key) => (
                  <Box p={4} rounded={8} boxShadow={"md"} key={key}>
                    <Text fontSize={"md"} fontWeight={"semibold"}>
                      {admin.name} ({admin.id})
                    </Text>
                    <Text fontSize={"md"}>{admin.phone_number}</Text>
                    <Text fontSize={"xs"}>{admin.email}</Text>
                    <br />
                    <HStack justifyContent={"space-between"} w={"full"} pt={4}>
                      <HStack>
                        <Text fontSize={"sm"}>Status</Text>
                        <Switch
                          size={"sm"}
                          isChecked={admin?.is_active}
                          onChange={(e) =>
                            blockAdmin(admin.id, e.target.checked ? 1 : 0)
                          }
                        />
                      </HStack>
                      <Button
                        size={"xs"}
                        colorScheme="blue"
                        onClick={() =>
                          sendCredentials(admin?.email, admin?.name)
                        }
                      >
                        Send Credentials
                      </Button>
                    </HStack>
                    <HStack w={"full"} pt={4} justifyContent={"space-between"}>
                      <Button
                        size={"sm"}
                        onClick={() => {
                          setFetchedUser({ user_id: admin.id });
                          verifyBeneficiary(admin.id);
                        }}
                      >
                        Permissions
                      </Button>
                      <Button
                        colorScheme="red"
                        size={"sm"}
                        onClick={() => {
                          setFetchedUser({ user_id: admin.id });
                          changeRole("retailer", admin.id);
                        }}
                      >
                        Make Retailer
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </Stack>
      </Layout>
    </>
  );
};

export default CreateAdmin;
