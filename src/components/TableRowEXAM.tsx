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
    ButtonGroup, Text, Badge
} from '@chakra-ui/react';
import { ArrowUpDownIcon } from '@chakra-ui/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import './css/TableRow.css';
import Pagination from './Pagination';
import { btnStype, btnStypeExcel } from './css/stypeall';

interface TableRowProps {
    id: number;
    type: string;
    name_page: string;
}

const TableRowExam: React.FC<TableRowProps> = ({ id, type, name_page }) => {
    const [title, setTitle] = useState<string>('');
    const [timeEnd, setTimeEnd] = useState<string>('');
    const [userID, setUserID] = useState<string>('');
    const [name, setName] = useState<string>('');

    // State variables for the additional parameters
    const [userLike, setUserLike] = useState<string>('');
    const [userDislike, setUserDislike] = useState<string>('');
    const [userShare, setUserShare] = useState<string>('');
    const [userFav, setUserFav] = useState<string>('');
    const [userView, setUserView] = useState<string>('');
    const [logRating, setLogRating] = useState<string>('');
    const [locationDetail, setLocationDetail] = useState<string>('');
    const [linkMap, setLinkMap] = useState<string>('');
    const [linkOut, setLinkOut] = useState<string>('');

    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: string }>({ key: '', direction: '' });

    const { isOpen, onOpen, onClose } = useDisclosure();

    // State to manage selected items for modals
    const [selectedLikes, setSelectedLikes] = useState<string[]>([]);
    const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
    const [selectedShares, setSelectedShares] = useState<{ [key: string]: any }>({});
    const [selectedFavs, setSelectedFavs] = useState<{ [key: string]: any }>({});
    const [selectedViews, setSelectedViews] = useState<any[]>([]);
    const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

    // State for user data mapping
    const [likedUsers, setLikedUsers] = useState<{ [key: string]: string }>({});
    const [dislikedUsers, setDislikedUsers] = useState<{ [key: string]: string }>({});
    const [sharedUsers, setSharedUsers] = useState<{ [key: string]: string }>({});
    const [favUsers, setFavUsers] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (selectedLikes.length > 0) fetchUserDetails(selectedLikes, setLikedUsers);
        if (selectedDislikes.length > 0) fetchUserDetails(selectedDislikes, setDislikedUsers);
        if (Object.keys(selectedFavs).length > 0) fetchUserDetails(Object.keys(selectedFavs), setFavUsers);
        if (Object.keys(selectedShares).length > 0) fetchUserDetails(Object.keys(selectedShares), setSharedUsers);
        if (selectedViews.length > 0) fetchUserDetails(selectedViews.map(view => view.userId), setLikedUsers);
    }, [selectedLikes, selectedDislikes, selectedFavs, selectedShares, selectedViews]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setLogs([]);

        try {
            const response = await axios.get('http://localhost:3000/appointments', {
                params: {
                    type,
                    title: title || undefined,
                    endDate: timeEnd || undefined,
                    user_id: userID || undefined,
                    name: name || undefined,
                    user_like: userLike || undefined,
                    user_dislike: userDislike || undefined,
                    user_share: userShare || undefined,
                    user_fav: userFav || undefined,
                    user_view: userView || undefined,
                    log_rating: logRating || undefined,
                    location_detail: locationDetail || undefined,
                    link_map: linkMap || undefined,
                    link_out: linkOut || undefined,
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
            } else {
                setLogs([]);
            }
        } catch (err) {
            setError('Error fetching logs');
        } finally {
            setLoading(false);
            onOpen();
        }
    };

    const fetchUserDetails = async (userIds: string[], setUserState: (users: { [key: string]: string }) => void) => {
        try {
            const responses = await Promise.all(
                userIds.map(userId =>
                    axios.get(`http://localhost:3000/users`, { params: { user_id: userId } })
                )
            );

            const userMap: { [key: string]: string } = {};
            responses.forEach((response) => {
                if (response.data.length > 0) {
                    const user = response.data[0];
                    userMap[user.id] = user.name;
                }
            });

            setUserState(userMap);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleShowLikes = (likes: string[]) => {
        setSelectedLikes(likes);
    };

    const handleShowDislikes = (dislikes: string[]) => {
        setSelectedDislikes(dislikes);
    };

    const handleShowShares = (shares: any) => {
        setSelectedShares(shares);
    };

    const handleShowFavs = (favs: any) => {
        setSelectedFavs(favs);
    };

    const handleShowViews = async (views: any) => {
        const viewDetails = await Promise.all(
            Object.entries(views).map(async ([userId, viewData]) => {
                const response = await axios.get(`http://localhost:3000/users`, { params: { user_id: userId } });
                const userName = response.data.length > 0 ? response.data[0].name : 'Unknown';
                return {
                    userId,
                    userName,
                    viewCount: Object.keys(viewData).length,
                    lastView: viewData[Object.keys(viewData).pop()].datetime
                };
            })
        );

        setSelectedViews(viewDetails);
        setViewModalOpen(true);
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
        const ws = XLSX.utils.json_to_sheet(logs.map((log, index) => ({
            No: startIndex + index + 1,
            title: log.title,
            userID: log.user_id,
            name: log.name,
            created_at: log.created_at,
            updated_at: log.updated_at,
            user_like: log.user_like,
            user_dislike: log.user_dislike,
            user_share: log.user_share,
            user_fav: log.user_fav,
            user_view: log.user_view,
            log_rating: log.log_rating,
            location_detail: log.location_detail,
            link_map: log.link_map,
            link_out: log.link_out,
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Logs");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "logs.xlsx");
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

    return (
        <>
            <Tr>
                <Td>{id}</Td>
                <Td>{name_page}</Td>
                <Td>
                    <Input
                        placeholder="สถานที่สอบ"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                    <Button variant="solid" sx={btnStype} onClick={handleSearch}>
                        Search
                    </Button>
                </Td>
            </Tr>

            <Box>
                <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{name_page}</ModalHeader>
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
                                    <TableContainer>
                                        <Table variant='simple'>
                                            <Thead>
                                                <Tr>
                                                    <Th>No.</Th>
                                                    <Th>Title</Th>

                                                    <Th>Created At <ArrowUpDownIcon onClick={() => sortLogs('created_at')} className='cursor-pointer' /></Th>

                                                    <Th>User Like</Th>
                                                    <Th>User Dislike</Th>
                                                    <Th>User Share</Th>
                                                    <Th>User Fav</Th>
                                                    <Th>User View</Th>
                                                   
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {Array.isArray(currentLogs) && currentLogs.map((log, index) => (
                                                    <Tr key={index}>
                                                        <Td>{startIndex + index + 1}</Td>
                                                        <Td className="max-w-[320px] p-2 ">
                                                            <p className="whitespace-pre-line break-words">
                                                                {log.title}
                                                            </p>
                                                        </Td>


                                                        <Td>{log.created_at}</Td>

                                                        <Td>
                                                            <Badge
                                                                colorScheme="blue"
                                                                cursor="pointer"
                                                                onClick={() => handleShowLikes(log.user_like ? JSON.parse(log.user_like) : [])}
                                                            >
                                                                {log.user_like ? JSON.parse(log.user_like).length : 0}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Badge
                                                                colorScheme="blue"
                                                                cursor="pointer"
                                                                onClick={() => handleShowDislikes(log.user_dislike ? JSON.parse(log.user_dislike) : [])}
                                                            >
                                                                {log.user_dislike ? JSON.parse(log.user_dislike).length : 0}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Badge
                                                                colorScheme="blue"
                                                                cursor="pointer"
                                                                onClick={() => handleShowShares(log.user_share ? JSON.parse(log.user_share) : {})}
                                                            >
                                                                {log.user_share ? Object.keys(JSON.parse(log.user_share)).length : 0}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Badge
                                                                colorScheme="blue"
                                                                cursor="pointer"
                                                                onClick={() => handleShowFavs(log.user_fav ? JSON.parse(log.user_fav) : {})}
                                                            >
                                                                {log.user_fav ? Object.keys(JSON.parse(log.user_fav)).length : 0}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Badge
                                                                colorScheme="blue"
                                                                cursor="pointer"
                                                                onClick={() => handleShowViews(log.user_view ? JSON.parse(log.user_view) : {})}
                                                            >
                                                                {log.user_view ? Object.keys(JSON.parse(log.user_view)).length : 0}
                                                            </Badge>
                                                        </Td>

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

            {/* Modal for showing liked users */}
            <Modal size={'lg'} isOpen={selectedLikes.length > 0} onClose={() => setSelectedLikes([])}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Liked Users</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedLikes.length > 0 ? (
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>User ID</Th>
                                            <Th>Name</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {selectedLikes.map((userId, index) => (
                                            <Tr key={index}>
                                                <Td>{userId}</Td>
                                                <Td>{likedUsers[userId] || 'Unknown'}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Text>No liked users found.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={() => setSelectedLikes([])}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal for showing disliked users */}
            <Modal size={'lg'} isOpen={selectedDislikes.length > 0} onClose={() => setSelectedDislikes([])}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Disliked Users</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedDislikes.length > 0 ? (
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>User ID</Th>
                                            <Th>Name</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {selectedDislikes.map((userId, index) => (
                                            <Tr key={index}>
                                                <Td>{userId}</Td>
                                                <Td>{dislikedUsers[userId] || 'Unknown'}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Text>No disliked users found.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={() => setSelectedDislikes([])}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal to show shared users */}
            <Modal isOpen={Object.keys(selectedShares).length > 0} onClose={() => setSelectedShares({})}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Shared Users</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {Object.keys(selectedShares).length > 0 ? (
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>User ID</Th>
                                            <Th>Name</Th>
                                            <Th>Share Details</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {Object.keys(selectedShares).map((userId, index) => (
                                            <Tr key={index}>
                                                <Td>{userId}</Td>
                                                <Td>{sharedUsers[userId] || 'Unknown'}</Td>
                                                <Td>
                                                    {Object.values(selectedShares[userId]).map((share: any, i: number) => (
                                                        <Box key={i}>
                                                            <Text>Time: {share.datetime}</Text>
                                                            <Text>Social: {share.social}</Text>
                                                        </Box>
                                                    ))}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Text>No shared data found.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={() => setSelectedShares({})}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal for showing viewed users with pagination */}
            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} size="4xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>View Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>User ID</Th>
                                        <Th>Name</Th>
                                        <Th>View Count</Th>
                                        <Th>Last View</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {selectedViews.map((view, index) => (
                                        <Tr key={index}>
                                            <Td>{view.userId}</Td>
                                            <Td>{view.userName}</Td>
                                            <Td>{view.viewCount}</Td>
                                            <Td>{view.lastView}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={() => setViewModalOpen(false)} ml={3}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default TableRowExam;
