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
  BsClockHistory,
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
  const transactionKeyword = "payout";
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
  const [pendingRowData, setPendingRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "Action",
      field: "action",
      cellRenderer: "actionCellRenderer",
      width: 100,
    },
    {
      headerName: "Created Timestamp",
      field: "created_at",
      width: 160,
    },
    {
      headerName: "User Details",
      field: "name",
      cellRenderer: "userCellRenderer",
    },
    {
      headerName: "Reference ID",
      field: "reference_id",
    },
    {
      headerName: "Payout ID",
      field: "payout_id",
    },
    {
      headerName: "UTR",
      field: "utr",
    },
    {
      headerName: "Amount",
      field: "amount",
      cellRenderer: "debitCellRenderer",
      width: 100,
    },
    {
      headerName: "Beneficiary",
      field: "beneficiary_name",
      width: 100,
    },
    {
      headerName: "Acc No",
      field: "account_number",
      width: 100,
    },
    {
      headerName: "Credit",
      field: "credit_amount",
      cellRenderer: "creditCellRenderer",
      width: 100,
      hide: true,
    },
    {
      headerName: "Opening Balance",
      field: "opening_balance",
      width: 100,
      hide: true,
    },
    {
      headerName: "Closing Balance",
      field: "closing_balance",
      width: 100,
      hide: true,
    },
    {
      headerName: "Trnxn Type",
      field: "service_type",
      width: 120,
      hide: true,
    },
    {
      headerName: "Trnxn Status",
      field: "status",
      cellRenderer: "statusCellRenderer",
      width: 120,
    },
    {
      headerName: "Updated Timestamp",
      field: "updated_at",
    },
    {
      headerName: "Additional Info",
      field: "metadata",
      defaultMinWidth: 300,
      hide: true,
    },
    {
      headerName: "Receipt",
      field: "receipt",
      pinned: "right",
      cellRenderer: "receiptCellRenderer",
      width: 80,
    },
  ]);
  const [pages, setPages] = useState([]);

  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
      query: "",
    },
  });

  function fetchPendingTransactions() {
    BackendAxios.get(`/api/admin/payouts/processing`)
      .then((res) => {
        setPendingRowData(res.data);
      })
      .catch((err) => {
        console.log(err);
        Toast({
          status: "error",
          description:
            err?.response?.data?.message || err?.response?.data || err?.message,
        });
      });
  }

  function fetchTransactions(pageLink) {
    BackendAxios.get(
      pageLink
        ? pageLink
        : `/api/admin/payouts?from=${Formik.values.from}&to=${
            Formik.values.to
              ? new Date(
                  new Date(Formik.values.to).setHours(23, 59, 59, 999)
                ).toISOString()
              : new Date().toISOString()
          }&search=${Formik.values.query}&page=1`
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
        setPages(res.data?.links);
        setRowData(res.data.data);
        setPrintableRow(res.data.data);
        fetchPendingTransactions();
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
            err?.response?.data?.message || err?.response?.data || err?.message,
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
      // if (!params.data.metadata) {
      //     Toast({
      //         description: 'No Receipt Available'
      //     })
      //     return
      // }
      setReceipt({
        status: params?.data?.status,
        show: true,
        data: {
          reference_ID: params?.data?.reference_id,
          payout_ID: params?.data?.payout_id,
          beneficiary_name: params?.data?.beneficiary_name,
          account_no: params?.data?.account_number,
          created_at: params?.data?.created_at,
          updated_at: params?.data?.updated_at,
          UTR: params?.data?.utr,
          amount: params?.data?.amount,
          status: params?.data?.status,
        },
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
        ({params.data.user_id}) {params.data.name}
      </Text>
    );
  };

  const statusCellRenderer = (params) => {
    return (
      <>
        {params.data.status == "processed" ? (
          <Text color={"green"} fontWeight={"bold"} textTransform={"uppercase"}>
            {params.data.status}
          </Text>
        ) : params.data.status == "processing" ? (
          <Text
            color={"orange"}
            fontWeight={"bold"}
            textTransform={"uppercase"}
          >
            {params.data.status}
          </Text>
        ) : (
          <Text color={"red"} fontWeight={"bold"} textTransform={"uppercase"}>
            {params.data.status}
          </Text>
        )}
      </>
    );
  };

  const actionCellRenderer = (params) => {
    function updateData() {
      BackendAxios.post("api/razorpay/payment-status", {
        payoutId: params.data.payout_id,
      })
        .then(() => {
          Toast({
            status: "success",
            description: `Payout ${params.data.payout_id} updated!`,
          });
          let pageUrl = `/api/admin/payouts?from=${Formik.values.from}&to=${Formik.values.to}&page=${pagination.current_page}`;
          fetchTransactions(pageUrl);
        })
        .catch((err) => {
          Toast({
            status: "error",
            description:
              err.response?.data?.message || err.response?.data || err.message,
          });
        });
    }
    return (
      <>
        {params.data?.status == "processing" ||
        params.data?.status == "queued" ? (
          <Button size={"xs"} colorScheme="twitter" onClick={updateData}>
            UPDATE
          </Button>
        ) : null}
      </>
    );
  };

  const tableRef = useRef(null);
  return (
    <>
      <Layout pageTitle={"DMT Reports"}>
        <Text fontSize={"lg"} fontWeight={"semibold"}>
          Payout Transactions
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
            <FormLabel>Ref ID or Acc No.</FormLabel>
            <Input name="query" onChange={Formik.handleChange} bg={"white"} />
          </FormControl>
        </Stack>
        <HStack mb={4} justifyContent={"flex-end"}>
          <Button onClick={() => fetchTransactions()} colorScheme={"twitter"}>
            Search
          </Button>
        </HStack>

        {/* Pending Payouts */}
        <Text pb={4}>Pending Payouts</Text>
        <Box
          rounded={16}
          overflow={"hidden"}
          className="ag-theme-alpine ag-theme-pesa24-blue"
          w={"full"}
          h={["sm", "md"]}
        >
          <AgGridReact
            columnDefs={columnDefs}
            rowData={pendingRowData}
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
              actionCellRenderer: actionCellRenderer,
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

        <HStack spacing={2} py={4} bg={"white"} justifyContent={"center"}>
          <Button
            colorScheme={"twitter"}
            fontSize={12}
            size={"xs"}
            variant={"outline"}
            onClick={() => fetchTransactions(pagination.first_page_url)}
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
              onClick={() => fetchTransactions(item?.url)}
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
            onClick={() => fetchTransactions(pagination.last_page_url)}
          >
            <BsChevronDoubleRight />
          </Button>
        </HStack>
        <Box
          rounded={16}
          overflow={"hidden"}
          className="ag-theme-alpine ag-theme-pesa24-blue"
          w={"full"}
          h={["sm", "xl"]}
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
              actionCellRenderer: actionCellRenderer,
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
                bg={
                  receipt.status == "processed"
                    ? "green.500"
                    : receipt.status == "processing"
                    ? "yellow.500"
                    : "red.500"
                }
              >
                {receipt.status == "processed" ? (
                  <BsCheck2Circle color="#FFF" fontSize={72} />
                ) : receipt.status == "processing" ? (
                  <BsClockHistory color="#FFF" fontSize={72} />
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
                  TRANSACTION {receipt.status}
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
                        item[0].toLowerCase() != "name" &&
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
                {/* <VStack pt={8} w={"full"}>
                  <Image src="/logo_long.png" w={"20"} />
                  <Text fontSize={"xs"}>
                    {process.env.NEXT_PUBLIC_ORGANISATION_NAME}
                  </Text>
                </VStack> */}
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
                  <td>{data.status ? "SUCCESS" : "FAILED"}</td>
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
