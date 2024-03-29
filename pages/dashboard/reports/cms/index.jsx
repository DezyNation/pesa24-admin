import React, { useEffect, useState, useRef } from "react";
import {
  useToast,
  Box,
  Text,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  VStack,
  Image,
  VisuallyHidden,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  BsCheck2Circle,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsDownload,
  BsXCircle,
  BsEye,
} from "react-icons/bs";
import Pdf from "react-to-pdf";
import BackendAxios from "@/lib/utils/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Layout from "../../layout";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { SiMicrosoftexcel } from "react-icons/si";
import { useFormik } from "formik";
import { Stack } from "@chakra-ui/react";
import { FormControl } from "@chakra-ui/react";
import { FormLabel } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import Cookies from "js-cookie";

const ExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const Index = () => {
  const transactionKeyword = "cms";
  const [printableRow, setPrintableRow] = useState([]);
  const Toast = useToast({
    position: "top-right",
  });
  const [pagination, setPagination] = useState({
    current_page: "1",
    total_pages: "1",
    first_page_url: "",
    last_page_url: "",
    next_page_url: "",
    prev_page_url: "",
  });
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "User ID",
      field: "transaction_by",
      cellRenderer: "userCellRenderer",
    },
    {
      headerName: "Trnxn ID",
      field: "transaction_id",
    },
    {
      headerName: "Debit Amount",
      field: "debit_amount",
      cellRenderer: "debitCellRenderer",
    },
    {
      headerName: "Credit Amount",
      field: "credit_amount",
      cellRenderer: "creditCellRenderer",
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
      headerName: "Transaction Type",
      field: "service_type",
    },
    {
      headerName: "Transaction Status",
      field: "status",
      cellRenderer: "statusCellRenderer",
    },
    {
      headerName: "Created At",
      field: "created_at",
    },
    {
      headerName: "Updated At",
      field: "updated_at",
    },
    {
      headerName: "Additional Info",
      field: "metadata",
      defaultMinWidth: 300,
    },
    {
      headerName: "Receipt",
      field: "receipt",
      pinned: "right",
      cellRenderer: "receiptCellRenderer",
    },
  ]);

  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
      search: "",
    },
  });

  function fetchTransactions(pageLink) {
    BackendAxios.get(
      pageLink ||
        `/api/admin/transactions-type/${transactionKeyword}?from=${
          Formik.values.from + (Formik.values.from && "T" + "00:00")
        }&to=${Formik.values.to + (Formik.values.to && "T" + "23:59")}&search=${
          Formik.values.search
        }&page=1`
    )
      .then((res) => {
        setPagination({
          current_page: res.data.current_page,
          total_pages: parseInt(res.data.last_page),
          first_page_url: res.data.first_page_url,
          last_page_url: res.data.last_page_url,
          next_page_url: res.data.next_page_url,
          prev_page_url: res.data.prev_page_url,
        });
        setRowData(res.data.data);
        setPrintableRow(res.data.data);
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        console.log(err);
        Toast({
          status: "error",
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const pdfRef = React.createRef();
  const [receipt, setReceipt] = useState({
    show: false,
    status: "success",
    data: {},
  });
  const receiptCellRenderer = (params) => {
    function showReceipt() {
      if (!params.data.metadata) {
        Toast({
          description: "No Receipt Available",
        });
        return;
      }
      setReceipt({
        status: JSON.parse(params.data.metadata).status,
        show: true,
        data: JSON.parse(params.data.metadata),
      });
    }
    return (
      <HStack height={"full"} w={"full"} gap={4}>
        <Button
          rounded={"full"}
          colorScheme="twitter"
          size={"xs"}
          onClick={() => showReceipt()}
        >
          <BsEye />
        </Button>
      </HStack>
    );
  };

  const creditCellRenderer = (params) => {
    return (
      <Text
        px={1}
        flex={"unset"}
        w={"fit-content"}
        bgColor={params.value > 0 && "green.400"}
        color={params.value > 0 && "#FFF"}
      >
        {params.value}
      </Text>
    );
  };

  const debitCellRenderer = (params) => {
    return (
      <Text
        px={1}
        flex={"unset"}
        w={"fit-content"}
        bgColor={params.value > 0 && "red.400"}
        color={params.value > 0 && "#FFF"}
      >
        {params.value}
      </Text>
    );
  };

  const userCellRenderer = (params) => {
    return (
      <Text>
        ({params.data.trigered_by}) {params.data.done_by} -{" "}
        {params.data.done_by_phone}
      </Text>
    );
  };

  const statusCellRenderer = (params) => {
    return (
      <>
        {JSON.parse(params.data.metadata).status ? (
          <Text color={"green"} fontWeight={"bold"}>
            SUCCESS
          </Text>
        ) : (
          <Text color={"red"} fontWeight={"bold"}>
            FAILED
          </Text>
        )}
      </>
    );
  };
  const tableRef = useRef(null);
  return (
    <>
      <Layout pageTitle={"CMS Reports"}>
        <Text fontSize={"lg"} fontWeight={"semibold"}>
          CMS Transactions
        </Text>
        <HStack my={4}>
          <DownloadTableExcel
            filename="UsersList"
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
            <FormLabel>Ref ID or Trnxn No.</FormLabel>
            <Input
              name="search"
              onChange={Formik.handleChange}
              bg={"white"}
            />
          </FormControl>
        </Stack>
        <HStack mb={4} justifyContent={"flex-end"}>
          <Button onClick={() => fetchTransactions()} colorScheme={"twitter"}>
            Search
          </Button>
        </HStack>
        <HStack
          spacing={2}
          py={4}
          mt={24}
          bg={"white"}
          justifyContent={"center"}
        >
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchTransactions(pagination.first_page_url)}
          >
            <BsChevronDoubleLeft />
          </Button>
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchTransactions(pagination.prev_page_url)}
          >
            <BsChevronLeft />
          </Button>
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"solid"}
          >
            {pagination.current_page}
          </Button>
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchTransactions(pagination.next_page_url)}
          >
            <BsChevronRight />
          </Button>
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchTransactions(pagination.last_page_url)}
          >
            <BsChevronDoubleRight />
          </Button>
        </HStack>
        <Box py={6}>
          <Box
            rounded={16}
            overflow={"hidden"}
            className="ag-theme-alpine ag-theme-pesa24-blue"
            w={"full"}
            h={["sm", "md"]}
          >
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{
                filter: true,
                floatingFilter: true,
                resizable: true,
                sortable: true,
              }}
              components={{
                receiptCellRenderer: receiptCellRenderer,
                creditCellRenderer: creditCellRenderer,
                debitCellRenderer: debitCellRenderer,
                userCellRenderer: userCellRenderer,
                statusCellRenderer: statusCellRenderer,
              }}
              onFilterChanged={(params) => {
                setPrintableRow(
                  params.api.getRenderedNodes().map((item) => {
                    return item.data;
                  })
                );
              }}
            ></AgGridReact>
          </Box>
        </Box>
      </Layout>

      {/* Receipt */}

      <Modal
        isOpen={receipt.show}
        onClose={() => setReceipt({ ...receipt, show: false })}
      >
        <ModalOverlay />
        <ModalContent width={"xs"}>
          <Box ref={pdfRef} style={{ border: "1px solid #999" }}>
            <ModalHeader p={0}>
              <VStack
                w={"full"}
                p={8}
                bg={receipt.status ? "green.500" : "red.500"}
              >
                {receipt.status ? (
                  <BsCheck2Circle color="#FFF" fontSize={72} />
                ) : (
                  <BsXCircle color="#FFF" fontSize={72} />
                )}
                <Text color={"#FFF"} textTransform={"capitalize"}>
                  ₹ {receipt.data.amount || 0}
                </Text>
                <Text
                  color={"#FFF"}
                  fontSize={"sm"}
                  textTransform={"uppercase"}
                >
                  TRANSACTION {receipt.status ? "success" : "failed"}
                </Text>
              </VStack>
            </ModalHeader>
            <ModalBody p={0} bg={"azure"}>
              <VStack w={"full"} p={4} bg={"#FFF"}>
                {receipt.data
                  ? Object.entries(receipt.data).map((item, key) => {
                      if (
                        item[0].toLowerCase() != "status" &&
                        item[0].toLowerCase() != "user" &&
                        item[0].toLowerCase() != "user_id" &&
                        item[0].toLowerCase() != "user_phone" &&
                        item[0].toLowerCase() != "amount"
                      )
                        return (
                          <HStack
                            justifyContent={"space-between"}
                            gap={8}
                            pb={1}
                            w={"full"}
                            key={key}
                          >
                            <Text
                              fontSize={"xs"}
                              fontWeight={"medium"}
                              textTransform={"capitalize"}
                            >
                              {item[0].replace(/_/g, " ")}
                            </Text>
                            <Text
                              fontSize={"xs"}
                              maxW={"full"}
                            >{`${item[1]}`}</Text>
                          </HStack>
                        );
                    })
                  : null}
                <VStack pt={8} w={"full"}>
                  <Image src="/logo_long.png" w={"20"} />
                  <Text fontSize={"xs"}>
                    {process.env.NEXT_PUBLIC_ORGANISATION_NAME}
                  </Text>
                </VStack>
              </VStack>
            </ModalBody>
          </Box>
          <ModalFooter>
            <HStack justifyContent={"center"} gap={8}>
              <Pdf targetRef={pdfRef} filename="Receipt.pdf">
                {({ toPdf }) => (
                  <Button
                    rounded={"full"}
                    size={"sm"}
                    colorScheme={"twitter"}
                    leftIcon={<BsDownload />}
                    onClick={toPdf}
                  >
                    Download
                  </Button>
                )}
              </Pdf>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <VisuallyHidden>
        <table id="printable-table" ref={tableRef}>
          <thead>
            <tr>
              <th>#</th>
              {columnDefs
                .filter((column) => {
                  if (
                    column.field != "metadata" &&
                    column.field != "name" &&
                    column.field != "receipt"
                  ) {
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
                  <td>{data.transaction_id}</td>
                  <td>
                    ({data.trigered_by}) {data.name}
                  </td>
                  <td>{data.debit_amount}</td>
                  <td>{data.credit_amount}</td>
                  <td>{data.opening_balance}</td>
                  <td>{data.closing_balance}</td>
                  <td>{data.service_type}</td>
                  <td>
                    {JSON.parse(data.metadata).status ? "SUCCESS" : "FAILED"}
                  </td>
                  <td>{data.created_at}</td>
                  <td>{data.updated_at}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </VisuallyHidden>
    </>
  );
};

export default Index;
