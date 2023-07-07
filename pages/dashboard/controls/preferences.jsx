import React, { useEffect, useState } from "react";
import Layout from "../layout";
import {
  Text,
  Box,
  Switch,
  Button,
  HStack,
  TableContainer,
  Table,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Stack,
  useToast,
} from "@chakra-ui/react";
import BackendAxios, { ClientAxios } from "@/lib/utils/axios";

const Preferences = () => {
  const [globalInfo, setGlobalInfo] = useState({});
  const [defaultRole, setDefaultRole] = useState("");
  const [services, setServices] = useState([]);
  const Toast = useToast({
    position: "top-right",
  });
  const [aepsStatus, setAepsStatus] = useState(false);
  const [bbpsStatus, setBbpsStatus] = useState(false);
  const [dmtStatus, setDmtStatus] = useState(false);
  const [rechargeStatus, setRechargeStatus] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState(false);
  const [panStatus, setPanStatus] = useState(false);
  const [licStatus, setLicStatus] = useState(false);
  const [cmsStatus, setCmsStatus] = useState(false);
  const [fastagStatus, setFastagStatus] = useState(false);
  const [axisStatus, setAxisStatus] = useState(false);
  const [organisationInfo, setOrganisationInfo] = useState({});

  function fetchOrganisationServiceStatus() {
    ClientAxios.get("/api/organisation")
      .then((res) => {
        setAepsStatus(res.data.aeps_status);
        setBbpsStatus(res.data.bbps_status);
        setDmtStatus(res.data.dmt_status);
        setRechargeStatus(res.data.recharge_status);
        setPayoutStatus(res.data.payout_status);
        setPanStatus(res.data.pan_status);
        setLicStatus(res.data.lic_status);
        setCmsStatus(res.data.cms_status);
        setFastagStatus(res.data.fastag_status);
        setAxisStatus(res.data.axis_status);
        setOrganisationInfo(res.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
  function updateOrganisation(data) {
    ClientAxios.post("/api/organisation", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        fetchOrganisationServiceStatus();
        Toast({
          position: "top",
          status: "success",
          title: "Organisation Data updated",
        });
      })
      .catch((err) => {
        Toast({
          status: "error",
          title: "Error while updating",
        });
      });
  }

  useEffect(() => {
    fetchOrganisationServiceStatus();
  }, []);

  function fetchGlobalInfo() {
    ClientAxios.get("/api/global")
      .then((res) => {
        setGlobalInfo(res.data);
        setDefaultRole(res.data.default_role);
        console.log(globalInfo);
      })
      .catch((err) => {
        Toast({
          status: "error",
          title: "Error while fetching global info",
          description: err.message,
        });
      });
  }

  useEffect(() => {
    fetchGlobalInfo();
  }, []);

  function updateGlobalInfo(data) {
    ClientAxios.post("/api/global", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        fetchGlobalInfo();
        Toast({
          status: "success",
          title: "Data Updated",
        });
      })
      .catch((err) => {
        console.log(err.message);
        Toast({
          status: "success",
          title: "Error while updating",
        });
      });
  }

  return (
    <>
      <Layout pageTitle={"Preferences"}>
        <Text fontSize={"lg"} fontWeight={"semibold"}>
          Manage Preferences For Your Portal
        </Text>
        {/* <Stack
                    direction={['column', 'row']}
                    justifyContent={'space-between'}
                    pt={16} pb={8} gap={10}
                >
                    <Box>
                        <Text>Preferred AePS Provider</Text>
                        <HStack p={2} rounded={8}>
                            <Button
                                w={36}
                                colorScheme={
                                    globalInfo.aeps_provider == "eko" ?
                                        "twitter" : "gray"
                                }
                                onClick={() => updateGlobalInfo({ aeps_provider: "eko" })}
                            >Eko</Button>
                            <Button
                                w={36}
                                colorScheme={globalInfo.aeps_provider == "paysprint" ?
                                    "twitter" : "gray"
                                }
                                onClick={() => updateGlobalInfo({ aeps_provider: "paysprint" })}
                            >Paysprint</Button>
                        </HStack>
                    </Box>
                    <Box>
                        <Text>Preferred BBPS Provider</Text>
                        <HStack p={2} rounded={8}>
                            <Button
                                w={36}
                                colorScheme={
                                    globalInfo.bbps_provider == "eko" ?
                                        "twitter" : "gray"
                                }
                                onClick={() => updateGlobalInfo({ bbps_provider: "eko" })}
                            >Eko</Button>
                            <Button
                                w={36}
                                colorScheme={globalInfo.bbps_provider == "paysprint" ?
                                    "twitter" : "gray"
                                }
                                onClick={() => updateGlobalInfo({ bbps_provider: "paysprint" })}
                            >Paysprint</Button>
                        </HStack>
                    </Box>
                    <Box>
                        <Text>Preferred DMT Provider</Text>
                        <HStack p={2} rounded={8}>
                            <Button
                                w={36}
                                colorScheme={
                                    globalInfo.dmt_provider == "eko" ?
                                        "twitter" : "gray"
                                }
                                onClick={() => updateGlobalInfo({ dmt_provider: "eko" })}
                            >Eko</Button>
                            <Button
                                w={36}
                                colorScheme={globalInfo.dmt_provider == "paysprint" ?
                                    "twitter" : "gray"
                                }
                                onClick={() => updateGlobalInfo({ dmt_provider: "paysprint" })}
                            >Paysprint</Button>
                        </HStack>
                    </Box>
                </Stack>
                <Stack
                    direction={['column', 'row']}
                    justifyContent={'space-between'}
                    pt={16} pb={8} gap={10}
                >
                    <Box>
                        <Text>LIC Transaction Type</Text>
                        <HStack p={2} rounded={8}>
                            <Button
                                w={36}
                                colorScheme={
                                    organisationInfo.lic_type == "online" ?
                                        "twitter" : "gray"
                                }
                                onClick={() => updateOrganisation({ lic_type: "online" })}
                            >Online</Button>
                            <Button
                                w={36}
                                colorScheme={organisationInfo.lic_type == "offline" ?
                                    "twitter" : "gray"
                                }
                                onClick={() => updateOrganisation({ lic_type: "offline" })}
                            >Offline</Button>
                        </HStack>
                    </Box>
                </Stack> */}
        <Box mt={8} mb={6}>
          <Text pb={12}>Portal Registration Settings</Text>
          <TableContainer w={"full"}>
            <Table variant={"striped"}>
              <Thead>
                <Tr>
                  <Th>Role</Th>
                  <Th>Allow Signup</Th>
                  <Th>Default</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Retailer</Td>
                  <Td>
                    <Switch
                      id="retailerEnabled"
                      isChecked={globalInfo.retailer}
                      onChange={(e) =>
                        updateGlobalInfo({ retailer: e.target.checked })
                      }
                    ></Switch>
                  </Td>
                  <Td>
                    <Switch
                      isChecked={defaultRole === "retailer"}
                      onChange={(e) =>
                        updateGlobalInfo({ default_role: "retailer" })
                      }
                    ></Switch>
                  </Td>
                </Tr>
                <Tr>
                  <Td>Distributor</Td>
                  <Td>
                    <Switch
                      isChecked={globalInfo.distributor}
                      onChange={(e) =>
                        updateGlobalInfo({ distributor: e.target.checked })
                      }
                    ></Switch>
                  </Td>
                  <Td>
                    <Switch
                      isChecked={defaultRole === "distributor"}
                      onChange={(e) =>
                        updateGlobalInfo({ default_role: "distributor" })
                      }
                    ></Switch>
                  </Td>
                </Tr>
                <Tr>
                  <Td>Super Distributor</Td>
                  <Td>
                    <Switch
                      isChecked={globalInfo.super_distributor}
                      onChange={(e) =>
                        updateGlobalInfo({
                          super_distributor: e.target.checked,
                        })
                      }
                    ></Switch>
                  </Td>
                  <Td>
                    <Switch
                      isChecked={defaultRole === "super_distributor"}
                      onChange={(e) =>
                        updateGlobalInfo({ default_role: "super_distributor" })
                      }
                    ></Switch>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
        <Box mt={16}>
          <Text pb={8}>Manage Services Status</Text>
          <TableContainer>
            <Table variant={"striped"}>
              <Thead>
                <Tr>
                  <Th>Service Name</Th>
                  <Th>Provider</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody textTransform={"capitalize"}>
                {/* <Tr>
                                    <Td>AePS Services</Td>
                                    <Td>{globalInfo.aeps_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'aepsStatus'} isChecked={aepsStatus}
                                            onChange={(e) => updateOrganisation({ aeps_status: e.target.checked })} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>BBPS Services</Td>
                                    <Td>{globalInfo.bbps_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'bbpsStatus'} isChecked={bbpsStatus}
                                            onChange={(e) => updateOrganisation({ bbps_status: e.target.checked })} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>DMT Services</Td>
                                    <Td>{globalInfo.dmt_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'dmtStatus'} isChecked={dmtStatus}
                                            onChange={(e) => updateOrganisation({ dmt_status: e.target.checked })} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>Recharge Services</Td>
                                    <Td>{globalInfo.recharge_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'rechargeStatus'} isChecked={rechargeStatus}
                                            onChange={(e) => updateOrganisation({ recharge_status: e.target.checked })} />
                                    </Td>
                                </Tr> */}
                <Tr>
                  <Td>Payout Services</Td>
                  <Td>{globalInfo.payout_provider || "paysprint"}</Td>
                  <Td>
                    <Switch
                      id={"payoutStatus"}
                      isChecked={payoutStatus}
                      onChange={(e) =>
                        updateOrganisation({ payout_status: e.target.checked })
                      }
                    />
                  </Td>
                </Tr>
                {/* <Tr>
                                    <Td>PAN Services</Td>
                                    <Td>{globalInfo.pan_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'panStatus'} isChecked={panStatus}
                                            onChange={(e) => updateOrganisation({ pan_status: e.target.checked })} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>LIC Services</Td>
                                    <Td>{globalInfo.lic_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'licStatus'} isChecked={licStatus}
                                            onChange={(e) => updateOrganisation({ lic_status: e.target.checked })} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>CMS Services</Td>
                                    <Td>{globalInfo.cms_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'cmsStatus'} isChecked={cmsStatus}
                                            onChange={(e) => updateOrganisation({ cms_status: e.target.checked })} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>Axis Bank Services</Td>
                                    <Td>{globalInfo.axis_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'axisStatus'} isChecked={axisStatus}
                                            onChange={(e) => updateOrganisation({ axis_status: e.target.checked })} />
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>Fastag Services</Td>
                                    <Td>{globalInfo.fastag_provider || "paysprint"}</Td>
                                    <Td>
                                        <Switch
                                            id={'fastagStatus'} isChecked={fastagStatus}
                                            onChange={(e) => updateOrganisation({ fastag_status: e.target.checked })} />
                                    </Td>
                                </Tr> */}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Layout>
    </>
  );
};

export default Preferences;
