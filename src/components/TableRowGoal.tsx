import { useState, useEffect } from 'react';
import {
    Tr, Td, Input, Button, Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton, useDisclosure, Table,
    Thead,
    Tbody,
    Th,
    TableContainer,
    Spinner,
    Alert,
    AlertIcon,
    Box,
    ButtonGroup, Text, Select, Badge
} from '@chakra-ui/react';
import { ArrowUpDownIcon } from '@chakra-ui/icons'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import './css/TableRow.css';
import Pagination from './Pagination';
import {btnStype} from './css/stypeall'
import NProgress from 'nprogress';
import '../components/css/custom-nprogress.css'
import 'nprogress/nprogress.css';
interface TableRowProps {
    id: number;

    name_page: string
}

const TableRowGoal: React.FC<TableRowProps> = ({ id, name_page }) => {
    const [timeStart, setTimeStart] = useState<string>('');
    const [timeEnd, setTimeEnd] = useState<string>('');
    const [userID, setUserID] = useState<string>('');
    const [name, setName] = useState<string>('')
    const [period, setPeriod] = useState<string>('')
    const [goal, setGoal] = useState<string>('')
    const [price, setPrice] = useState<string>('')
    const [status, setStatus] = useState<string>('')
    const [taskStartDate, setTaskStartDate] = useState<string>('')
    const [taskEndDate, setTaskEndDate] = useState<string>('')
    const [mygoal, setMyGoal] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; // จำนวนรายการต่อหน้า

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: string }>({ key: '', direction: '' });

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [rankCounts, setRankCounts] = useState<{ [key: string]: number }>({});
    console.log(mygoal);

    const handleSearch = async () => {
        NProgress.start();  // เริ่มการแสดง nprogress
        setLoading(true);
        setError(null);
        setMyGoal([]);

        try {
            const response = await axios.get('http://localhost:3000/mygoal', {
                params: {

                    // startDate: timeStart || undefined,
                    // endDate: timeEnd || undefined,
                    user_id: userID || undefined,
                    name: name || undefined,
                    period: period || undefined,
                    goal: goal || undefined,
                    price: price || undefined,
                    status: status || undefined,
                    taskStartDate: taskStartDate || undefined,
                    taskEndDate: taskEndDate || undefined

                },
            });



            const formattedLogs = response.data.map((goal: any) => ({
                ...goal,
                created_at: new Date(goal.created_at).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                updated_at: new Date(goal.updated_at).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                date_start: new Date(goal.date_start).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }), date_end: new Date(goal.date_end).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            }));

            if (Array.isArray(formattedLogs)) {
                setMyGoal(formattedLogs);
                countRanks(formattedLogs);
            } else {
                setMyGoal([]);
            }
        } catch (err) {
            setError('Error fetching logs');
        } finally {
            setLoading(false);
            NProgress.done();  // สิ้นสุดการแสดง nprogress
            onOpen();
        }
    };
    const handleBadgeClick = async (rank: any) => {

        await handleSearch();
    };


    const countRanks = (mygoal: any[]) => {
        const counts: { [key: string]: number } = {};
        mygoal.forEach(goal => {
            const rank = goal.current_rank || 'Unknown';
            counts[rank] = (counts[rank] || 0) + 1;
        });
        setRankCounts(counts);
    };
    const countName = (mygoal: any[], name: string) => {
        const counts = mygoal.filter(goal => goal.name === name).length;
        return counts;
    };

    const totalPages = Math.ceil(mygoal.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = mygoal.slice(startIndex, endIndex);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const exportToExcel = () => {
        NProgress.start();  // เริ่มการแสดง nprogress
        const ws = XLSX.utils.json_to_sheet(mygoal.map((goal, index) => ({
            No: startIndex + index + 1,
            userID: goal.user_id,
            name: goal.name,
            // startDate: goal.created_at,
            // endDate: goal.updated_at,

            period: goal.period,
            goal: goal.goal,
            price: goal.price,
            status: goal.status,
            taskStartDate: goal.date_start,
            taskEndDate: goal.date_end


        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "mygoal");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "mygoal.xlsx");
        NProgress.done();  
    };

    const sortLogs = (key: string) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sortedLogs = [...mygoal].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setSortConfig({ key, direction });
        setMyGoal(sortedLogs);
    };
    const nameCount = countName(mygoal, name);
    return (
        <>
            <Tr>
                <Td>{id}</Td>
                <Td>{name_page}</Td>
                <Td>
                    <Input
                        placeholder="กรุณาใส่ User ID (ถ้ามี)"
                        value={userID}
                        onChange={(e) => setUserID(e.target.value)}
                    />
                </Td>
                <Td>
                    <Input
                        placeholder="กรุณาใส่ ชื่อ (ถ้ามี)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Td>
                <Td>


                </Td>
                <Td></Td>
                <Td>
                    <Input
                        placeholder='Select Start Date'
                        size='md'
                        type='date'
                        value={timeStart}
                        onChange={(e) => setTimeStart(e.target.value)}
                    />
                </Td>
                <Td>
                    <Input
                        placeholder='Select End Date'
                        size='md'
                        type='date'
                        value={timeEnd}
                        onChange={(e) => setTimeEnd(e.target.value)}
                    />
                </Td>
                <Td>
                    <Button variant="solid" sx={btnStype}  onClick={handleSearch}>
                        Search
                    </Button>
                </Td>
            </Tr>

            <Box>
                <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
                    <ModalOverlay />
                    <ModalContent className="custom-modal-content">
                        <ModalHeader>Search Results</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {loading ? (
                                <Spinner />
                            ) : error ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            ) : mygoal.length === 0 ? (
                                <Box textAlign="center" mt={4}>
                                    <Text>ไม่พบข้อมูล</Text>
                                </Box>
                            ) : (
                                <>
                                    <Box className='flex flex-row justify-center gap-5 mb-5'>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['AG'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('AG')}>AG: {rankCounts['AG'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['AVP'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('AVP')}>AVP: {rankCounts['AVP'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['DM'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('DM')}>DM: {rankCounts['DM'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['EVP'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('EVP')}>EVP: {rankCounts['EVP'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['SDM'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('SDM')}>SDM: {rankCounts['SDM'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['SUM'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('SUM')}>SUM: {rankCounts['SUM'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['UM'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('UM')}>UM: {rankCounts['UM'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['VP'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('VP')}>VP: {rankCounts['VP'] || 0}</Badge>
                                        <Badge className='cursor-pointer' colorScheme={rankCounts['Unknown'] > 0 ? 'green' : 'red'} onClick={() => handleBadgeClick('')}>Unknown: {rankCounts['Unknown'] || 0}</Badge>
                                    </Box>
                                    <Box className='flex flex-row justify-center gap-5'>
                                        {name && (
                                            <Badge
                                                className='cursor-pointer'
                                                colorScheme={nameCount > 0 ? 'green' : 'red'}
                                            >
                                                {`NAME : ${name} (${nameCount})`}
                                            </Badge>
                                        )}
                                    </Box>
                                    <TableContainer>
                                        <Table variant='simple'>
                                            <Thead>
                                                <Tr>
                                                    <Th>No.</Th>
                                                    <Th>userID <ArrowUpDownIcon onClick={() => sortLogs('user_id')} className='cursor-pointer' /></Th>
                                                    <Th>Name <ArrowUpDownIcon onClick={() => sortLogs('name')} className='cursor-pointer' /></Th>
                                                    <Th>current_rank<ArrowUpDownIcon onClick={() => sortLogs('current_rank')} className='cursor-pointer' /></Th>
                                                    <Th>created_at <ArrowUpDownIcon onClick={() => sortLogs('created_at')} className='cursor-pointer' /></Th>
                                                    <Th>Goal<ArrowUpDownIcon onClick={() => sortLogs('goal')} className='cursor-pointer' /></Th>
                                                    <Th>period<ArrowUpDownIcon onClick={() => sortLogs('period')} className='cursor-pointer' /></Th>
                                                    <Th>price<ArrowUpDownIcon onClick={() => sortLogs('price')} className='cursor-pointer' /></Th>
                                                    <Th>taskStartDate<ArrowUpDownIcon onClick={() => sortLogs('taskStartDate')} className='cursor-pointer' /></Th>
                                                    <Th>taskEndDate<ArrowUpDownIcon onClick={() => sortLogs('taskEndDate')} className='cursor-pointer' /></Th>
                                                    <Th>status<ArrowUpDownIcon onClick={() => sortLogs('status')} className='cursor-pointer' /></Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {Array.isArray(currentLogs) && currentLogs.map((goal, index) => (
                                                    <Tr key={index}>
                                                        <Td>{startIndex + index + 1}</Td>
                                                        <Td>{goal.user_id}</Td>
                                                        <Td>{goal.name}</Td>
                                                        <Td>{goal.current_rank}</Td>
                                                        <Td>{goal.created_at}</Td>
                                                        <Td>{goal.goal}</Td>
                                                        <Td>{goal.period}</Td>
                                                        <Td>{goal.price === "NaN" ? "ไม่ได้ระบุ" : goal.price}</Td>
                                                        <Td>{goal.date_start}</Td>
                                                        <Td>{goal.date_end}</Td>
                                                        <Td>{goal.status === "success" ? <Badge colorScheme="green">สำเร็จแล้ว</Badge> : <Badge colorScheme="red">ยังไม่สำเร็จ</Badge>}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                    <Pagination
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        goToPage={goToPage}
                                        goToPreviousPage={goToPreviousPage}
                                        goToNextPage={goToNextPage}
                                    />

                                </>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Box mt={4} display="flex" justifyContent="center" alignItems="center" gap={5}>
                                <Button colorScheme='green' onClick={exportToExcel}>
                                    Export to Excel
                                </Button>
                                <Button colorScheme='blue' mr={3} onClick={onClose}>
                                    Close
                                </Button>
                            </Box>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </>
    );
}

export default TableRowGoal;
