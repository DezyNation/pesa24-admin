import React, { useState, useEffect } from "react";
import Layout from "./layout";
import {
  Box,
  Stack,
  HStack,
  Select,
  Text,
  VStack,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
} from "@chakra-ui/react";
import DataCard, { TransactionCard } from "@/HOC/DataCard";
import { FaUserAlt, FaUserPlus } from "react-icons/fa";
import { BiLogIn, BiRupee } from "react-icons/bi";
import { IoMdHelpBuoy } from "react-icons/io";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import BackendAxios from "@/lib/utils/axios";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import Link from "next/link";
import Cookies from "js-cookie";
Chart.register(ArcElement, Tooltip, Legend);

const Index = () => {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    {
      field: "user_id",
      headerName: "User ID",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
    },
    {
      field: "ip",
      headerName: "Login IP",
      minWidth: 300,
    },
    {
      field: "latlong",
      headerName: "Latlong",
      minWidth: 300,
    },
    {
      field: "created_at",
      headerName: "Timestamp",
    },
  ]);

  const [aepsData, setAepsData] = useState({});
  const [bbpsData, setBbpsData] = useState({});
  const [dmtData, setDmtData] = useState({});
  const [panData, setPanData] = useState({});
  const [payoutData, setPayoutData] = useState({});
  const [payoutDetails, setPayoutDetails] = useState({});
  const [licData, setLicData] = useState({});
  const [fastagData, setFastagData] = useState({});
  const [cmsData, setCmsData] = useState({});
  const [rechargeData, setRechargeData] = useState({});
  const [fundRequestsData, setFundRequestsData] = useState({});
  const [usersData, setUsersData] = useState({});

  const [retailers, setRetailers] = useState("");
  const [distributors, setDistributors] = useState("");
  const [superDistributors, setSuperDistributors] = useState("");

  const [pendingRequests, setPendingRequests] = useState({});
  const [wallets, setWallets] = useState({
    retailer: "",
    distributor: "",
    superDistributor: "",
  });
  const [balance, setBalance] = useState({
    marketBalance: "",
    capBalance: "",
  });

  useEffect(() => {
    BackendAxios.get("/api/admin/logins/50")
      .then((res) => {
        setRowData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    getOverview();
    getPendingRequests();
    getMarketBalance();
  }, []);

  function getOverview(tenure) {
    BackendAxios.get(`/api/admin/overview?tenure=${tenure || "today"}`)
      .then((res) => {
        setPayoutDetails(res.data[5]);
        setPayoutData(res.data[0].payout);
        setWallets({
          ...wallets,
          retailer: res.data[1].retailer,
          distributor: res.data[1].distributor,
          superDistributor: res.data[1].super_distributor,
        });
        setFundRequestsData(res.data[2].funds);
        setUsersData(res.data[3].users);
      })
      .then(() => {
        BackendAxios.get(`/api/admin/role-count/retailer`)
          .then((res) => {
            setRetailers(res.data);
          })
          .then(() => {
            BackendAxios.get(`/api/admin/role-count/distributor`)
              .then((res) => {
                setDistributors(res.data);
              })
              .then(() => {
                BackendAxios.get(
                  `/api/admin/role-count/super_distributor`
                ).then((res) => {
                  setSuperDistributors(res.data);
                });
              });
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getPendingRequests() {
    BackendAxios.get("/api/admin/pending-requests")
      .then((res) => {
        setPendingRequests(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getMarketBalance() {
    BackendAxios.get("/api/admin/sum-amounts")
      .then((res) => {
        setBalance({
          marketBalance: res?.data?.wallet_sum,
          capBalance: res.data?.capping_sum,
        });
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        console.log(err);
      });
  }

  const data = {
    labels: ["AePS", "DMT", "Recharge", "BBPS"],
    datasets: [
      {
        data: [
          Math.abs(aepsData?.credit - aepsData?.debit),
          Math.abs(dmtData?.credit - dmtData?.debit),
          Math.abs(rechargeData?.credit - rechargeData?.debit),
          Math.abs(bbpsData?.credit - bbpsData?.debit),
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#36F5AB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#36D6EB"],
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: 20,
    legend: {
      display: true,
      position: "bottom", // Adjust the position of the legend (e.g., 'top', 'left', 'right', 'bottom')
      labels: {
        fontSize: 12,
      },
    },
  };

  return (
    <>
      <Layout pageTitle={"Dashboard"}>
        <Box p={4}>
          <HStack justifyContent={"space-between"} pt={8} pb={4}>
            <Text>Overview</Text>
            <Select
              name="earningStatsDuration"
              w={"xs"}
              bg={"white"}
              onChange={(e) => getOverview(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="month">1 Month</option>
              <option value="year">1 Year</option>
            </Select>
          </HStack>
          <Stack
            w={"full"}
            direction={["column", "row"]}
            gap={8}
            justifyContent={"space-between"}
          >
            <Box>
              <Stack
                direction={["row"]}
                w={"full"}
                py={2}
                spacing={[0, 4]}
                justifyContent={"space-between"}
                flexWrap={"wrap"}
                alignItems={["flex-start"]}
              >
                <DataCard
                  title={"Logins"}
                  data={usersData?.login}
                  icon={<BiLogIn color="#FF7B54" size={"32"} />}
                  color={"#FF7B54"}
                />
                <DataCard
                  title={"Registrations"}
                  data={usersData?.registration}
                  icon={<FaUserPlus color="#FF7B54" size={"28"} />}
                  color={"#FF7B54"}
                />
                <DataCard
                  title={"Support Tickets"}
                  data={usersData?.tickets}
                  icon={<IoMdHelpBuoy color="#FF7B54" size={"32"} />}
                  color={"#FF7B54"}
                />
              </Stack>

              <Stack
                direction={["row"]}
                w={"full"}
                py={2}
                spacing={[0, 4]}
                justifyContent={"space-between"}
                flexWrap={"wrap"}
                alignItems={["flex-start"]}
              >
                <DataCard
                  title={"Retailers"}
                  data={retailers}
                  icon={<FaUserAlt color="#6C00FF" size={"32"} />}
                  color={"#6C00FF"}
                />
                <DataCard
                  title={"Distributors"}
                  data={distributors}
                  icon={<FaUserAlt color="#6C00FF" size={"28"} />}
                  color={"#6C00FF"}
                />
                <DataCard
                  title={"Super Distributors"}
                  data={superDistributors}
                  icon={<FaUserAlt color="#6C00FF" size={"32"} />}
                  color={"#6C00FF"}
                />
              </Stack>

              <Stack
                direction={["row"]}
                w={"full"}
                py={2}
                spacing={[0, 4]}
                justifyContent={"flex-start"}
                flexWrap={"wrap"}
                alignItems={["flex-start"]}
              >
                <DataCard
                  title={"Market Balance"}
                  data={balance?.marketBalance}
                  icon={<BiRupee color="#FFB100" size={"28"} />}
                  color={"#FFB100"}
                />
                <DataCard
                  title={"Reserved Balance"}
                  data={balance?.capBalance}
                  icon={<BiRupee color="#FFB100" size={"32"} />}
                  color={"#FFB100"}
                />
              </Stack>

              <Stack
                direction={["row"]}
                w={"full"}
                py={2}
                spacing={[0, 4]}
                justifyContent={"flex-start"}
                flexWrap={"wrap"}
                alignItems={["flex-start"]}
              >
                <DataCard
                  title={"Retailers Wallet"}
                  data={wallets?.retailer}
                  icon={<FaUserAlt color="#FFB100" size={"32"} />}
                  color={"#FFB100"}
                />
                <DataCard
                  title={"Distributors Wallet"}
                  data={wallets?.distributor}
                  icon={<FaUserAlt color="#FFB100" size={"28"} />}
                  color={"#FFB100"}
                />
              </Stack>
              <Stack
                direction={["row"]}
                w={"full"}
                py={2}
                spacing={[0, 4]}
                justifyContent={"space-between"}
                flexWrap={"wrap"}
                alignItems={["flex-start"]}
              >
                <DataCard
                  title={"Super Distributors Wallet"}
                  data={wallets?.superDistributor}
                  icon={<FaUserAlt color="#FFB100" size={"32"} />}
                  color={"#FFB100"}
                />
              </Stack>
            </Box>
            <TableContainer w={["full", "sm"]}>
              <Table rounded={16} overflow={"hidden"}>
                <Thead bgColor={"twitter.500"}>
                  <Tr>
                    <Th color={"#FFF"}>Type</Th>
                    <Th color={"#FFF"}>Pending</Th>
                  </Tr>
                </Thead>
                <Tbody fontSize={"xs"}>
                  <Tr>
                    <Td py={2}>Fund Requests</Td>
                    <Td py={2}>
                      <Link
                        href={"/dashboard/account/fund-request?pageid=account"}
                      >
                        {pendingRequests?.funds || 0}
                      </Link>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td py={2}>KYC Verification</Td>
                    <Td py={2}>
                      <Link href={"/dashboard/users/users-list?pageid=users"}>
                        {pendingRequests?.profile || 0}
                      </Link>
                    </Td>
                  </Tr>
                  {/* <Tr>
                    <Td py={2}>Settlement Account Verification</Td>
                    <Td py={2}>{pendingRequests?.accounts || 0}</Td>
                  </Tr> */}
                  <Tr>
                    <Td py={2}>Pending Support Tickets</Td>
                    <Td py={2}>
                      <Link href={"/dashboard/support-tickets?pageid=support"}>
                        {pendingRequests?.tickets || 0}
                      </Link>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td py={2}>Pending Recharge</Td>
                    <Td py={2}>
                      <Link href={"/dashboard/reports/recharge?pageid=reports"}>
                        {pendingRequests?.recharge || 0}
                      </Link>
                    </Td>
                  </Tr>
                  {/* <Tr>
                    <Td py={2}>Pending DMT</Td>
                    <Link href={"/dashboard/reports/dmt?pageid=reports"}>
                      <Td py={2}>{pendingRequests?.dmt || 0}</Td>
                    </Link>
                  </Tr> */}
                </Tbody>
              </Table>
            </TableContainer>
          </Stack>

          <Stack direction={["column", "row"]} py={2} spacing={4}>
            <TransactionCard
              color={"#13005A"}
              title={"Pending Payouts"}
              quantity={payoutDetails?.processing_payouts?.count}
              amount={payoutDetails?.processing_payouts?.sum}
            />

            <TransactionCard
              color={"#26845A"}
              title={"Processed Payouts"}
              quantity={payoutDetails?.processed_payouts?.count}
              amount={payoutDetails?.processed_payouts?.sum}
            />

            <Box
              p={4}
              rounded={12}
              // minW={['full', '72']}
              flex={1}
              boxShadow={"md"}
              bg={"white"}
            >
              <Text
                w={"fit-content"}
                px={2}
                bg={"#678983"}
                color={"white"}
                rounded={"full"}
              >
                Fund Requests
              </Text>
              <HStack pt={4} justifyContent={"space-between"}>
                <VStack
                  w={"full"}
                  alignItems={"flex-start"}
                  pr={2}
                  borderRight={"1px"}
                  borderRightColor={"#999"}
                >
                  <Text fontSize={"xs"} color={"#666"}>
                    Approved
                  </Text>
                  <Text fontSize={"xl"} color={"#333"}>
                    {fundRequestsData?.approved}
                  </Text>
                </VStack>
                <VStack w={"full"} alignItems={"flex-start"} pl={2}>
                  <Text fontSize={"xs"} color={"#666"}>
                    Declined
                  </Text>
                  <Text fontSize={"xl"} color={"#333"}>
                    {fundRequestsData?.not_approved}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Stack>

          <Stack
            direction={["column", "row"]}
            justifyContent={"space-between"}
            py={6}
          >
            <Box w={"full"}>
              <Text pb={2} fontWeight={"semibold"}>
                Recent Login Activity
              </Text>
              <Box
                className="ag-theme-alpine ag-theme-pesa24-blue"
                h={"xs"}
                rounded={16}
                overflow={"hidden"}
              >
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columnDefs}
                ></AgGridReact>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Layout>
    </>
  );
};

export default Index;
