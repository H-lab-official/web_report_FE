import { Box, Text, Table, Thead, Tbody, Tfoot, Tr, Th, TableCaption, TableContainer } from '@chakra-ui/react';
import TableRow from './components/TableRow';
import TableRowUsers from './components/TableRowUsers';
import TableRowContentPopup from './components/TableRowContentPopup'
import ContentPopupTable from './components/ContentPopupTable'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
function App() {
  const Ones = [
    { id: 1, log_content: 'login_page', name_page: 'หน้า LOG-IN' },
    // { id: 2, log_content: 'login_page', name_page: 'หน้า PDPA' },
    // { id: 3, log_content: 'login_page', name_page: 'หน้า VDO' },

    { id: 2, log_content: 'logout_page', name_page: 'button - LOGOUT' },

  ];
  const HOME = [

    { id: 7, log_content: 'login_page', name_page: 'Button - My Goal' },
    { id: 8, log_content: 'login_page', name_page: 'Training Journey' },
    { id: 9, log_content: 'login_page', name_page: 'ตำแหน่งของคุณ' },
    { id: 10, log_content: 'login_page', name_page: 'Contact AL / AVP /AE' },
  ];
  const Training = [

    { id: 11, log_content: 'login_page', name_page: 'หมวดหมู่หลักสูตร' },
    { id: 12, log_content: 'login_page', name_page: 'หมวดหมู่หลักสูตร (overall)' },
    { id: 13, log_content: 'login_page', name_page: 'ตารางอบรม' },
    { id: 14, log_content: 'login_page', name_page: 'ตารางสอบ' },
  ]
  const product = [

    { id: 15, log_content: 'login_page', name_page: 'หมวดหมูของ Product' },
    { id: 16, log_content: 'login_page', name_page: 'หมวดหมูของ Product (overall)' },
  ]
  const news = [

    { id: 17, log_content: 'login_page', name_page: 'หมวดหมู่ข่าว,ตารางกิจกรรม/กิจกรรม' },

  ]
  const Tools = [
    { id: 18, log_content: 'login_page', name_page: 'หมวดหมู่ Tools' },
    { id: 19, log_content: 'login_page', name_page: 'หมวดหมู่ข้อมูลบริษัท' },
    { id: 20, log_content: 'login_page', name_page: 'หมวดหมู่ติดต่อ' },
    { id: 21, log_content: 'login_page', name_page: 'หมวดหมู่ COC' },
    { id: 22, log_content: 'login_page', name_page: 'หมวดหมู่ Tutorials' },

  ]
  const member = [
    { id: 23, log_content: 'login_page', name_page: 'ช่องเสิร์จชื่อ / เลข account  Member ' },
    { id: 24, log_content: 'login_page', name_page: 'New User ที่ไม่เคย log in มาก่อน  Member ' },

  ]
  const admin = [
    { id: 25, log_content: 'login_page', name_page: 'ช่องเสิร์จชื่อ / เลข account Staff / Admin' },

  ]
  const like = [
    { id: 26, log_content: 'login_page', name_page: ' LIKE / DISLIKE / SHARE / FAV เลือกหัวข้อ' },
  ]
  return (
    <Box className='flex flex-col justify-center items-center gap-10  w-full'>
      <Text fontSize='xl'>Report</Text>
      <Tabs variant='enclosed' size='lg'>
        <TabList>
          <Tab>One</Tab>
          <Tab>HOME</Tab>
          <Tab>Training</Tab>
          <Tab>Product</Tab>
          <Tab>News</Tab>
          <Tab>Tools</Tab>
          <Tab>User</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>No.</Th>
                    <Th>log_content </Th>
                    <Th>userID</Th>
                    <Th>Name</Th>
                    <Th>current_rank</Th>
                    <Th>PDPA Status/Vdo Status</Th>
                    <Th>Start Date</Th>
                    <Th>End Date</Th>
                    <Th>Active</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Ones.map(one => (
                    <TableRow
                      key={one.id}
                      id={one.id}
                      log_content={one.log_content}
                      name_page={one.name_page} />
                  ))}
                  <TableRowUsers id={3} lablename='หน้า PDPA' />
                  <TableRowUsers id={4} lablename='หน้า VDO' />

                </Tbody>

              </Table>
            </TableContainer>

            <ContentPopupTable />
          </TabPanel>
          <TabPanel>
            <p>HOME</p>
          </TabPanel>
          <TabPanel>
            <p>Training</p>
          </TabPanel>
          <TabPanel>
            <p>Product</p>
          </TabPanel>
          <TabPanel>
            <p>News</p>
          </TabPanel>
          <TabPanel>
            <p>Tools</p>
          </TabPanel>
          <TabPanel>
            <TableContainer>
              <Table variant='simple'>


              </Table>
            </TableContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>


    </Box>
  );
}

export default App;
