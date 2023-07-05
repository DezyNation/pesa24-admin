import React, { useState, useEffect, useRef } from "react";
import Layout from "../../layout";
import {
  Box,
  Text,
  Button,
  Image,
  InputGroup,
  InputRightAddon,
  Input,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  VisuallyHidden,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import BackendAxios from "@/lib/utils/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
import { useRouter } from "next/router";
import Pdf from "react-to-pdf";
import { SiMicrosoftexcel } from "react-icons/si";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { Stack } from "@chakra-ui/react";
import Cookies from "js-cookie";

const ExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const UserLedger = () => {
  const Toast = useToast({ position: "top-right" });
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "Transaction ID",
      field: "transaction_id",
    },
    {
      headerName: "Done By",
      field: "trigered_by",
      cellRenderer: "userCellRenderer",
    },
    {
      headerName: "Description",
      field: "description",
    },
    {
      headerName: "Type",
      field: "service_type",
      width: 100,
    },
    {
      headerName: "Credit",
      field: "credit_amount",
      width: 100,
    },
    {
      headerName: "Debit",
      field: "debit_amount",
      width: 100,
    },
    {
      headerName: "Opening Balance",
      field: "opening_balance",
      width: 100,
    },
    {
      headerName: "Closing Balance",
      field: "closing_balance",
      width: 100,
    },
    {
      headerName: "Timestamp",
      field: "created_at",
    },
    {
      headerName: "Transaction Status",
      field: "status",
      cellRenderer: "statusCellRenderer",
      width: 150,
    },
    {
      headerName: "Additional Info",
      field: "metadata",
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

  const [printableRow, setPrintableRow] = useState(rowData);
  const [pagination, setPagination] = useState({
    current_page: "1",
    total_pages: "1",
    first_page_url: "",
    last_page_url: "",
    next_page_url: "",
    prev_page_url: "",
  });

  const Router = useRouter();
  const { user_id } = Router.query;

  // function to fetch user info from api
  function fetchUserWithLedger() {
    if (!userId) {
      Toast({
        description: "Please enter User ID",
      });
    }
    BackendAxios.post(`/api/admin/user/info/${userId}`)
      .then((res) => {
        fetchLedger(
          `/api/admin/transactions-user/${res.data.data.id}?from=${from}&to=${to}&page=1`
        );
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        Toast({
          status: "error",
          description:
            err?.response?.data?.message || err?.response?.data || err?.message,
        });
      });
  }

  function fetchLedger(pageLink) {
    BackendAxios.get(
      pageLink || `/api/admin/transactions?from=${from}&to=${to}&page=1`
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
        console.log(err);
      });
  }

  useEffect(() => {
    if (Router.isReady && user_id) {
      BackendAxios.get(`/api/admin/transactions-user/${user_id}?page=1`)
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
          setUserId(user_id);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      fetchLedger();
    }
  }, [Router.isReady]);

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
        ({params.data.trigered_by}) {params.data.transaction_by} -{" "}
        {params.data.transaction_by_phone}
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
      <Layout pageTitle={"User Ledger"}>
        <Box p={4}>
          <Stack direction={["column", "row"]} spacing={4} py={4}>
            <FormControl w={["full", "xs"]}>
              <FormLabel py={2}>User ID or Phoner</FormLabel>
              <Input
                name={"userId"}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={"Enter User ID"}
              />
            </FormControl>

            <FormControl w={["full", "xs"]}>
              <FormLabel py={2}>From</FormLabel>
              <Input
                name={"from"}
                onChange={(e) => setFrom(e.target.value)}
                type="date"
              />
            </FormControl>

            <FormControl w={["full", "xs"]}>
              <FormLabel py={2}>To</FormLabel>
              <Input
                name={"to"}
                onChange={(e) => setTo(e.target.value)}
                type="date"
              />
            </FormControl>
          </Stack>
          <HStack py={4} justifyContent={"flex-end"}>
            <Button colorScheme="twitter" onClick={fetchUserWithLedger}>
              Search
            </Button>
          </HStack>

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
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchLedger(pagination.prev_page_url)}
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
              onClick={() => fetchLedger(pagination.next_page_url)}
            >
              <BsChevronRight />
            </Button>
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
              }}
              components={{
                debitCellRenderer: debitCellRenderer,
                creditCellRenderer: creditCellRenderer,
                userCellRenderer: userCellRenderer,
                statusCellRenderer: statusCellRenderer,
                receiptCellRenderer: receiptCellRenderer,
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
              onClick={() => fetchLedger(pagination.first_page_url)}
            >
              <BsChevronDoubleLeft />
            </Button>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchLedger(pagination.prev_page_url)}
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
              onClick={() => fetchLedger(pagination.next_page_url)}
            >
              <BsChevronRight />
            </Button>
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
                  {columnDefs
                    .filter((column) => {
                      if (column.headerName != "Description") {
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
                      <td>{data.trigered_by}</td>
                      <td>{data.name}</td>
                      <td>{data.service_type}</td>
                      <td>{data.credit_amount}</td>
                      <td>{data.debit_amount}</td>
                      <td>{data.opening_balance}</td>
                      <td>{data.closing_balance}</td>
                      <td>{data.created_at}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </VisuallyHidden>
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
    </>
  );
};

export default UserLedger;
