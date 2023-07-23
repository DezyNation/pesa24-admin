import React, { useState, useEffect } from "react";
import Layout from "../../layout";
import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  HStack,
  Button,
  Box,
} from "@chakra-ui/react";
import BackendAxios from "@/lib/utils/axios";
import { useFormik } from "formik";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const page = () => {
  const Toast = useToast({
    position: "top-right",
  });
  const Router = useRouter();
  const [loading, setLoading] = useState(false);
  const [columnDefs, setColumnDefs] = useState([
    {
      field: "action",
      headerName: "Action",
      cellRenderer: "actionCellRenderer",
      width: 120,
    },
    {
      field: "transaction_id",
      headerName: "Trnxn ID",
      width: 150,
    },
    {
      field: "user_id",
      headerName: "User ID",
      width: 120,
    },
    {
      field: "service_type",
      headerName: "Type",
      width: 120,
    },
    {
      field: "transaction_for",
      headerName: "Description",
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
  const [rowData, setRowData] = useState([]);

  const Formik = useFormik({
    initialValues: {
      from: "",
      to: "",
    },
  });

  function fetchTransactions() {
    setLoading(true);
    BackendAxios.get(
      `/api/admin/duplicate-transactions?from=${
        Formik.values.from + (Formik.values.from && "T" + "00:00")
      }&to=${Formik.values.to + (Formik.values.to && "T" + "23:59")}`
    )
      .then((res) => {
        setLoading(false);
        setRowData(res.data);
      })
      .catch((err) => {
        setLoading(false);
        Toast({
          status: "error",
          description:
            err.response?.data?.message || err.response?.data || err.message,
        });
      });
  }

  useEffect(() => {
    fetchTransactions();
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

  const narrationCellRenderer = (params) => {
    const receipt = JSON.parse(params?.data?.metadata || {});
    return (
      <>
        <Text fontWeight={"bold"}>{receipt?.remarks}</Text>
      </>
    );
  };

  const actionCellRenderer = (params) => {
    return (
      <>
        <Link
          href={`/dashboard/reports/transactions?pageid=transaction-ledger&parent=reports&transactionId=${params.data.transaction_id}`}
          target="_blank"
        >
          <Button size={"xs"} colorScheme="facebook">View Ledger</Button>
        </Link>
      </>
    );
  };

  return (
    <>
      <Layout pageTitle={"Duplicate Transactions"}>
        <Stack
          direction={["column", "row"]}
          alignItems={"center"}
          justifyContent={"flex-start"}
          gap={[8]}
        >
          <FormControl w={["full", "xs"]}>
            <FormLabel>From</FormLabel>
            <Input type="date" name="from" onChange={Formik.handleChange} />
          </FormControl>
          <FormControl w={["full", "xs"]}>
            <FormLabel>To</FormLabel>
            <Input type="date" name="to" onChange={Formik.handleChange} />
          </FormControl>
        </Stack>
        <HStack py={4} justifyContent={"flex-end"}>
          <Button
            colorScheme="twitter"
            onClick={fetchTransactions}
            isLoading={loading}
            loadingText="Please wait"
          >
            Search
          </Button>
        </HStack>
        <br />
        <br />
        <br />

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
              creditCellRenderer: creditCellRenderer,
              debitCellRenderer: debitCellRenderer,
              narrationCellRenderer: narrationCellRenderer,
              actionCellRenderer: actionCellRenderer,
            }}
          ></AgGridReact>
        </Box>
      </Layout>
    </>
  );
};

export default page;
