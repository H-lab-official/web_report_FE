import { useState } from 'react';
import { Box, Text, Table, Thead, Tbody, Tfoot, Tr, Th, TableCaption, TableContainer, Img, Flex, Td, Select } from '@chakra-ui/react';
import TableRow from './components/TableRow';
import TableRowUsers from './components/TableRowUsers';

import ContentPopupTable from './components/ContentPopupTable'
import TableRowGoal from './components/TableRowGoal'

import { Tabs, TabList, TabPanels, Tab, TabPanel, Image } from '@chakra-ui/react'
import Logo from './assets/images/LOGO.png'
import { selectedTabStyle, hoverTabStyle, normalTabStyle } from './components/css/stypeall'
import TableRowTraining from './components/TableRowTraining'
import TableRowProducts from './components/TableRowProducts'
import TableRowUsersPosition from './components/TableRowUsersPosition'
import TableRowNews from './components/TableRowNews'
import TableRowActivitys from './components/TableRowActivitys'
import TableRowExam from './components/TableRowEXAM'

import Bar from '@/components/Bar'
function App() {
  const Ones = [
    { id: 1, log_content: 'login_page', name_page: 'หน้า LOG-IN' },


    { id: 2, log_content: 'logout_page', name_page: 'หน้า LOG-OUT' },

  ];
  const HOME = [
    { id: 2, log_content: 'Home_menu', name_page: 'Home_menu' },
    { id: 2, log_content: 'License_icon', name_page: 'License_icon' },
    { id: 2, log_content: 'License Download_button', name_page: 'License Download_button' },
    { id: 2, log_content: 'เลือกเป้าหมายของคุณ_button', name_page: 'เลือกเป้าหมายของคุณ_button' },
    { id: 2, log_content: 'บันทึกเป้าหมาย_Button', name_page: 'บันทึกเป้าหมาย_Button' },
    { id: 2, log_content: 'กดยืนยันเมื่อทำสำเร็จ_Button', name_page: 'กดยืนยันเมื่อทำสำเร็จ_Button' },
    { id: 2, log_content: 'ดูเส้นทางฝึกฝนเพิ่มเติม_button', name_page: 'ดูเส้นทางฝึกฝนเพิ่มเติม_button' },
    { id: 2, log_content: 'Start_icon', name_page: 'Start_icon' },
    { id: 2, log_content: 'หลักสูตร CL/ RLC_icon', name_page: 'หลักสูตร CL/ RLC_icon' },
    { id: 2, log_content: 'หลักสูตร smart start_icon', name_page: 'หลักสูตร smart start_icon' },
    { id: 2, log_content: 'หลักสูตร High Productivity Agent_icon', name_page: 'หลักสูตร High Productivity Agent_icon' },
    { id: 2, log_content: 'หลักสูตร Smart Selling Skills_icon', name_page: 'หลักสูตร Smart Selling Skills_icon' },
    { id: 2, log_content: 'Bridge to success_icon', name_page: 'Bridge to success_icon' },
    { id: 2, log_content: 'Pre AL_icon', name_page: 'Pre AL_icon' },
    { id: 2, log_content: 'FINANCIAL ADVISOR_icon', name_page: 'FINANCIAL ADVISOR_icon' },
    { id: 2, log_content: 'Openhouse_icon', name_page: 'Openhouse_icon' },
    { id: 2, log_content: 'Unit-Linked life policy_icon', name_page: 'Unit-Linked life policy_icon' },
    { id: 2, log_content: 'UL Product and Sales process_icon', name_page: 'UL Product and Sales process_icon' },
    { id: 2, log_content: 'Active UL_icon', name_page: 'Active UL_icon' },
    { id: 2, log_content: 'Fulltime Development Program_icon', name_page: 'Fulltime Development Program_icon' },
    { id: 2, log_content: 'Blue Star Program_icon', name_page: 'Blue Star Program_icon' },
    { id: 2, log_content: 'Blue StarX Program_icon', name_page: 'Blue StarX Program_icon' },
    { id: 2, log_content: 'New UM_icon', name_page: 'New UM_icon' },
    { id: 2, log_content: 'AL orientation_icon', name_page: 'AL orientation_icon' },
    { id: 2, log_content: 'First time Management_icon', name_page: 'First time Management_icon' },
    { id: 2, log_content: 'New AL Weekly Meeting_icon', name_page: 'New AL Weekly Meeting_icon' },
    { id: 2, log_content: 'Insurance Business Owner_icon', name_page: 'Insurance Business Owner_icon' },
    { id: 2, log_content: 'Pre AVP_icon', name_page: 'Pre AVP_icon' },
    { id: 2, log_content: 'New AVP_icon', name_page: 'New AVP_icon' },
    { id: 2, log_content: 'New GM and AVP Orientation_icon', name_page: 'New GM and AVP Orientation_icon' },
    { id: 2, log_content: 'AVP Hero_icon', name_page: 'AVP Hero_icon' },
    { id: 2, log_content: 'New AVP Weekly Meeting_icon', name_page: 'New AVP Weekly Meeting_icon' },
    { id: 2, log_content: 'ดูเส้นทางอาชีพเพิ่มเติม_button', name_page: 'ดูเส้นทางอาชีพเพิ่มเติม_button' },
    { id: 2, log_content: 'AG_Journey', name_page: 'AG_Journey' },
    { id: 2, log_content: 'UM_Journey', name_page: 'UM_Journey' },
    { id: 2, log_content: 'SUM_Journey', name_page: 'SUM_Journey' },
    { id: 2, log_content: 'DM_Journey', name_page: 'DM_Journey' },
    { id: 2, log_content: 'SDM_Journey', name_page: 'SDM_Journey' },
    { id: 2, log_content: 'AVP_Journey', name_page: 'AVP_Journey' },
    { id: 2, log_content: 'VP_Journey', name_page: 'VP_Journey' },
    { id: 2, log_content: 'EVP_Journey', name_page: 'EVP_Journey' },
    { id: 2, log_content: 'SEVP_Journey', name_page: 'SEVP_Journey' }
  ];



  const Tools = [
    { id: 1, log_content: 'Tools_button', name_page: 'หมวดหมู่ Tools' },
    { id: 2, log_content: 'ข้อมูลบริษัท_button', name_page: 'หมวดหมู่ข้อมูลบริษัท' },
    { id: 3, log_content: 'ติดต่อ_button', name_page: 'หมวดหมู่ติดต่อ' },
    { id: 4, log_content: 'COC_button', name_page: 'หมวดหมู่ COC' },
    { id: 5, log_content: 'Tutorials_button', name_page: 'หมวดหมู่ Tutorials' },

  ]


  const [selectedLogContent, setSelectedLogContent] = useState(HOME[0].log_content);

  const handleLogContentChange = (event: any) => {
    setSelectedLogContent(event.target.value);
  };

  return (
    <Box className='flex flex-col justify-start items-center gap-10   text-[#0E2B81] w-full mx-auto px-5'>
      <Box className='flex flex-col w-full mt-8 ml-10'>
        <Box className='text-[#0E2B81] flex flex-row justify-start items-center gap-5'><Image src={Logo} className='w-10 h-10' /><Box><Text as='b' fontSize='3xl'>AGENCY JOURNEY</Text> <Text fontSize='sm'>ALLIANZ ON BOARDING</Text></Box></Box>

      </Box>
      <Text fontSize='3xl' as='b'>Report</Text>
      {/* <NavBar /> */}
      <Tabs variant='soft-rounded' size='lg' colorScheme='blue' w="100%">
        <TabList>
          <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >Dashboard</Tab>
          <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >หน้า LOG-IN</Tab>
          <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >HOME</Tab>
          <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >Training</Tab>
          <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >Product</Tab>
          <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >News</Tab>
          <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >Tools</Tab>
          {/* <Tab
            _selected={selectedTabStyle}
            _hover={hoverTabStyle}
            {...normalTabStyle}
            flex="1"
            textAlign="center"
          >User</Tab> */}
        </TabList>
        <TabPanels w="100%">
          <TabPanel>
            <Bar />
            {/* <LoginAndLogoutChart/>
            <ButtonChart />
            <IconChart />
            <MenuChart />
            <Top20Chart /> */}
            {/* <LoginChart /> */}
          </TabPanel>
          <TabPanel>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>No.</Th>
                    <Th>DATA Type</Th>
                    <Th>Search By AGENCY code</Th>
                    <Th>Search By Name</Th>
                    <Th>Position</Th>
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
                <Tr className='bg-slate-400 rounded-lg'>
                  <Td colSpan={9} className='border border-gray-500 bg-slate-400 rounded-lg  py-2'>
                    <Text className='text-white font-semibold text-center'>All Content POP</Text>
                  </Td>
                </Tr>


              </Table>
            </TableContainer>
            <ContentPopupTable />

          </TabPanel>
          <TabPanel>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>No.</Th>
                    <Th>DATA Type</Th>
                    <Th>Search By AGENCY code</Th>
                    <Th>Search By Name</Th>
                    <Th>Position</Th>
                    <Th></Th>
                    <Th>Start Date</Th>
                    <Th>End Date</Th>
                    <Th>Active</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr className='bg-slate-400 rounded-lg'>
                    <Td colSpan={9} className='border border-gray-500 bg-slate-400 rounded-lg  py-2'>
                      <Text className='text-white font-semibold text-center'>My Goal</Text>
                    </Td>
                  </Tr>
                  <TableRowGoal id={1} name_page="My Goal" />
                  <Tr className='bg-slate-400 rounded-lg'>
                    <Td colSpan={9} className='border border-gray-500 bg-slate-400 rounded-lg  py-2'>
                      <Text className='text-white font-semibold text-center'>Training Journey</Text>
                    </Td>
                  </Tr>

                  <Tr>
                    <Td>กรุณาเลือกหัวข้อ</Td>
                    <Td>
                      <Select
                        value={selectedLogContent}
                        onChange={handleLogContentChange}
                        placeholder="Select log content"
                      >
                        {HOME.map(one => (
                          <option key={one.id} value={one.log_content}>
                            {one.name_page}
                          </option>
                        ))}
                      </Select>
                    </Td>
                    <Td>{HOME.find(one => one.log_content === selectedLogContent)?.name_page || 'N/A'}</Td>
                  </Tr>
                </Tbody>
                <Tbody>
                  {HOME.filter(one => one.log_content === selectedLogContent).map(one => (
                    <TableRow
                      key={one.id}
                      id={one.id}
                      log_content={one.log_content}
                      name_page={one.name_page}
                    />
                  ))}
                </Tbody>
                <Tr className='bg-slate-400 rounded-lg'>
                  <Td colSpan={9} className='border border-gray-500 bg-slate-400 rounded-lg  py-2'>
                    <Text className='text-white font-semibold text-center'>Your Position</Text>
                  </Td>
                </Tr>
                <TableRowUsersPosition id={3} lablename='ตำแหน่งของคุณ' />
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr className='bg-slate-400 rounded-lg'>
                    <Td colSpan={9} className='border border-gray-500 bg-slate-400 rounded-lg  py-2'>
                      <Text className='text-white font-semibold text-center'>Training</Text>
                    </Td>

                  </Tr>
                  <TableRowTraining id={1} name_page="Training" />
                  <Tr className='bg-slate-400 rounded-lg'>
                    <Td colSpan={9} className='border border-gray-500 bg-slate-400 rounded-lg  py-2'>
                      <Text className='text-white font-semibold text-center'>|</Text>
                    </Td>

                  </Tr>
                  <Tr>
                    <Th>No.</Th>
                    <Th>log_content</Th>
                    <Th>TITLE</Th>
                    <Th>Name</Th>
                    <Th>DATE START</Th>
                    <Th>DATE END</Th>
                    <Th>Active</Th>
                  </Tr>
                </Thead>

                <TableRowExam id={2} type='สอบ' name_page='ตารางสอบ' />
                <TableRowExam id={3} type='อบรม' name_page='ตารางอบรม' />
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <TableContainer>
              <Table className='w-[1440px]'>
                <Thead>
                  <Tr>
                    <Th>No.</Th>
                    <Th>log_content </Th>
                    <Th>Title</Th>
                    <Th>Active</Th>
                  </Tr>
                </Thead>
                <TableRowProducts id={1} name_page="Product" />

              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th>No.</Th>
                    <Th>log_content </Th>
                    <Th>หัวข้อ</Th>

                    <Th>Active</Th>
                  </Tr>
                </Thead>
                <TableRowNews id={1} name_page="News" />
                <TableRowActivitys id={2} name_page='Activitys' />
              </Table>
            </TableContainer>
          </TabPanel>
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
                {Tools.map(one => (
                  <TableRow
                    key={one.id}
                    id={one.id}
                    log_content={one.log_content}
                    name_page={one.name_page} />
                ))}
              </Table>
            </TableContainer>
          </TabPanel>
          {/* <TabPanel>
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
                <TableRowGoal id={1} name_page="My Goal" />
                <TableRowUsers id={4} lablename='หน้า VDO' />
              </Table>
            </TableContainer>
          </TabPanel> */}
        </TabPanels>
      </Tabs>


    </Box>
  );
}

export default App;
