import React, { useState, useEffect } from "react";
import Layout from "../../layout";
import {
  Stack,
  Text,
  VStack,
  HStack,
  Button,
  Box,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { SiMicrosoftexcel } from "react-icons/si";
import { FaFileCsv, FaFilePdf, FaPrint } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  BsCheck,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsEye,
  BsX,
} from "react-icons/bs";
import BackendAxios from "@/lib/utils/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { FormControl } from "@chakra-ui/react";
import { FormLabel } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { useRef } from "react";

const ExportPDF = () => {
  const doc = new jsPDF("landscape");
  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const FundRequests = () => {
  const router = useRouter();
  const Toast = useToast({
    position: "top-right",
  });
  const [rowData, setRowData] = useState([]);

  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "Datetime",
      field: "created_at",
    },
    {
      headerName: "Trnxn ID",
      field: "id",
      width: 80,
    },
    {
      headerName: "Beneficiary",
      field: "user_id",
      cellRenderer: "userCellRenderer",
    },
    {
      headerName: "Admin",
      field: "admin_name",
      cellRenderer: "adminCellRenderer",
    },
    {
      headerName: "Amount",
      field: "amount",
      width: 100,
    },
    {
      headerName: "Type",
      field: "transaction_type",
      width: 100,
    },
    {
      headerName: "Remarks",
      field: "remarks",
      width: 300,
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
  const [pages, setPages] = useState([]);

  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
      query: "",
    },
  });

  function fetchRequests(pageLink) {
    BackendAxios.get(
      pageLink ||
        `/api/admin/fetch-admin-funds?from=${Formik.values.from}&to=${Formik.values.to}`
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
      })
      .catch((err) => {
        if (err?.response?.status == 401) {
          Cookies.remove("verified");
          window.location.reload();
        }
        console.log(err);
        Toast({
          status: "error",
          title: "Error Occured",
          description:
            err.response.data.message || err.response.data || err.message,
        });
      });
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusCellRenderer = (params) => {
    function updateFundRequest(updateTo) {
      console.log(params);
      if (updateTo == "approved") {
        BackendAxios.post(`/api/admin/update-fund-requests`, {
          id: params.data.id,
          beneficiaryId: params.data.user_id,
          status: updateTo,
          amount: params.data.amount,
        })
          .then((res) => {
            Toast({
              status: "success",
              description: "Status Updated",
            });
            fetchRequests();
          })
          .catch((err) => {
            Toast({
              status: "error",
              description:
                err.response.data.message || err.response.data || err.message,
            });
          });
      }
      if (updateTo == "declined" && params.data.admin_remarks) {
        BackendAxios.post(`/api/admin/update-fund-requests`, {
          beneficiaryId: params.data.user_id,
          id: params.data.id,
          status: updateTo,
          amount: 0,
          remarks: params.data.admin_remarks,
        })
          .then((res) => {
            Toast({
              status: "success",
              description: "Status Updated",
            });
            fetchRequests();
          })
          .catch((err) => {
            console.log(err);
            Toast({
              status: "error",
              description:
                err.response.data.message || err.response.data || err.message,
            });
          });
      }
      if (updateTo == "declined" && !params.data.admin_remarks) {
        Toast({
          description: "Please add remarks also",
        });
      }
      if (updateTo == "deleted") {
        BackendAxios.post("/api/admin/delete-fund", {
          fundId: params.data.id,
        })
          .then((res) => {
            Toast({
              status: "success",
              description: "Request Deleted",
            });
            fetchRequests();
          })
          .catch((err) => {
            console.log(err);
            Toast({
              status: "error",
              description:
                err.response.data.message || err.response.data || err.message,
            });
          });
      }
    }

    return (
      <>
        <HStack h={"full"}>
          {params.data.status == "pending" && (
            <Button
              size={"xs"}
              leftIcon={<BsCheck />}
              colorScheme="whatsapp"
              onClick={() => updateFundRequest("approved")}
            >
              Approve
            </Button>
          )}
          {params.data.status != "pending" && (
            <Button
              size={"xs"}
              colorScheme={
                params.data.status == "approved"
                  ? "whatsapp"
                  : params.data.status == "deleted"
                  ? "red"
                  : "orange"
              }
              textTransform={"capitalize"}
            >
              {params.data.status}
            </Button>
          )}
          {params.data.status == "pending" && (
            <Button
              size={"xs"}
              leftIcon={<BsX />}
              colorScheme="orange"
              onClick={() => updateFundRequest("declined")}
            >
              Reject
            </Button>
          )}
          {params.data.status == "pending" && (
            <Button
              size={"xs"}
              leftIcon={<BsX />}
              colorScheme="red"
              onClick={() => updateFundRequest("deleted")}
            >
              Delete
            </Button>
          )}
        </HStack>
      </>
    );
  };

  const userCellRenderer = (params) => {
    return (
      <>
        <Text>
          {params.data.name} ({params.data.user_id}) -{" "}
          {params.data.phone_number}
        </Text>
      </>
    );
  };

  const adminCellRenderer = (params) => {
    return (
      <>
        <Text>
          {params.data.admin_name} ({params.data.admin_id}) -{" "}
          {params.data.admin_phone}
        </Text>
      </>
    );
  };

  const receiptCellRenderer = (params) => {
    function showReceipt() {
      if (!params.data.receipt) {
        Toast({
          description: "No Receipt Available",
        });
        return;
      }
      window.open(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/receipts/${params.data.receipt}`,
        "_blank"
      );
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

  const tableRef = useRef(null);

  return (
    <>
      <Layout pageTitle={"Fund Transfers"}>
        <Text fontWeight={"semibold"} fontSize={"lg"}>
          Fund Transfers
        </Text>

        <Box py={6}>
          <HStack spacing={4} my={4}>
            <DownloadTableExcel
              filename="AdminToRetailerFundTransfers"
              sheet="fundTransfers"
              currentTableRef={tableRef.current}
            >
              <Button
                size={["xs", "sm"]}
                colorScheme={"whatsapp"}
                leftIcon={<SiMicrosoftexcel />}
              >
                Excel
              </Button>
            </DownloadTableExcel>

            <Button
              size={["xs", "sm"]}
              colorScheme={"red"}
              leftIcon={<FaFilePdf />}
              onClick={ExportPDF}
            >
              PDF
            </Button>
            <Button
              size={["xs", "sm"]}
              colorScheme={"facebook"}
              leftIcon={<FaPrint />}
              onClick={ExportPDF}
            >
              Print
            </Button>
          </HStack>
          <br />
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
          </Stack>
          <HStack mb={4} justifyContent={"flex-end"}>
            <Button onClick={() => fetchRequests()} colorScheme={"twitter"}>
              Search
            </Button>
          </HStack>

          <HStack spacing={2} py={4} bg={"white"} justifyContent={"center"}>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchRequests(pagination.first_page_url)}
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
                onClick={() => fetchRequests(item?.url)}
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
              onClick={() => fetchRequests(pagination.last_page_url)}
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
              }}
              onFilterChanged={(params) => {
                setPrintableRow(
                  params.api.getRenderedNodes().map((item) => {
                    return item.data;
                  })
                );
              }}
              components={{
                statusCellRenderer: statusCellRenderer,
                userCellRenderer: userCellRenderer,
                adminCellRenderer: adminCellRenderer,
                receiptCellRenderer: receiptCellRenderer,
              }}
            ></AgGridReact>
          </Box>
          <HStack spacing={2} py={4} bg={"white"} justifyContent={"center"}>
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchRequests(pagination.first_page_url)}
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
                onClick={() => fetchRequests(item?.url)}
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
              onClick={() => fetchRequests(pagination.last_page_url)}
            >
              <BsChevronDoubleRight />
            </Button>
          </HStack>

          <VisuallyHidden>
            <table id="printable-table" ref={tableRef}>
              <thead>
                <tr>
                  <th>#</th>
                  {columnDefs.map((column, key) => {
                    if (column.field != "receipt") {
                      return <th key={key}>{column.headerName}</th>;
                    }
                  })}
                </tr>
              </thead>
              <tbody>
                {printableRow.map((data, key) => {
                  return (
                    <tr key={key}>
                      <td>{key + 1}</td>
                      <td>{data.created_at}</td>
                      <td>{data.id}</td>
                      <td>
                        {data.name} ({data.user_id}) - {data.phone_number}
                      </td>
                      <td>
                        {data.admin_name} ({data.admin_id}) -{" "}
                        {data.admin_number}
                      </td>
                      <td>{data.amount}</td>
                      <td>{data.transaction_type}</td>
                      <td>{data.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </VisuallyHidden>
        </Box>
      </Layout>
    </>
  );
};

export default FundRequests;
