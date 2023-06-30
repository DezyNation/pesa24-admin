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
import { FaBan, FaFileCsv, FaFilePdf, FaPrint } from "react-icons/fa";
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
  BsTrash2Fill,
  BsX,
} from "react-icons/bs";
import BackendAxios from "@/lib/utils/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useDisclosure } from "@chakra-ui/react";
import { Modal } from "@chakra-ui/react";
import { ModalOverlay } from "@chakra-ui/react";
import { ModalContent } from "@chakra-ui/react";
import { ModalHeader } from "@chakra-ui/react";
import { ModalBody } from "@chakra-ui/react";
import { ModalFooter } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { DownloadTableExcel } from "react-export-table-to-excel";

const ExportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.autoTable({ html: "#printable-table" });
  doc.output("dataurlnewwindow");
};

const FundRequests = () => {
  const Toast = useToast({
    position: "top-right",
  });
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    {
      field: "id",
      headerName: "Req ID",
      width: 100,
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: "statusCellRenderer",
    },
    {
      headerName: "Request Timestamp",
      field: "created_at",
      width: 160,
    },
    {
      headerName: "Trnxn ID",
      field: "transaction_id",
      width: 160,
    },
    {
      headerName: "Amount",
      field: "amount",
      width: 100,
    },
    {
      headerName: "Requested Bank",
      field: "bank_name",
    },
    {
      headerName: "Trnxn Type",
      field: "transaction_type",
      width: 100,
      hide: true,
    },
    {
      headerName: "Receipt",
      field: "receipt",
      cellRenderer: "receiptCellRenderer",
      pinned: "right",
      width: 80,
    },
    {
      headerName: "User Name",
      field: "name",
      cellRenderer: "userCellRenderer",
    },
    // {
    //   headerName: "User Phone",
    //   field: "phone_number",
    //   width: 120,
    //   hide: true,
    // },
    {
      headerName: "Updated By",
      field: "admin_name",
      cellRenderer: "adminCellRenderer",
    },
    {
      headerName: "Remarks",
      field: "remarks",
      width: 100,
    },
    {
      headerName: "Admin Remarks",
      field: "admin_remarks",
      editable: true,
      singleClickEdit: true,
      cellEditor: "agTextCellEditor",
      width: 100,
    },
    { headerName: "Update Timestamp", field: "updated_at" },
  ]);

  const { onToggle, isOpen } = useDisclosure();
  const [selectedFundReq, setSelectedFundReq] = useState({
    id: "",
    beneficiaryId: "",
    amount: "",
    action: "",
  });
  const [remarks, setRemarks] = useState("");

  const [printableRow, setPrintableRow] = useState(rowData);
  const [pagination, setPagination] = useState({
    current_page: "1",
    total_pages: "1",
    first_page_url: "",
    last_page_url: "",
    next_page_url: "",
    prev_page_url: "",
  });

  function fetchRequests(pageLink) {
    BackendAxios.get(pageLink || "/api/admin/fetch-fund/all")
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

  function updateFundRequest() {
    console.log(selectedFundReq);
    console.log(remarks);
    if (selectedFundReq.action == "approved") {
      BackendAxios.post(`/api/admin/update-fund-requests`, {
        id: selectedFundReq.id,
        beneficiaryId: selectedFundReq.beneficiaryId,
        status: selectedFundReq.action,
        approved: 1,
        amount: selectedFundReq.amount,
      })
        .then((res) => {
          Toast({
            status: "success",
            description: "Status Updated",
          });
          onToggle();
          fetchRequests();
        })
        .catch((err) => {
          Toast({
            status: "error",
            description:
              err.response.data.message || err.response.data || err.message,
          });
          onToggle();
        });
      return;
    }
    if (selectedFundReq.action == "declined" && remarks) {
      BackendAxios.post(`/api/admin/update-fund-requests`, {
        beneficiaryId: selectedFundReq.beneficiaryId,
        id: selectedFundReq.id,
        status: selectedFundReq.action,
        amount: 0,
        declined: 1,
        remarks: remarks,
      })
        .then((res) => {
          onToggle();
          Toast({
            status: "success",
            description: "Status Updated",
          });
          fetchRequests();
        })
        .catch((err) => {
          onToggle();
          console.log(err);
          Toast({
            status: "error",
            description:
              err.response.data.message || err.response.data || err.message,
          });
        });
      return;
    }
    if (selectedFundReq.action == "declined" && !remarks) {
      Toast({
        description: "Please add remarks also",
      });
      return;
    }
    if (selectedFundReq.action == "deleted") {
      BackendAxios.post("/api/admin/delete-fund", {
        fundId: selectedFundReq.id,
      })
        .then((res) => {
          onToggle();
          Toast({
            status: "success",
            description: "Request Deleted",
          });
          fetchRequests();
        })
        .catch((err) => {
          onToggle();
          console.log(err);
          Toast({
            status: "error",
            description:
              err.response.data.message || err.response.data || err.message,
          });
        });
      return;
    }
  }

  const statusCellRenderer = (params) => {
    function handleClick() {
      setSelectedFundReq({
        id: params.data.id,
        beneficiaryId: params.data.user_id,
        amount: params.data.amount,
      });
      onToggle();
    }

    return (
      <>
        <HStack alignItems={"center"} justifyContent={"center"}>
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
            <Button size={"xs"} colorScheme="twitter" onClick={handleClick}>
              Actions
            </Button>
          )}
        </HStack>
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
      window.open(`https://pesa24.in/${params.data.receipt}`, "_blank");
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

  const userCellRenderer = (params) => {
    return (
      <>
        <Text>
          ({params.data.name}) {params.data.user_id} - {params.data.phone_number}
        </Text>
      </>
    );
  };

  const adminCellRenderer = (params) => {
    return (
      <>
        {params.data?.approved || params.data?.declined ? (
          <Text>
            {params.data.admin_name} ({params.data.admin_id})
          </Text>
        ) : null}
      </>
    );
  };

  const tableRef = React.useRef(null);
  return (
    <>
      <Layout pageTitle={"Fund Request"}>
        <Text fontWeight={"semibold"} fontSize={"lg"}>
          Fund Requests From Your Members
        </Text>

        <Box py={6}>
          <Text fontWeight={"medium"} pb={4}>
            Search and manage fund requests
          </Text>
          <HStack spacing={4} my={4}>
            <DownloadTableExcel
              filename="FundRequests"
              sheet="sheet1"
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
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchRequests(pagination.prev_page_url)}
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
              onClick={() => fetchRequests(pagination.next_page_url)}
            >
              <BsChevronRight />
            </Button>
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
                receiptCellRenderer: receiptCellRenderer,
                adminCellRenderer: adminCellRenderer,
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
            <Button
              colorScheme={"twitter"}
              fontSize={12}
              size={"xs"}
              variant={"outline"}
              onClick={() => fetchRequests(pagination.prev_page_url)}
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
              onClick={() => fetchRequests(pagination.next_page_url)}
            >
              <BsChevronRight />
            </Button>
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
                      <td>{data.status}</td>
                      <td>{data.created_at}</td>
                      <td>{data.transaction_id}</td>
                      <td>{data.amount}</td>
                      <td>{data.bank_name}</td>
                      <td>{data.transaction_type}</td>
                      <td>{data.name}</td>
                      <td>{data.admin_name}</td>
                      <td>{data.remarks}</td>
                      <td>{data.admin_remarks}</td>
                      <td>{data.updated_at}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </VisuallyHidden>
        </Box>
      </Layout>

      <Modal isOpen={isOpen} onClose={onToggle} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Fund Request</ModalHeader>
          <ModalBody>
            <HStack w={"full"} gap={4} py={4}>
              <Button
                colorScheme="whatsapp"
                leftIcon={<BsCheck />}
                variant={
                  selectedFundReq.action == "approved" ? "solid" : "outline"
                }
                onClick={() =>
                  setSelectedFundReq({ ...selectedFundReq, action: "approved" })
                }
              >
                Approve
              </Button>
              <Button
                colorScheme="orange"
                leftIcon={<FaBan />}
                variant={
                  selectedFundReq.action == "declined" ? "solid" : "outline"
                }
                onClick={() =>
                  setSelectedFundReq({ ...selectedFundReq, action: "declined" })
                }
              >
                Decline
              </Button>
              <Button
                colorScheme="orange"
                leftIcon={<BsX />}
                variant={
                  selectedFundReq.action == "delete" ? "solid" : "outline"
                }
                onClick={() =>
                  setSelectedFundReq({ ...selectedFundReq, action: "delete" })
                }
              >
                Delete
              </Button>
            </HStack>
            <Text>Remarks</Text>
            <Input onChange={(e) => setRemarks(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <HStack justifyContent={"flex-end"}>
              <Button colorScheme="twitter" onClick={updateFundRequest}>
                Confirm
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FundRequests;
