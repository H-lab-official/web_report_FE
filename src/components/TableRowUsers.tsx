import { useState, useEffect } from 'react';
import {
    Tr, Td, Input, Button, Modal,
    ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton,
    Table, Thead, Tbody, Th, TableContainer,
    Spinner, Alert, AlertIcon, Box, ButtonGroup,
    Text, Select, Badge, useDisclosure
} from '@chakra-ui/react';
import { ArrowUpDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import Pagination from './Pagination';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { btnStype, btnStypeExcel } from './css/stypeall'

import NProgress from 'nprogress';
import '../components/css/custom-nprogress.css'
import 'nprogress/nprogress.css';
interface TableRowProps {
    id: number;
    lablename: string;

}

const TableRowUsers: React.FC<TableRowProps> = ({ id, lablename }) => {
    const [searchName, setSearchName] = useState<string>('');
    const [searchCurrentRank, setSearchCurrentRank] = useState<string>('');
    const [searchPdpa, setSearchPdpa] = useState<string>('');
    const [searchVdo, setSearchVdo] = useState<string>('');
    const [timeStart, setTimeStart] = useState<string>('');
    const [timeEnd, setTimeEnd] = useState<string>('');
    const [userID, setUserID] = useState<string>('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: string }>({ key: '', direction: '' });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [rankCounts, setRankCounts] = useState<{ [key: string]: number }>({});
    console.log(searchPdpa);

    const fetchData = async () => {
        NProgress.start();  // เริ่มการแสดง nprogress
        setLoading(true);
        setError(null);
        setUsers([]);

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
                params: {
                    name: searchName || undefined,
                    current_rank: searchCurrentRank || undefined,
                    check_pdpa: searchPdpa || undefined,
                    check_video_welcome_page: searchVdo || undefined,
                    user_id: userID || undefined,
                    startDate: timeStart || undefined,
                    endDate: timeEnd || undefined,
                },
            });

            if (Array.isArray(response.data)) {
                const formattedUsers = response.data.map((user: any) => ({
                    ...user,
                    created_at: new Date(user.created_at).toLocaleString('th-TH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                }));
                setUsers(formattedUsers);
                countRanks(formattedUsers);
            } else {
                setUsers([]);
            }
        } catch (err) {
            setError('Error fetching user data');
        } finally {
            setLoading(false);
            NProgress.done();  // สิ้นสุดการแสดง nprogress
            onOpen();
        }
    };

    // useEffect(() => {
    //     fetchData();
    // }, [currentPage, searchName, searchCurrentRank, searchPdpa, timeStart, timeEnd, userID]);
    const handleBadgeClick = async (rank: string) => {
        setSearchCurrentRank(rank);
        await fetchData()
    };
    const exportToExcel = () => {
        NProgress.start();  // เริ่มการแสดง nprogress
        const ws = XLSX.utils.json_to_sheet(
            users.map((user, index) => {
                const exportData: any = {
                    No: startIndex + index + 1,
                    userID: user.id,
                    name: user.name,
                    current_rank: user.current_rank,
                    created_at: user.created_at,
                };

                if (lablename === 'หน้า PDPA') {
                    exportData.PDPAStatus = user.check_pdpa === null ? "Not Checked" : "Checked";
                }

                if (lablename === 'หน้า VDO') {
                    exportData.VdoStatus = user.check_video_welcome_page === null ? "Not Checked" : "Checked";
                }

                return exportData;
            })
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        const logContentForFileName = lablename ? lablename.replace(/[^a-zA-Z0-9]/g, '_') : 'logs';
        saveAs(data, `${logContentForFileName}.xlsx`);
        NProgress.done();  // สิ้นสุดการแสดง nprogress
    };

    const countRanks = (users: any[]) => {
        const counts: { [key: string]: number } = {};
        users.forEach(user => {
            const rank = user.current_rank || 'Unknown';
            counts[rank] = (counts[rank] || 0) + 1;
        });
        setRankCounts(counts);
    };

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);


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
    const sortUsers = (key: string) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sortedUsers = [...users].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setSortConfig({ key, direction });
        setUsers(sortedUsers);
    };
    return (
        <>
            <Tr>
                <Td>{id}</Td>
                <Td>{lablename}</Td>
                <Td>
                    <Input
                        placeholder="กรุณาใส่ AGENCY CODE"
                        value={userID}
                        onChange={(e) => setUserID(e.target.value)}
                    />
                </Td>
                <Td>
                    <Input
                        placeholder="กรุณาใส่ ชื่อ (ถ้ามี)"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </Td>
                <Td>
                    <Select
                        placeholder="กรุณาเลือก Rank"
                        value={searchCurrentRank}
                        onChange={(e) => setSearchCurrentRank(e.target.value)}
                    >
                        <option value="AG">AG</option>
                        <option value="AVP">AVP</option>
                        <option value="DM">DM</option>
                        <option value="EVP">EVP</option>
                        <option value="SDM">SDM</option>
                        <option value="SUM">SUM</option>
                        <option value="UM">UM</option>
                        <option value="VP">VP</option>
                    </Select>
                </Td>

                {lablename === 'หน้า PDPA' && <Td>
                    <Select
                        placeholder="All"
                        value={searchPdpa}
                        onChange={(e) => setSearchPdpa(e.target.value)}
                    >
                        <option value="Yes">Checked</option>
                        <option value="NotChecked">Not Checked</option>
                    </Select>
                </Td>}
                {lablename === 'หน้า VDO' &&
                    <Td>
                        <Select
                            placeholder="All"
                            value={searchVdo}
                            onChange={(e) => setSearchVdo(e.target.value)}
                        >
                            <option value="Yes">Checked</option>
                            <option value="NotChecked">Not Checked</option>
                        </Select>
                    </Td>}
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
                    <Button variant="solid" sx={btnStype} onClick={fetchData}>Search</Button>
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
                            ) : users.length === 0 ? (
                                <Box textAlign="center" mt={4}>
                                    <Text>No data found</Text>
                                </Box>
                            ) : (
                                <>
                                    <Box className='flex flex-row justify-center gap-5 mb-5'>
                                        {['AG', 'AVP', 'DM', 'EVP', 'SDM', 'SUM', 'UM', 'VP', 'Unknown'].map(rank => (
                                            <Badge
                                                key={rank}
                                                className='cursor-pointer'
                                                colorScheme={rankCounts[rank] > 0 ? 'green' : 'red'}
                                                onClick={() => handleBadgeClick(rank)}
                                            >
                                                {`${rank}: ${rankCounts[rank] || 0}`}
                                            </Badge>
                                        ))}
                                    </Box>
                                    <TableContainer>
                                        <Table variant='simple'>
                                            <Thead>
                                                <Tr>
                                                    <Th>No.</Th>
                                                    <Th>AGENCY code <ArrowUpDownIcon onClick={() => sortUsers('id')} /></Th>
                                                    <Th>Name <ArrowUpDownIcon onClick={() => sortUsers('name')} /></Th>
                                                    {lablename === 'หน้า PDPA' && <Th>PDPA Status </Th>}
                                                    {lablename === 'หน้า VDO' && <Th>Vdo Status </Th>}
                                                    <Th>Rank <ArrowUpDownIcon onClick={() => sortUsers('current_rank')} /></Th>
                                                    <Th>Created At <ArrowUpDownIcon onClick={() => sortUsers('created_at')} /></Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {currentUsers.map((user, index) => (
                                                    <Tr key={user.id}>
                                                        <Td>{startIndex + index + 1}</Td>
                                                        <Td>{user.id}</Td>
                                                        <Td>{user.name}</Td>
                                                        {lablename === 'หน้า PDPA' && <Td>{user.check_pdpa === null ? 'Not Checked' : "Checked"}</Td>}
                                                        {lablename === 'หน้า VDO' && <Td>{user.check_video_welcome_page === null ? 'Not Checked' : "Checked"}</Td>}
                                                        <Td>{user.current_rank || 'Unknown'}</Td>
                                                        <Td>{user.created_at}</Td>
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
};

export default TableRowUsers;
