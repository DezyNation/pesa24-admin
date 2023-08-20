import React, { useState, useEffect, useRef } from "react";
import Layout from "../../layout";
import {
  Box,
  Button,
  Text,
  HStack,
  VisuallyHidden,
  InputGroup,
  InputRightElement,
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
import { DownloadTableExcel } from "react-export-table-to-excel";
import { SiMicrosoftexcel } from "react-icons/si";
import { Stack } from "@chakra-ui/react";
import { useFormik } from "formik";
import { FormControl } from "@chakra-ui/react";
import { FormLabel } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useToast } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import fileDownload from "js-file-download";

const ExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const Ledger = () => {
  const Toast = useToast({ position: "top-right" });
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "Transaction ID",
      field: "transaction_id",
    },
    {
      headerName: "Done By",
      field: "trigered_by",
      cellRenderer: "userCellRenderer",
      width: 150,
    },
    {
      headerName: "Description",
      field: "description",
    },
    {
      headerName: "Type",
      field: "service_type",
      width: 120,
    },
    {
      headerName: "Narration",
      field: "metadata",
      width: 200,
      cellRenderer: "narrationCellRenderer",
    },
    {
      headerName: "Credit",
      field: "credit_amount",
      cellRenderer: "creditCellRenderer",
      width: 120,
    },
    {
      headerName: "Debit",
      field: "debit_amount",
      cellRenderer: "debitCellRenderer",
      width: 120,
    },
    {
      headerName: "Opening Balance",
      field: "opening_balance",
      width: 120,
    },
    {
      headerName: "Closing Balance",
      field: "closing_balance",
      width: 120,
    },
    {
      headerName: "Created At",
      field: "created_at",
      width: 150,
    },
    {
      headerName: "Updated At",
      field: "updated_at",
      width: 150,
    },
  ]);
  const [pages, setPages] = useState([]);
  const [printableRow, setPrintableRow] = useState(rowData);
  const [pagination, setPagination] = useState({
    current_page: "1",
    total_pages: "1",
    first_page_url: "",
    last_page_url: "",
    next_page_url: "",
    prev_page_url: "",
  });
  const [verifiedUser, setVerifiedUser] = useState({});
  const [userId, setUserId] = useState("");
  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
      query: "",
      userQuery: "",
      userId: "",
    },
  });

  const params = useSearchParams();
  const transactionIdFromParams = params.get("transactionId");
  useEffect(() => {
    if (transactionIdFromParams) {
      Formik.setFieldValue("query", transactionIdFromParams);
      fetchLedger();
    }
  }, []);

  async function verifyUser() {
    if (!Formik.values.userQuery) {
      Toast({
        description: "Please enter User ID or Phone No.",
      });
      return;
    }
    await BackendAxios.post(`/api/admin/user/info/${Formik.values.userQuery}`)
      .then(async (res) => {
        Formik.setFieldValue("userId", res.data.data.id);
        setVerifiedUser(res.data.data);
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        console.log(err);
        Toast({
          status: "error",
          title: "Error while verifying User",
          description:
            err?.response?.data?.message || err?.response?.data || err?.message,
        });
      });
  }

  async function generateReport(userId) {
    if (!Formik.values.from || !Formik.values.to) return;
    setLoading(true);
    await BackendAxios.get(
      `/api/admin/print-report?type=ledger&from=${
        Formik.values.from + (Formik.values.from && "T" + "00:00")
      }&to=${Formik.values.to + (Formik.values.to && "T" + "23:59")}&search=${
        Formik.values.query
      }&userId=${Formik.values.userId}`,
      {
        responseType: 'blob'
      }
    )
      .then((res) => {
        setLoading(false);
        // setPrintableRow(res.data);
        fileDownload(res.data, `TransactionsLedger.xlsx`);
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        console.log(err);
        Toast({
          status: "error",
          description:
            err?.response?.data?.message || err?.response?.data || err?.message,
        });
      });
  }

  async function fetchLedger(pageLink) {
    setLoading(true);
    if (!Formik.values.userQuery) {
      Formik.setFieldValue("userId", "");
    }
    if (Formik.values.userQuery && !Formik.values.userId) {
      Toast({
        description: "Please verify the User first!",
      });
    }
    if (Formik.values.userId) {
      await BackendAxios.get(
        pageLink ||
          `/api/admin/transactions?from=${
            Formik.values.from + (Formik.values.from && "T" + "00:00")
          }&to=${
            Formik.values.to + (Formik.values.to && "T" + "23:59")
          }&search=${Formik.values.query}&userId=${Formik.values.userId}&page=1`
      )
        .then((res) => {
          setLoading(false);
          setPagination({
            current_page: res.data.current_page,
            total_pages: parseInt(res.data.last_page),
            first_page_url: res.data.first_page_url,
            last_page_url: res.data.last_page_url,
            next_page_url: res.data.next_page_url,
            prev_page_url: res.data.prev_page_url,
          });
          setPages(res.data.links);
          setRowData(res.data.data);
        })
        .catch((err) => {
          setLoading(false);
          if (err?.response?.status == 401) {
            Cookies.remove("verified");
            window.location.reload();
          }
        });
      return;
    }

    await BackendAxios.get(
      pageLink ||
        `/api/admin/transactions?from=${
          Formik.values.from + (Formik.values.from && "T" + "00:00")
        }&to=${Formik.values.to + (Formik.values.to && "T" + "23:59")}&search=${
          Formik.values.query
        }&userId=${Formik.values.userId}&page=1`
    )
      .then((res) => {
        setLoading(false);
        setPagination({
          current_page: res.data.current_page,
          total_pages: parseInt(res.data.last_page),
          first_page_url: res.data.first_page_url,
          last_page_url: res.data.last_page_url,
          next_page_url: res.data.next_page_url,
          prev_page_url: res.data.prev_page_url,
        });
        setPages(res.data.links);
        setRowData(res.data.data);
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
      });
  }

  useEffect(() => {
    fetchLedger();
  }, []);

  const creditCellRenderer = (params) => {
    return (
      <Text
        px={1}
        fontWeight={"semibold"}
        flex={"unset"}
        w={"fit-content"}
        color={params.value > 0 && "green.400"}
      >
        {params.value}
      </Text>
    );
  };

  const debitCellRenderer = (params) => {
    return (
      <Text
        px={1}
        fontWeight={"semibold"}
        flex={"unset"}
        w={"fit-content"}
        color={params.value > 0 && "red.400"}
      >
        {params.value}
      </Text>
    );
  };

  const userCellRenderer = (params) => {
    return (
      <Text>
        ({params?.data?.trigered_by}) {params?.data?.transaction_by} -{" "}
        {params?.data?.transaction_by_phone}
      </Text>
    );
  };

  const narrationCellRenderer = (params) => {
    const receipt = JSON.parse(params?.data?.metadata || {});
    return (
      <>
        <Text fontWeight={"bold"}>{receipt?.remarks}</Text>
      </>
    );
  };

  const tableRef = useRef(null);
  return (
    <>
      <Layout pageTitle={"Transactions Ledger"}>
        <Text fontSize={"lg"} fontWeight={"semibold"}>
          Transactions Ledger
        </Text>

        <HStack my={4}>
          {/* <DownloadTableExcel
            filename="TransactionsLedger"
            sheet="transactions"
            currentTableRef={tableRef.current}
          >
            <Button
              size={["xs", "sm"]}
              colorScheme={"whatsapp"}
              leftIcon={<SiMicrosoftexcel />}
            >
              Export Excel
            </Button>
          </DownloadTableExcel> */}
          <Button
            size={["xs", "sm"]}
            colorScheme={"whatsapp"}
            leftIcon={<SiMicrosoftexcel />}
            onClick={()=>generateReport()}
          >
            Export Excel
          </Button>
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
              type="date"
              bg={"white"}
            />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>To Date</FormLabel>
            <Input
              name="to"
              onChange={Formik.handleChange}
              type="date"
              bg={"white"}
            />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>Trnxn ID or Acc No.</FormLabel>
            <Input
              placeholder="Type here"
              name="query"
              onChange={Formik.handleChange}
              bg={"white"}
            />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>User ID or Phone</FormLabel>
            <InputGroup>
              <Input
                placeholder="User ID or Phone"
                name="userQuery"
                onChange={Formik.handleChange}
                bg={"white"}
              />
              <InputRightElement
                paddingRight={2}
                fontSize={"xs"}
                children={
                  <Text
                    fontSize={"xs"}
                    color={"twitter.500"}
                    cursor={"pointer"}
                    onClick={verifyUser}
                  >
                    Verify
                  </Text>
                }
              />
            </InputGroup>
            <Text fontSize={"xs"}>
              {verifiedUser?.name} {verifiedUser?.phone_number}
            </Text>
          </FormControl>
        </Stack>
        <HStack mb={4} justifyContent={"flex-end"}>
          <Button
            isLoading={loading}
            onClick={async () => {
              fetchLedger();
            }}
            colorScheme={"twitter"}
          >
            Search
          </Button>
        </HStack>

        <HStack spacing={2} py={4} bg={"white"} justifyContent={"center"}>
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchLedger(pagination.first_page_url)}
          >
            <BsChevronDoubleLeft />
          </Button>
          {pages.map((item, key) => (
            <Button
              key={key}
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={item?.active ? "solid" : "outline"}
              onClick={() => fetchLedger(item?.url)}
            >
              {item?.label == "&laquo; Previous" ? (
                <BsChevronLeft />
              ) : item?.label == "Next &raquo;" ? (
                <BsChevronRight />
              ) : (
                item?.label
              )}
            </Button>
          ))}
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchLedger(pagination.last_page_url)}
          >
            <BsChevronDoubleRight />
          </Button>
        </HStack>

        <Box
          rounded={16}
          overflow={"hidden"}
          className="ag-theme-alpine ag-theme-pesa24-blue"
          h={"xl"}
        >
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={{
              filter: true,
              floatingFilter: true,
              resizable: true,
              wrapText: true,
              autoHeight: true,
              suppressMovable: true
            }}
            onFilterChanged={(params) => {
              setPrintableRow(
                params.api.getRenderedNodes().map((item) => {
                  return item.data;
                })
              );
            }}
            components={{
              creditCellRenderer: creditCellRenderer,
              debitCellRenderer: debitCellRenderer,
              userCellRenderer: userCellRenderer,
              narrationCellRenderer: narrationCellRenderer,
            }}
          ></AgGridReact>
        </Box>

        <HStack spacing={2} py={4} bg={"white"} justifyContent={"center"}>
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchLedger(pagination.first_page_url)}
          >
            <BsChevronDoubleLeft />
          </Button>
          {pages.map((item, key) => (
            <Button
              key={key}
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={item?.active ? "solid" : "outline"}
              onClick={() => fetchLedger(item?.url)}
            >
              {item?.label == "&laquo; Previous" ? (
                <BsChevronLeft />
              ) : item?.label == "Next &raquo;" ? (
                <BsChevronRight />
              ) : (
                item?.label
              )}
            </Button>
          ))}
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchLedger(pagination.last_page_url)}
          >
            <BsChevronDoubleRight />
          </Button>
        </HStack>

        <VisuallyHidden>
          <table id="printable-table" ref={tableRef}>
            <thead>
              <tr>
                <th>#</th>
                <th>UTR</th>
                {columnDefs
                  .filter((column) => {
                    if (column.field != "metadata") {
                      return column;
                    }
                  })
                  .map((column, key) => {
                    return <th key={key}>{column.headerName}</th>;
                  })}
              </tr>
            </thead>
            <tbody>
              {printableRow.map((data, key) => {
                return (
                  <tr key={key}>
                    <td>{key + 1}</td>
                    <td>{JSON.parse(data.metadata || {})?.utr || ""}</td>
                    <td>{data.transaction_id}</td>
                    <td>
                      ({data?.trigered_by}) {data?.transaction_by} -{" "}
                      {data?.transaction_by_phone}
                    </td>
                    <td>{data.description}</td>
                    <td>{data.service_type}</td>
                    <td>{data.credit_amount}</td>
                    <td>{data.debit_amount}</td>
                    <td>{data.opening_balance}</td>
                    <td>{data.closing_balance}</td>
                    <td>{data.created_at}</td>
                    <td>{data.updated_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </VisuallyHidden>
      </Layout>
    </>
  );
};

export default Ledger;
