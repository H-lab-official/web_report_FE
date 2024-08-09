import { useState } from 'react';
import {
  Box, Text, Input, Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer, Button, ButtonGroup
} from '@chakra-ui/react';
import TableRow from './components/TableRow'
function App() {
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  console.log(timeStart);
  console.log('====================================');
  console.log(timeEnd);
  console.log('====================================');
  const rows = [
    { id: 1, page: 'หน้า LOG-IN' },
    { id: 2, page: 'หน้า PDPA' },
    { id: 3, page: 'หน้า VDO' },
    { id: 4, page: 'Content pop Up01..' },
    { id: 5, page: 'Content pop Up02..' },
    { id: 6, page: 'button - LOGOUT' },
    { id: 7, page: 'Button - My Goal' },
    { id: 8, page: 'Training Journey' },
    { id: 9, page: 'ตำแหน่งของคุณ' },
    { id: 10, page: 'Contact AL / AVP /AE' },
    { id: 11, page: 'หมวดหมู่หลักสูตร' },
    { id: 12, page: 'หมวดหมู่หลักสูตร (overall)' },
    { id: 13, page: 'ตารางอบรม' },
    { id: 14, page: 'ตารางสอบ' },
    { id: 15, page: 'หมวดหมูของ Product' },
    { id: 16, page: 'หมวดหมูของ Product (overall)' },
    { id: 17, page: 'หมวดหมู่ข่าว,ตารางกิจกรรม/กิจกรรม' },
    { id: 18, page: 'หมวดหมู่ Tools' },
    { id: 19, page: 'หมวดหมู่ข้อมูลบริษัท' },
    { id: 20, page: 'หมวดหมู่ติดต่อ' },
    { id: 21, page: 'หมวดหมู่ COC' },
    { id: 22, page: 'หมวดหมู่ Tutorials' },
    { id: 23, page: 'ช่องเสิร์จชื่อ / เลข account  Member ' },
    { id: 24, page: 'New User ที่ไม่เคย log in มาก่อน  Member ' },
    { id: 25, page: 'ช่องเสิร์จชื่อ / เลข account Staff / Admin' },
    { id: 26, page: ' LIKE / DISLIKE / SHARE / FAV เลือกหัวข้อ' },

  ]
  return (
    <>
      <Box className='flex flex-col justify-center items-center gap-10 bg-gray-200 w-full'>
        <Text fontSize='xl'>Report</Text>
        <Box className='flex flex-row gap-9 shadow-xl'>
          <Box className='flex flex-col justify-center items-center gap-5 border-2'>
            <Text>Start Date</Text>
            <Input
              placeholder='Select Date and Time'
              size='md'
              type='date'
              onChange={(e) => setTimeStart(e.target.value)}
            />
          </Box>
          <Box className='flex flex-col justify-center items-center gap-5 border-2'>
            <Text>End Date</Text>
            <Input
              placeholder='Select Date and Time'
              size='md'
              type='date'
              onChange={(e) => setTimeEnd(e.target.value)}
            />
          </Box>
        </Box>
        <TableContainer>
          <Table variant='simple'>
            <TableCaption>Imperial to metric conversion factors</TableCaption>
            <Thead>
              <Tr>
                <Th>No.</Th>
                <Th>Data Type</Th>
                <Th>Search by userID</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Active</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map(row => (
                <TableRow
                  key={row.id}
                  id={row.id}
                  page={row.page}

                />
              ))}

            </Tbody>
            <Tfoot>
              <Tr>
                <Th>To convert</Th>
                <Th>into</Th>
                <Th isNumeric>multiply by</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

export default App;
