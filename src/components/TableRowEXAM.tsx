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
    Text, Badge
} from '@chakra-ui/react';
import { ArrowUpDownIcon } from '@chakra-ui/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import '@/components/css/TableRow.css';
import Pagination from '@/components/Pagination';
import { btnStype, btnStypeExcel } from '@/components/css/stypeall';
import NProgress from 'nprogress';
import '../components/css/custom-nprogress.css'
import 'nprogress/nprogress.css';

interface TableRowProps {
    id: number;
    type: string;
    name_page: string;
}

const TableRowExam: React.FC<TableRowProps> = ({ id, type, name_page }) => {
    const [title, setTitle] = useState<string>('');
    const [dateStart, setDateStart] = useState<string>('');
    const [dateEnd, setDateEnd] = useState<string>('');
    const [timeStart, setTimeStart] = useState<string>('');
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
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        const timeParts = timeString.split(':');
        if (timeParts.length !== 2) return '';
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const formattedTime = `${hours.toString().padStart(2, '0')}.${minutes} น.`;
        return formattedTime;
    };
    useEffect(() => {
        if (selectedLikes.length > 0) fetchUserDetails(selectedLikes, setLikedUsers);
        if (selectedDislikes.length > 0) fetchUserDetails(selectedDislikes, setDislikedUsers);
        if (Object.keys(selectedFavs).length > 0) fetchUserDetails(Object.keys(selectedFavs), setFavUsers);
        if (Object.keys(selectedShares).length > 0) fetchUserDetails(Object.keys(selectedShares), setSharedUsers);
        if (selectedViews.length > 0) fetchUserDetails(selectedViews.map(view => view.userId), setLikedUsers);
    }, [selectedLikes, selectedDislikes, selectedFavs, selectedShares, selectedViews]);

    const handleSearch = async () => {
        NProgress.start();
        setLoading(true);
        setError(null);
        setLogs([]);

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/appointments`, {
                params: {
                    type,
                    title: title || undefined,
                    date_start: dateStart || undefined,
                    date_end: dateEnd || undefined,
                    time_start: timeStart || undefined,
                    time_end: timeEnd || undefined,
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
                }), date_start: formatDate(log.date_start),
                date_end: formatDate(log.date_end),

                time_start: formatTime(log.time_start),
                time_end: formatTime(log.time_end),

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
            NProgress.done();
            onOpen();
        }
    };
    const countShares = (shares: any) => {
        const countBySocial: { [key: string]: number } = { line: 0, facebook: 0, copy: 0, twitte: 0, whatsapp: 0 };
        let totalCount = 0;

        for (const userId in shares) {
            for (const shareId in shares[userId]) {
                const share = shares[userId][shareId];
                totalCount++;
                countBySocial[share.social] = (countBySocial[share.social] || 0) + 1;
            }
        }

        return { totalCount, countBySocial };
    };
    const fetchUserDetails = async (userIds: string[], setUserState: (users: { [key: string]: string }) => void) => {
        try {
            const responses = await Promise.all(
                userIds.map(userId =>
                    axios.get(`${import.meta.env.VITE_API_URL}/users`, { params: { user_id: userId } })
                )
            );
            console.log('API Responses:', responses);
            const userMap: { [key: string]: string } = {};
            responses.forEach((response) => {
                if (response.data.length > 0) {
                    const user = response.data[0];
                    userMap[user.id] = user.name;
                }
            });

            console.log('Fetched User Map:', userMap);

            setUserState(userMap);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };


    const handleShowLikes = (likes: string[]) => {
        NProgress.start();
        setSelectedLikes(likes);
        NProgress.done();
    };

    const handleShowDislikes = (dislikes: string[]) => {
        NProgress.start();
        setSelectedDislikes(dislikes);
        NProgress.done();
    };

    const handleShowShares = (shares: any) => {
        NProgress.start();
        setSelectedShares(shares);
        NProgress.done();
    };

    const handleShowFavs = (favs: any) => {
        NProgress.start();
        setSelectedFavs(favs);
        NProgress.done();
    };

    interface ViewData {
        [key: string]: { datetime: string };
    }
    const handleShowViews = async (views: Record<string, ViewData>) => {
        const viewDetails = await Promise.all(
            Object.entries(views).map(async ([userId, viewData]) => {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, { params: { user_id: userId } });
                const userName = response.data.length > 0 ? response.data[0].name : 'Unknown';
                return {
                    userId,
                    userName,
                    viewCount: Object.keys(viewData).length,
                    lastView: viewData[Object.keys(viewData).pop()!].datetime,
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
    console.log(currentLogs);

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
    const handleExport = async () => {
        NProgress.start();
        await exportToExcel();
        NProgress.done();
    };

    const exportToExcel = async () => {

        const fetchUserDetailsForExport = async (userIds: string[]) => {
            try {
                const responses = await Promise.all(
                    userIds.map(userId =>
                        axios.get(`${import.meta.env.VITE_API_URL}/users`, { params: { user_id: userId } })
                    )
                );

                const userMap: { [key: string]: string } = {};
                responses.forEach((response) => {
                    if (response.data.length > 0) {
                        const user = response.data[0];
                        userMap[user.id] = user.name;
                    }
                });
                return userMap;
            } catch (error) {
                console.error('Error fetching user details:', error);
                return {};
            }
        };
        const likedUsersMap = await fetchUserDetailsForExport(
            logs.flatMap(log => JSON.parse(log.user_like || '[]'))
        );
        const dislikedUsersMap = await fetchUserDetailsForExport(
            logs.flatMap(log => JSON.parse(log.user_dislike || '[]'))
        );
        const sharedUsersMap = await fetchUserDetailsForExport(
            logs.flatMap(log => Object.keys(JSON.parse(log.user_share || '{}')))
        );
        const favUsersMap = await fetchUserDetailsForExport(
            logs.flatMap(log => Object.keys(JSON.parse(log.user_fav || '{}')))
        );
        const viewedUsersMap = await fetchUserDetailsForExport(
            logs.flatMap(log => Object.keys(JSON.parse(log.user_view || '{}')))
        );

        const createUserSheet = (
            logs: any[],
            key: string,
            parseFunc: (data: any, log: any, userMap: { [key: string]: string }) => any[],
            userMap: { [key: string]: string }
        ) => {
            const userLogs = logs.flatMap(log => {
                const parsedData = log[key] ? parseFunc(JSON.parse(log[key]), log, userMap) : [];
                return parsedData.map((item: any, index: number) => ({
                    Log_No: startIndex + index + 1,
                    ...item
                }));
            });
            return XLSX.utils.json_to_sheet(userLogs);
        };


        const parseLikesDislikes = (data: string[], log: any, userMap: { [key: string]: string }) =>
            data.map(userId => ({
                Name: userMap[userId] || 'Unknown',
            }));


        const parseShares = (data: any, log: any, userMap: { [key: string]: string }) => {
            const shares = [];
            for (const userId in data) {
                for (const shareId in data[userId]) {
                    const share = data[userId][shareId];
                    shares.push({
                        Name: userMap[userId] || 'Unknown',
                        Time: share.datetime,
                        Social: share.social
                    });
                }
            }
            return shares;
        };
        interface FavData {
            status: string;
            datetime: string;
        }
        const parseFavs = (data: any, log: any, userMap: { [key: string]: string }) =>
            Object.entries(data).map(([userId, favData]) => {
                const fav = favData as FavData;
                return {
                    Name: userMap[userId] || 'Unknown',
                    Status: fav.status,
                    Time: fav.datetime
                };
            });
        interface ViewData {
            [key: string]: { datetime: string };
        }
        const parseViews = (data: any, log: any, userMap: { [key: string]: string }) =>
            Object.entries(data).map(([userId, viewData]) => {
                const views = viewData as ViewData;
                return {
                    Name: userMap[userId] || 'Unknown',
                    View_Count: Object.keys(views).length,
                    Last_View: views[Object.keys(views).pop()!].datetime
                };
            });
        const stripHtmlTags = (html: string): string => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        };

        const logsSheet = XLSX.utils.json_to_sheet(logs.map((log, index) => ({
            No: startIndex + index + 1,
            title: log.title,
            date_start: log.date_start,
            date_end: log.date_end,
            created_at: log.created_at,
            user_like: log.user_like ? JSON.parse(log.user_like).length : 0,
            user_dislike: log.user_dislike ? JSON.parse(log.user_dislike).length : 0,
            user_share: log.user_share ? Object.keys(JSON.parse(log.user_share)).length : 0,
            user_fav: log.user_fav ? Object.keys(JSON.parse(log.user_fav)).length : 0,
            user_view: log.user_view ? Object.keys(JSON.parse(log.user_view)).length : 0,
            log_rating: log.log_rating,
            location_detail: stripHtmlTags(log.location_detail),
            link_map: log.link_map,
            link_out: log.link_out,
        })));
        const userLikesSheet = createUserSheet(logs, 'user_like', parseLikesDislikes, likedUsersMap);
        const userDislikesSheet = createUserSheet(logs, 'user_dislike', parseLikesDislikes, dislikedUsersMap);
        const userSharesSheet = createUserSheet(logs, 'user_share', parseShares, sharedUsersMap);
        const userFavsSheet = createUserSheet(logs, 'user_fav', parseFavs, favUsersMap);
        const userViewsSheet = createUserSheet(logs, 'user_view', parseViews, viewedUsersMap);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, logsSheet, "Logs");
        XLSX.utils.book_append_sheet(wb, userLikesSheet, "User Likes");
        XLSX.utils.book_append_sheet(wb, userDislikesSheet, "User Dislikes");
        XLSX.utils.book_append_sheet(wb, userSharesSheet, "User Shares");
        XLSX.utils.book_append_sheet(wb, userFavsSheet, "User Favs");
        XLSX.utils.book_append_sheet(wb, userViewsSheet, "User Views");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, name_page === 'ตารางสอบ' ? "logsExam.xlsx" : "logsTraining.xlsx");
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
                    <Input
                        placeholder='Select Start Date'
                        size='md'
                        type='date'
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                    />
                </Td>
                <Td>
                    <Input
                        placeholder='Select End Date'
                        size='md'
                        type='date'
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
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
                                                    <Th>{name_page === 'ตารางสอบ' ? 'สถานที่สอบ' : 'หัวข้อ'}</Th>
                                                    <Th>{name_page === 'ตารางสอบ' ? 'สอบวันที่' : 'เริ่มอบรมวันที่'}</Th>
                                                    {name_page === 'ตารางสอบ' ? "" : <Th>ถึงวันที่</Th>}
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
                                                        <Td>{log.date_start}</Td>
                                                        {name_page === 'ตารางสอบ' ? "" : <Td>{log.date_end}</Td>}

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
                                                            <Box className='flex flex-col justify-start items-start gap-1'>
                                                                <Box className='flex flex-row items-center justify-start gap-1'>
                                                                    <Text>แชร์ทั้งหมด</Text>
                                                                    <Badge
                                                                        colorScheme="blue"
                                                                        cursor="pointer"
                                                                        onClick={() => handleShowShares(log.user_share ? JSON.parse(log.user_share) : {})}
                                                                    >
                                                                        {log.user_share ? countShares(JSON.parse(log.user_share)).totalCount : 0}
                                                                    </Badge>
                                                                </Box>

                                                                <Box className='flex flex-row items-center justify-start gap-1'>
                                                                    <Badge colorScheme='green'>Line: {log.user_share ? countShares(JSON.parse(log.user_share)).countBySocial.line : 0}</Badge>
                                                                    <Badge colorScheme='green'>Facebook: {log.user_share ? countShares(JSON.parse(log.user_share)).countBySocial.facebook : 0}</Badge>
                                                                    <Badge colorScheme='green'>Copy: {log.user_share ? countShares(JSON.parse(log.user_share)).countBySocial.copy : 0}</Badge>
                                                                    <Badge colorScheme='green'>Twitter: {log.user_share ? countShares(JSON.parse(log.user_share)).countBySocial.twitte : 0}</Badge>
                                                                    <Badge colorScheme='green'>WhatsApp: {log.user_share ? countShares(JSON.parse(log.user_share)).countBySocial.whatsapp : 0}</Badge>
                                                                </Box>
                                                            </Box>

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
                                <Button variant="solid" sx={btnStypeExcel} onClick={handleExport}>
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
