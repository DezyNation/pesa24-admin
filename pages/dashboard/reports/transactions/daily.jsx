import React, { useState, useEffect, useRef } from "react";
import Layout from "../../layout";
import {
  Box,
  Button,
  Text,
  HStack,
  Stack,
  VisuallyHidden,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import BackendAxios from "@/lib/utils/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { useFormik } from "formik";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { SiMicrosoftexcel } from "react-icons/si";
import { TableContainer } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { Thead } from "@chakra-ui/react";
import { Tr } from "@chakra-ui/react";
import { Th } from "@chakra-ui/react";
import { Tbody } from "@chakra-ui/react";
import { Td } from "@chakra-ui/react";
import Cookies from "js-cookie";

const ExportPDF = () => {
  const doc = new jsPDF("landscape");
  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const Ledger = () => {
  const today = new Date();
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "User ID",
      field: "transaction_by",
      cellRenderer: "userCellRenderer",
    },
    {
      headerName: "Transaction ID",
      field: "transaction_id",
    },
    {
      headerName: "Credit Amount",
      field: "credit_amount",
    },
    {
      headerName: "Debit Amount",
      field: "debit_amount",
    },
    {
      headerName: "Transaction For",
      field: "service_type",
    },
    {
      headerName: "Opening Balance",
      field: "opening_balance",
    },
    {
      headerName: "Closing Balance",
      field: "closing_balance",
    },
    {
      headerName: "Description",
      field: "metadata",
    },
    {
      headerName: "Timestamp",
      field: "created_at",
    },
  ]);
  const [printableRow, setPrintableRow] = useState(rowData);
  const [overviewData, setOverviewData] = useState([])
  const [pagination, setPagination] = useState({
    current_page: "1",
    total_pages: "1",
    first_page_url: "",
    last_page_url: "",
    next_page_url: "",
    prev_page_url: "",
  });
  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
    },
    onSubmit: (values) => {
      fetchLedger(
        `/api/admin/transactions-period?from=${values.from}&to=${values.to}&page=1`
      );
    },
  });

  function addTransactions(accumulator, a) {
    return accumulator + a;
  }

  function fetchSum(){
    BackendAxios.get(`/api/admin/overview?from=${Formik.values.from}&to=${Formik.values.to}`).then(res => {
      setOverviewData(res.data)
    }).catch(err => {
      if (err?.response?.status == 401) {
        Cookies.remove("verified");
        window.location.reload();
      }
      console.log(err)
    })
  }

  function fetchLedger(pageLink) {
    BackendAxios.post(pageLink || `/api/admin/transactions-period?from=${Formik.values.from}&to=${Formik.values.to}&page=1`, {
      from: Formik.values.from,
      to: Formik.values.to,
    })
      .then((res) => {
        setPagination({
          current_page: res.data.current_page,
          total_pages: parseInt(res.data.last_page),
          first_page_url: res.data.first_page_url,
          last_page_url: res.data.last_page_url,
          next_page_url: res.data.next_page_url,
          prev_page_url: res.data.prev_page_url,
        });

        setRowData(
          Object.entries(res.data).map((item) => {
            return {
              userId: item[0],
              userName:
                Object.entries(item[1]).map(
                  (transaction) => transaction[1][0]?.trigered_by_name
                )[0] || "NA",
              userPhone:
                Object.entries(item[1]).map(
                  (transaction) => transaction[1][0]?.trigered_by_phone
                )[0] || "NA",
              userWallet:
                Object.entries(item[1]).map(
                  (transaction) => transaction[1][0]?.wallet_amount
                )[0] || "NA",
              transactions: Object.entries(item[1]).map((transaction) => ({
                category: transaction[0],
                total: transaction[1]
                  ?.map((data) =>
                    Number(data?.debit_amount - data?.credit_amount)
                  )
                  ?.reduce(addTransactions, 0),
              })),
            };
          })
        );

        // setPrintableRow(res.data)
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        console.log(err);
      });

    fetchSum()
  }

  useEffect(() => {
    fetchLedger();
  }, []);

  const userCellRenderer = (params) => {
    return (
      <Text>
        ({params.data.trigered_by}) {params.data.trigered_by_name} -{" "}
        {params.data.trigered_by_phone}
      </Text>
    );
  };

  const tableRef = useRef(null);
  return (
    <>
      <Layout pageTitle={"Transactions Ledger"}>
        <Text fontSize={"lg"} fontWeight={"semibold"}>
          Daily Sales
        </Text>
        <HStack my={4}>
          <DownloadTableExcel
            filename="DailySales"
            sheet="users"
            currentTableRef={tableRef.current}
          >
            <Button
              size={["xs", "sm"]}
              colorScheme={"whatsapp"}
              leftIcon={<SiMicrosoftexcel />}
            >
              Export Excel
            </Button>
          </DownloadTableExcel>
          <Button onClick={ExportPDF} colorScheme={"red"} size={"sm"}>
            Export PDF
          </Button>
        </HStack>

        <Box p={2} bg={"twitter.500"}>
          <Text color={"#FFF"}>Search Transactions</Text>
        </Box>
        <Stack p={4} spacing={8} w={"full"} direction={["column", "row"]}>
          <FormControl w={["full", "xs"]}>
            <FormLabel>From Date</FormLabel>
            <Input
              name="from"
              onChange={Formik.handleChange}
              type="datetime-local"
              bg={"white"}
            />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>To Date</FormLabel>
            <Input
              name="to"
              onChange={Formik.handleChange}
              type="datetime-local"
              bg={"white"}
            />
          </FormControl>
        </Stack>
        <HStack mb={4} justifyContent={"flex-end"}>
          <Button onClick={() => fetchLedger()} colorScheme={"twitter"}>
            Search
          </Button>
        </HStack>

        <HStack mt={24} mb={4} justifyContent={"flex-end"}>
          <Button onClick={ExportPDF} colorScheme={"red"} size={"sm"}>
            Export PDF
          </Button>
        </HStack>

        {/* <Box
                    rounded={16} overflow={'hidden'}
                    className='ag-theme-alpine ag-theme-pesa24-blue'
                    h={'2xl'}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={{
                            filter: true,
                            floatingFilter: true,
                            resizable: true,
                        }}

                        components={{
                            'userCellRenderer': userCellRenderer
                        }}
                        onFilterChanged={
                            (params) => {
                                setPrintableRow(params.api.getRenderedNodes().map((item) => {
                                    return (
                                        item.data
                                    )
                                }))
                            }
                        }
                    >

                    </AgGridReact>
                </Box> */}

        <TableContainer rounded={16}>
          <Table
            colorScheme="twitter"
            variant={"striped"}
            ref={tableRef}
            id="printable-table"
          >
            <Thead bgColor={"twitter.500"} color={"#FFF"}>
              <Tr>
                <Th color={"#FFF"} rowSpan={2}>
                  User ID
                </Th>
                <Th color={"#FFF"} rowSpan={2}>
                  Wallet Balance
                </Th>
                <Th color={"#FFF"} colSpan={4} textAlign={"center"}>
                  Transactions
                </Th>
              </Tr>
              <Tr>
                <Th color={"#FFF"}>Payout</Th>
                <Th color={"#FFF"}>Charge</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rowData.map((item, key) => (
                <Tr key={key}>
                  <Td>
                    <Box>
                      <Text fontSize={"lg"} fontWeight={"semibold"}>
                        {item?.userName}
                      </Text>
                      <Text>
                        ({item?.userId}) - {item?.userPhone}
                      </Text>
                    </Box>
                  </Td>
                  <Td>₹ {item?.userWallet || 0}</Td>
                  <Td>
                    {item?.transactions?.find(
                      (trnxn) => trnxn.category == "payout"
                    )?.total || 0}
                  </Td>
                  <Td>
                    {item?.transactions?.find(
                      (trnxn) => trnxn.category == "payout-commission"
                    )?.total || 0}
                  </Td>
                </Tr>
              ))}
              <Tr>
                <Td colSpan={2}>
                  <Text
                    textAlign={"right"}
                    fontWeight={"semibold"}
                    fontSize={"lg"}
                  >
                    TOTAL
                  </Text>
                </Td>
                <Td>
                  <Text textAlign={"left"} fontWeight={"semibold"} fontSize={"lg"}>
                    {Number(overviewData[0]?.payout?.debit - overviewData[0]?.payout?.credit) || 0}
                  </Text>
                </Td>
                <Td>
                  <Text textAlign={"left"} fontWeight={"semibold"} fontSize={"lg"}>
                    {Number(overviewData[4]?.["payout-commission"]?.debit - overviewData[4]?.["payout-commission"]?.credit) || 0}
                  </Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        {/* <VisuallyHidden>
                    <table id='printable-table' ref={tableRef}>
                        <thead>
                            <tr>
                                <th>#</th>
                                {
                                    columnDefs.filter((column) => {
                                        if (
                                            column.field != "metadata" &&
                                            column.field != "name" &&
                                            column.field != "receipt"
                                        ) {
                                            return (
                                                column
                                            )
                                        }
                                    }).map((column, key) => {
                                        return (
                                            <th key={key}>{column.headerName}</th>
                                        )
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                printableRow.map((data, key) => {
                                    return (
                                        <tr key={key}>
                                            <td>{key + 1}</td>
                                            <td>({data.trigered_by}) {data.trigered_by_name}</td>
                                            <td>{data.transaction_id}</td>
                                            <td>{data.credit_amount}</td>
                                            <td>{data.debit_amount}</td>
                                            <td>{data.service_type}</td>
                                            <td>{data.opening_balance}</td>
                                            <td>{data.closing_balance}</td>
                                            <td>{data.created_at}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </VisuallyHidden> */}
      </Layout>
    </>
  );
};

export default Ledger;
