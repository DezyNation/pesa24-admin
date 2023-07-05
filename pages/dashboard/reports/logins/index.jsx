import React, { useState, useEffect } from 'react'
import {
    Box,
    Text,
    HStack,
    VStack,
    Button
} from '@chakra-ui/react'
import Layout from '../../layout'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import BackendAxios from '@/lib/utils/axios'
import Cookies from 'js-cookie';

const Index = () => {
    const [rowData, setRowData] = useState([

    ])

    const [columnDefs, setColumnDefs] = useState([
        {
          field: "user_id",
          headerName: "User ID",
          width: 100
        },
        {
          field: "name",
          headerName: "Name"
        },
        {
          field: "ip",
          headerName: "Login IP",
          minWidth: 300
        },
        {
          field: "latlong",
          headerName: "Latlong",
          minWidth: 300
        },
        {
          field: "created_at",
          headerName: "Timestamp",
          width: 240
        },
      ])

    useEffect(() => {
        BackendAxios.get('/api/admin/logins/200').then(res => {
            setRowData(res.data)
        }).catch(err => {
          if (err?.response?.status == 401) {
            Cookies.remove("verified");
            window.location.reload();
          }
            console.log(err)
        })
    }, [])
    return (
        <>
            <Layout pageTitle={'Login Reports'}>
                <Box my={16}>
                    <Text pb={2} fontWeight={'semibold'}>Recent Login Activity</Text>
                    <Box
                        rounded={16} overflow={'hidden'}
                        className='ag-theme-alpine ag-theme-pesa24-blue'
                        w={['full']} h={'2xl'}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}

                        >

                        </AgGridReact>
                    </Box>
                </Box>
            </Layout>
        </>
    )
}

export default Index