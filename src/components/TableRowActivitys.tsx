import { useState, useEffect } from 'react';
import {
    Tr, Td, Input, Button, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Table, Thead, Tbody, Th, TableContainer,
    Spinner, Alert, AlertIcon, Box, Text, Badge
} from '@chakra-ui/react';
import axios from 'axios';
import Pagination from './Pagination';
import { btnStype } from './css/stypeall';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import PaginationView from './PaginationView';

interface TableRowProps {
    id: number;
    name_page: string;
}

const TableRowActivitys: React.FC<TableRowProps> = ({ id, name_page }) => {
    const [title, setTitle] = useState<string>('');
    const [newsItems, setNewsItems] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 9;
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [selectedLikes, setSelectedLikes] = useState<string[]>([]);
    const [selectedShares, setSelectedShares] = useState<{ [key: string]: any }>({});
    const [selectedFavs, setSelectedFavs] = useState<{ [key: string]: any }>({});
    const [selectedViews, setSelectedViews] = useState<any[]>([]);

    const [likedUsers, setLikedUsers] = useState<{ [key: string]: string }>({});
    const [sharedUsers, setSharedUsers] = useState<{ [key: string]: string }>({});
    const [favUsers, setFavUsers] = useState<{ [key: string]: string }>({});
    const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (selectedLikes.length > 0) fetchLikedUsers(selectedLikes);
        if (Object.keys(selectedFavs).length > 0) fetchLikedUsers(Object.keys(selectedFavs));
        if (Object.keys(selectedShares).length > 0) fetchLikedUsers(Object.keys(selectedShares));
        if (selectedViews.length > 0) fetchLikedUsers(selectedViews.map(view => view.userId));
    }, [selectedLikes, selectedFavs, selectedShares, selectedViews]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setNewsItems([]);

        try {
            const response = await axios.get('http://localhost:3000/activitys', {
                params: { title: title || undefined },
            });

            const formattedNews = response.data.map((news: any) => ({
                ...news,
                created_at: new Date(news.created_at).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }));

            if (Array.isArray(formattedNews)) {
                setNewsItems(formattedNews);
            } else {
                setNewsItems([]);
            }
        } catch (err) {
            setError('Error fetching news data');
        } finally {
            setLoading(false);
            onOpen();
        }
    };

    const fetchLikedUsers = async (userIds: string[]) => {
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

            setLikedUsers(userMap);
            setSharedUsers(userMap);
            setFavUsers(userMap);
        } catch (error) {
            console.error('Error fetching liked users:', error);
        }
    };

    const countShares = (shares: any) => {
        const countBySocial: { [key: string]: number } = { line: 0, facebook: 0, copy: 0, twitter: 0, whatsapp: 0 };
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

    const filterFavChanges = (favs: any) => {
        let activeCount = 0;
        let canceledCount = 0;
        const changedFavs: { [key: string]: any } = {};

        for (const userId in favs) {
            const userFavs = favs[userId];
            const changeLogs: { [key: string]: any } = {};
            let previousStatus = null;

            for (const favId in userFavs) {
                const fav = userFavs[favId];

                if (previousStatus !== fav.status) {
                    changeLogs[favId] = fav;
                    if (fav.status === "Active") {
                        activeCount++;
                    } else if (fav.status === "Canceled") {
                        canceledCount++;
                    }
                }
                previousStatus = fav.status;
            }

            if (Object.keys(changeLogs).length > 0) {
                changedFavs[userId] = changeLogs;
            }
        }

        return { changedFavs, activeCount, canceledCount };
    };

    const handleShowLikes = (likes: string[]) => {
        setSelectedLikes(likes);
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

    const totalPages = Math.ceil(newsItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentNewsItems = newsItems.slice(startIndex, startIndex + itemsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(newsItems.map((news, index) => {
            const { activeCount, canceledCount } = filterFavChanges(JSON.parse(news.user_fav));
            const { countBySocial } = countShares(JSON.parse(news.user_share));

            return {
                No: startIndex + index + 1,
                Title: news.title,
                Created_At: news.created_at,
                User_Like_Count: news.user_like ? JSON.parse(news.user_like).length : 0,
                User_Share_Line: countBySocial.line || 0,
                User_Share_Facebook: countBySocial.facebook || 0,
                User_Share_Copy: countBySocial.copy || 0,
                User_Fav_Changes: `Active: ${activeCount}, Canceled: ${canceledCount}`,
                User_View: Object.keys(JSON.parse(news.user_view)).length,
            };
        }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NewsItems");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "newsItems.xlsx");
    };

    return (
        <>
            <Tr>
                <Td>{id}</Td>
                <Td>{name_page}</Td>
                <Td>
                    <Input
                        placeholder="กรุณาใส่หัวข้อ"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                        <ModalHeader>Report News</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {loading ? (
                                <Spinner />
                            ) : error ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            ) : newsItems.length === 0 ? (
                                <Box textAlign="center" mt={4}>
                                    <Text>No data found</Text>
                                </Box>
                            ) : (
                                <>
                                    <TableContainer>
                                        <Table variant='simple'>
                                            <Thead>
                                                <Tr>
                                                    <Th>No.</Th>
                                                    <Th>Title</Th>
                                                    <Th>Created At</Th>
                                                    <Th>User Like Count</Th>
                                                    <Th>User Share</Th>
                                                    <Th>User Fav</Th>
                                                    <Th>User View</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {currentNewsItems.map((news, index) => {
                                                    const likes = news.user_like ? JSON.parse(news.user_like) : [];
                                                    const shares = news.user_share ? JSON.parse(news.user_share) : {};
                                                    const { totalCount, countBySocial } = countShares(shares);
                                                    const favs = news.user_fav ? JSON.parse(news.user_fav) : {};
                                                    const { changedFavs, activeCount, canceledCount } = filterFavChanges(favs);

                                                    return (
                                                        <Tr key={index}>
                                                            <Td>{startIndex + index + 1}</Td>
                                                            <Td className="max-w-[320px] p-2 ">
                                                                <p className="whitespace-pre-line break-words">
                                                                    {news.title}
                                                                </p>
                                                            </Td>
                                                            <Td>{news.created_at}</Td>
                                                            <Td className=''>
                                                                <Box className='flex flex-col justify-start items-start gap-1'>
                                                                    <Badge
                                                                        colorScheme="blue"
                                                                        cursor="pointer"
                                                                        onClick={() => handleShowLikes(likes)}
                                                                    >
                                                                        {likes.length}
                                                                    </Badge>
                                                                </Box>
                                                            </Td>
                                                            <Td>
                                                                <Box className='flex flex-col justify-start items-start gap-1'>
                                                                    <Box className='flex flex-row items-center justify-start gap-1'>
                                                                        <Text>แชร์ทั้งหมด</Text>
                                                                        <Badge
                                                                            colorScheme="blue"
                                                                            cursor="pointer"
                                                                            onClick={() => handleShowShares(shares)}
                                                                        >
                                                                            {totalCount}
                                                                        </Badge>
                                                                    </Box>

                                                                    <Box className='flex flex-row items-center justify-start gap-1'>
                                                                        <Badge colorScheme='green'>Line: {countBySocial.line}</Badge>
                                                                        <Badge colorScheme='green'>Facebook: {countBySocial.facebook}</Badge>
                                                                        <Badge colorScheme='green'>Copy: {countBySocial.copy}</Badge>
                                                                        <Badge colorScheme='green'>Twitter: {countBySocial.twitter}</Badge>
                                                                        <Badge colorScheme='green'>WhatsApp: {countBySocial.whatsapp}</Badge>
                                                                    </Box>
                                                                </Box>
                                                            </Td>
                                                            <Td>
                                                                <Box className='flex flex-col justify-start items-start gap-1'>
                                                                    <Box className='flex flex-row justify-start items-center gap-1'>
                                                                        <Text>รายการโปรดทั้งหมด</Text>
                                                                        <Badge
                                                                            colorScheme="blue"
                                                                            cursor="pointer"
                                                                            onClick={() => handleShowFavs(favs)}
                                                                        >
                                                                            {activeCount + canceledCount}
                                                                        </Badge>
                                                                    </Box>
                                                                    <Box className='flex flex-row justify-center items-center gap-1'>
                                                                        <Badge
                                                                            colorScheme="green"
                                                                            cursor="pointer"
                                                                            onClick={() => handleShowFavs(favs)}
                                                                        >
                                                                            Active: {activeCount}
                                                                        </Badge>
                                                                        <Badge
                                                                            colorScheme="red"
                                                                            cursor="pointer"
                                                                            onClick={() => handleShowFavs(favs)}
                                                                        >
                                                                            Canceled: {canceledCount}
                                                                        </Badge>
                                                                    </Box>
                                                                </Box>
                                                            </Td>
                                                            <Td>
                                                                <Badge
                                                                    colorScheme="blue"
                                                                    cursor="pointer"
                                                                    onClick={() => handleShowViews(JSON.parse(news.user_view))}
                                                                >
                                                                    {Object.keys(JSON.parse(news.user_view)).length}
                                                                </Badge>
                                                            </Td>
                                                        </Tr>
                                                    );
                                                })}
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
                                        <PaginationView
                                            itemsPerPage={10}
                                            totalItems={selectedLikes.length}
                                            items={selectedLikes.map((userId, index) => ({
                                                userId,
                                                userName: likedUsers[userId],
                                            }))}
                                            renderItem={(view, index) => (
                                                <Tr key={index}>
                                                    <Td>{view.userId}</Td>
                                                    <Td>{view.userName}</Td>
                                                </Tr>
                                            )}
                                        />
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

            {/* Modal to show shared users */}
            <Modal isOpen={Object.keys(selectedShares).length > 0} onClose={() => setSelectedShares({})}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Shared Users</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {Object.keys(selectedShares).length > 0 ? (
                            <PaginationView
                                itemsPerPage={10}
                                totalItems={Object.keys(selectedShares).length}
                                items={Object.keys(selectedShares).map(userId => ({
                                    userId,
                                    userName: sharedUsers[userId],
                                    shares: Object.entries(selectedShares[userId]).map(([shareId, shareData]) => ({
                                        datetime: shareData.datetime,
                                        social: shareData.social,
                                    })),
                                }))}
                                renderItem={(view, index) => (
                                    <Box key={index} mb={4}>
                                        <Text fontWeight="bold">User ID: {view.userId} - Name: {view.userName}</Text>
                                        <TableContainer>
                                            <Table variant="simple">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Time</Th>
                                                        <Th>Social</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {view.shares.map((share, idx) => (
                                                        <Tr key={idx}>
                                                            <Td>{share.datetime}</Td>
                                                            <Td>{share.social}</Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            />
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
                        <PaginationView
                            itemsPerPage={10}
                            totalItems={selectedViews.length}
                            items={selectedViews}
                            renderItem={(view, index) => (
                                <Tr key={index}>
                                    <Td>{view.userId}</Td>
                                    <Td>{view.userName}</Td>
                                    <Td>{view.viewCount}</Td>
                                    <Td>{view.lastView}</Td>
                                </Tr>
                            )}
                        />
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
};

export default TableRowActivitys;
