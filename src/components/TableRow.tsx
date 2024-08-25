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
import { btnStype, btnStypeExcel } from './css/stypeall'
import NProgress from 'nprogress';
import '../components/css/custom-nprogress.css'
import 'nprogress/nprogress.css';
interface TableRowProps {
    id: number;
    log_content: string;
    name_page: string
}

const TableRow: React.FC<TableRowProps> = ({ id, log_content, name_page }) => {
    const [timeStart, setTimeStart] = useState<string>('');
    const [timeEnd, setTimeEnd] = useState<string>('');
    const [userID, setUserID] = useState<string>('');
    const [name, setName] = useState<string>('')
    const [current_rank, setCurrentRank] = useState<string>('')
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; // จำนวนรายการต่อหน้า

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: string }>({ key: '', direction: '' });

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [rankCounts, setRankCounts] = useState<{ [key: string]: number }>({});

    const handleSearch = async () => {
        NProgress.start();  // เริ่มการแสดง nprogress
        setLoading(true);
        setError(null);
        setLogs([]);

        try {
            const response = await axios.get('http://localhost:3000/logs', {
                params: {
                    log_content,
                    startDate: timeStart || undefined,
                    endDate: timeEnd || undefined,
                    user_id: userID || undefined,
                    name: name || undefined,
                    current_rank: current_rank || undefined,
                },
            });

            const formattedLogs = response.data.map((log: any) => ({
                ...log,
                created_at: new Date(log.created_at).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                updated_at: new Date(log.updated_at).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }));

            if (Array.isArray(formattedLogs)) {
                setLogs(formattedLogs);
                countRanks(formattedLogs);
            } else {
                setLogs([]);
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
        setCurrentRank(rank);
        await handleSearch();
    };


    const countRanks = (logs: any[]) => {
        const counts: { [key: string]: number } = {};
        logs.forEach(log => {
            const rank = log.current_rank || 'Unknown';
            counts[rank] = (counts[rank] || 0) + 1;
        });
        setRankCounts(counts);
    };
    const countName = (logs: any[], name: string) => {
        const counts = logs.filter(log => log.name === name).length;
        return counts;
    };

    const totalPages = Math.ceil(logs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = logs.slice(startIndex, endIndex);

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

        const ws = XLSX.utils.json_to_sheet(logs.map((log, index) => ({
            No: startIndex + index + 1,
            log_content: log.log_content,
            userID: log.user_id,
            name: log.name,
            current_rank: log.current_rank,
            startDate: log.created_at,
            endDate: log.updated_at
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Logs");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        const logContentForFileName = log_content ? log_content.replace(/[^a-zA-Z0-9]/g, '_') : 'logs';
        saveAs(data, `${logContentForFileName}.xlsx`);

        NProgress.done();  // สิ้นสุดการแสดง nprogress
    };


    const sortLogs = (key: string) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sortedLogs = [...logs].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setSortConfig({ key, direction });
        setLogs(sortedLogs);
    };
    const nameCount = countName(logs, name);

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
                    <Select placeholder='กรุณาเลือก Rank' value={current_rank} onChange={(e) => setCurrentRank(e.target.value)}>
                        <option value='AG'>AG</option>
                        <option value='AVP'>AVP</option>
                        <option value='DM'>DM</option>
                        <option value='EVP'>EVP</option>
                        <option value='SDM'>SDM</option>
                        <option value='SUM'>SUM</option>
                        <option value='UM'>UM</option>
                        <option value='VP'>VP</option>
                    </Select>

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
                    <Button variant="solid" sx={btnStype} onClick={handleSearch}>
                        Search
                    </Button>
                </Td>
            </Tr>

            <Box>
                <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
                    <ModalOverlay />
                    <ModalContent>
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
                            ) : logs.length === 0 ? (
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
                                                    <Th>log_content </Th>
                                                    <Th>AGENCY code <ArrowUpDownIcon onClick={() => sortLogs('user_id')} className='cursor-pointer' /></Th>
                                                    <Th>Full name <ArrowUpDownIcon onClick={() => sortLogs('name')} className='cursor-pointer' /></Th>
                                                    <Th>Position<ArrowUpDownIcon onClick={() => sortLogs('current_rank')} className='cursor-pointer' /></Th>
                                                    <Th>created_at <ArrowUpDownIcon onClick={() => sortLogs('created_at')} className='cursor-pointer' /></Th>
                                                    {/* <Th >End Date <ArrowUpDownIcon onClick={() => sortLogs('updated_at')} className='cursor-pointer' /></Th> */}
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {Array.isArray(currentLogs) && currentLogs.map((log, index) => (
                                                    <Tr key={index}>
                                                        <Td>{startIndex + index + 1}</Td>
                                                        <Td>{log.log_content}</Td>
                                                        <Td>{log.user_id}</Td>
                                                        <Td>{log.name}</Td>
                                                        <Td>{log.current_rank}</Td>

                                                        <Td>{log.created_at}</Td>
                                                        {/* <Td>{log.updated_at}</Td> */}
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
                            <Box display="flex" justifyContent="center" alignItems="center" gap={5}>
                                <Button variant="solid" sx={btnStypeExcel} onClick={exportToExcel}>
                                    Export to Excel
                                </Button>
                                <Button variant="solid" sx={btnStype} mr={3} onClick={onClose}>
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

export default TableRow;
