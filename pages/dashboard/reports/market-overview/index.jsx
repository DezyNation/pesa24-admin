import React, { useState, useEffect } from 'react'
import Layout from '../../layout'
import { Box, Button, FormControl, FormLabel, HStack, Input, Stack, Text, useToast } from '@chakra-ui/react'
import DataCard from '@/HOC/DataCard'
import { BiRupee } from 'react-icons/bi'
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie'
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const MarketOverview = () => {
    const [data, setData] = useState({})
    const [date, setDate] = useState("")
    const [loading, setLoading] = useState(false)
    const Toast = useToast({ position: 'top-right' })


    const [openingRowData, setOpeningRowData] = useState([])
    const [closingRowData, setClosingRowData] = useState([])
    const [columnDefs, setColumnDefs] = useState([
        {
            field: "id",
            headerName: "Rec. ID",
            width: 100,
            suppressMovable: true
        },
        {
            field: "transaction_id",
            headerName: "Trnxn ID",
            width: 120,
            suppressMovable: true
        },
        {
            field: "user_id",
            headerName: "User",
            cellRenderer: 'userCellRenderer',
            width: 160,
            suppressMovable: true
        },
        {
            field: "transaction_for",
            headerName: "Description",
            width: 160,
            suppressMovable: true
        },
        {
            field: "metadata",
            headerName: "Status",
            cellRenderer: 'statusCellRenderer',
            width: 100,
            suppressMovable: true
        },
        {
            field: "credit_amount",
            headerName: "Credit",
            cellRenderer: 'creditCellRenderer',
            width: 100,
            suppressMovable: true
        },
        {
            field: "debit_amount",
            headerName: "Debit",
            cellRenderer: 'debitCellRenderer',
            width: 100,
            suppressMovable: true
        },
        {
            field: "opening_balance",
            headerName: "Opening Balance",
            width: 100,
            suppressMovable: true
        },
        {
            field: "closing_balance",
            headerName: "Closing Balance",
            width: 100,
            suppressMovable: true
        },
        {
            field: "created_at",
            headerName: "Created At",
            width: 120,
            suppressMovable: true
        },
        {
            field: "updated_at",
            headerName: "Updated At",
            width: 120,
            suppressMovable: true
        },
    ])

    function fetchData() {
        if (!data) return
        setLoading(true)
        BackendAxios.get(`/api/admin/market-overview?date=${date}`).then(res => {
            setLoading(false)
            setData({
                opening_balance: res.data.opening_balance,
                closing_balance: res.data.closing_balance
            })
            setOpeningRowData(res.data.opening_transactions)
            setClosingRowData(res.data.closing_transactions)
        }).catch(err => {
            setLoading(false)
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
        })
    }

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
                ({params.data.user_id}) {params.data.user_name} - {params.data.user_phone}
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

    useEffect(()=>{
        fetchData()
    },[])

    return (
        <>
            <Layout pageTitle={'Market Overview'}>
                <HStack gap={4} alignItems={'flex-end'}>
                    <FormControl w={['full', 'xs']}>
                        <FormLabel>Select Date to Get Market Overview</FormLabel>
                        <Input type='date' name='date' onChange={e => setDate(e.target.value)} bgColor={'#FFF'} />
                    </FormControl>
                    <Button colorScheme='twitter' isLoading={loading} onClick={fetchData}>Search</Button>
                </HStack>
                <br /><br />
                <Stack w={'full'} gap={6} direction={['column', 'row']}>
                    {/* <DataCard
                        title={"Opening Balance"}
                        data={data?.opening_balance}
                        icon={<BiRupee color="#FF7B54" size={"32"} />}
                        color={"#FF7B54"}
                    /> */}
                    <DataCard
                        title={"Closing Balance"}
                        data={data?.closing_balance}
                        icon={<BiRupee color="#FF7B54" size={"32"} />}
                        color={"#FF7B54"}
                    />
                </Stack>
                <br /><br />
                <Stack w={'full'} gap={6} direction={['column', 'row']} justifyContent={'space-between'}>
                    {/* <Box
                        rounded={16}
                        overflow={"hidden"}
                        className="ag-theme-alpine ag-theme-pesa24-blue"
                        w={"full"}
                        h={["sm", "md"]}
                    >
                        <Text fontSize={'lg'} py={4}>Opening Transactions</Text>
                        <AgGridReact
                            columnDefs={columnDefs}
                            rowData={openingRowData}
                            defaultColDef={{
                                resizable: true,
                                suppressMovable: true
                            }}
                            components={{
                                creditCellRenderer: creditCellRenderer,
                                debitCellRenderer: debitCellRenderer,
                                userCellRenderer: userCellRenderer,
                                statusCellRenderer: statusCellRenderer,
                            }}
                        ></AgGridReact>
                    </Box> */}

                    <Box
                        rounded={16}
                        overflow={"hidden"}
                        className="ag-theme-alpine ag-theme-pesa24-blue"
                        w={"full"}
                        h={["sm", "md"]}
                    >
                        <Text fontSize={'lg'} py={4}>Closing Transactions</Text>
                        <AgGridReact
                            columnDefs={columnDefs}
                            rowData={closingRowData}
                            defaultColDef={{
                                resizable: true,
                                suppressMovable: true
                            }}
                            components={{
                                creditCellRenderer: creditCellRenderer,
                                debitCellRenderer: debitCellRenderer,
                                userCellRenderer: userCellRenderer,
                                statusCellRenderer: statusCellRenderer,
                            }}
                        ></AgGridReact>
                    </Box>
                </Stack>
            </Layout>
        </>
    )
}

export default MarketOverview