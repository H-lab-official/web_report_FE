import { useState, useEffect } from 'react';
import {
    Tr, Td, Input, Button, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Table, Thead, Tbody, Th, TableContainer,
    Spinner, Alert, AlertIcon, Box, Text, Badge
} from '@chakra-ui/react';
import { ArrowUpDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import Pagination from './Pagination';
import { btnStype } from './css/stypeall';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface TableRowProps {
    id: number;
    name_page: string;
}

const TableRowTraining: React.FC<TableRowProps> = ({ id, name_page }) => {
    const [title, setTitle] = useState<string>('');
    const [trainings, setTrainings] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;
    const [selectedLikes, setSelectedLikes] = useState<string[]>([]);
    const [likedUsers, setLikedUsers] = useState<{ [key: string]: string }>({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedShares, setSelectedShares] = useState<{ [key: string]: any }>({});
    const [sharedUsers, setSharedUsers] = useState<{ [key: string]: string }>({});
    const [selectedFavs, setSelectedFavs] = useState<{ [key: string]: any }>({});
    const [favUsers, setFavUsers] = useState<{ [key: string]: string }>({});
    const [selectedViews, setSelectedViews] = useState<any[]>([]);
    const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (selectedLikes.length > 0) {
            fetchLikedUsers(selectedLikes);
        }
        if (Object.keys(selectedFavs).length > 0) {
            fetchLikedUsers(Object.keys(selectedFavs));
        }
        if (Object.keys(selectedShares).length > 0) {
            fetchLikedUsers(Object.keys(selectedShares));
        }
        if (selectedViews.length > 0) {
            fetchLikedUsers(selectedViews.map(view => view.userId));
        }
    }, [selectedLikes, selectedFavs, selectedShares, selectedViews]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setTrainings([]);

        try {
            const response = await axios.get('http://localhost:3000/training', {
                params: { title: title || undefined },
            });

            const formattedTrainings = response.data.map((training: any) => ({
                ...training,
                created_at: new Date(training.created_at).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }));

            if (Array.isArray(formattedTrainings)) {
                setTrainings(formattedTrainings);
            } else {
                setTrainings([]);
            }
        } catch (err) {
            setError('Error fetching training data');
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

    const handleShowLikes = (likes: string[]) => {
        console.log('Populating selectedLikes with:', likes);
        setSelectedLikes(likes);
    };

    const handleShowShares = (shares: any) => {
        setSelectedShares(shares);
    };

    const handleShowFavs = (favs: any) => {
        setSelectedFavs(favs);
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

    const totalPages = Math.ceil(trainings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTrainings = trainings.slice(startIndex, startIndex + itemsPerPage);

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
        // Step 1: Create the main Trainings sheet
        const trainingData = trainings.map((training, index) => {
            const { activeCount, canceledCount } = filterFavChanges(JSON.parse(training.user_fav));
            const { countBySocial } = countShares(JSON.parse(training.user_share));
    
            return {
                No: startIndex + index + 1,
                Title: training.title,
                Created_At: training.created_at,
                User_Like_Count: training.user_like ? JSON.parse(training.user_like).length : 0,
                User_Share_Line: countBySocial.line || 0,
                User_Share_Facebook: countBySocial.facebook || 0,
                User_Share_Copy: countBySocial.copy || 0,
                User_Share_Twitter: countBySocial.twitter || 0,
                User_Share_WhatsApp: countBySocial.whatsapp || 0,
                User_Fav_Changes: `Active: ${activeCount}, Canceled: ${canceledCount}`,
                User_View: Object.keys(JSON.parse(training.user_view)).length,
            };
        });
    
        const wsTrainings = XLSX.utils.json_to_sheet(trainingData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsTrainings, "Trainings");
    
        // Step 2: Create the Likes sheet
        if (selectedLikes.length > 0) {
            const likesData = selectedLikes.map((userId, index) => ({
                No: index + 1,
                UserID: userId,
                UserName: likedUsers[userId] || 'Unknown',
            }));
            const wsLikes = XLSX.utils.json_to_sheet(likesData);
            XLSX.utils.book_append_sheet(wb, wsLikes, "Likes");
        }
    
        // Step 3: Create the Shares sheet
        if (Object.keys(selectedShares).length > 0) {
            const sharesData: Array<{ No: number, UserID: string, UserName: string, Social: string, Time: string }> = [];
            Object.keys(selectedShares).forEach((userId) => {
                Object.entries(selectedShares[userId]).forEach(([shareId, shareData]: [string, any]) => {
                    sharesData.push({
                        No: sharesData.length + 1,
                        UserID: userId,
                        UserName: sharedUsers[userId] || 'Unknown',
                        Social: shareData.social,
                        Time: shareData.datetime,
                    });
                });
            });
            const wsShares = XLSX.utils.json_to_sheet(sharesData);
            XLSX.utils.book_append_sheet(wb, wsShares, "Shares");
        }
    
        // Step 4: Create the Favorites sheet
        if (Object.keys(selectedFavs).length > 0) {
            const favsData: Array<{ No: number, UserID: string, UserName: string, Status: string, DateTime: string }> = [];
            Object.keys(selectedFavs).forEach((userId) => {
                Object.entries(selectedFavs[userId]).forEach(([favId, favData]: [string, any]) => {
                    favsData.push({
                        No: favsData.length + 1,
                        UserID: userId,
                        UserName: favUsers[userId] || 'Unknown',
                        Status: favData.status,
                        DateTime: favData.datetime,
                    });
                });
            });
            const wsFavs = XLSX.utils.json_to_sheet(favsData);
            XLSX.utils.book_append_sheet(wb, wsFavs, "Favorites");
        }
    
        // Step 5: Create the Views sheet
        if (selectedViews.length > 0) {
            const viewsData = selectedViews.map((view, index) => ({
                No: index + 1,
                UserID: view.userId,
                UserName: view.userName,
                ViewCount: view.viewCount,
                LastView: view.lastView,
            }));
            const wsViews = XLSX.utils.json_to_sheet(viewsData);
            XLSX.utils.book_append_sheet(wb, wsViews, "Views");
        }
    
        // Step 6: Export the workbook
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "trainings_with_likes_shares_favs_views.xlsx");
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
                <Modal isOpen={isOpen} onClose={onClose} size={'6xl'}>
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
                            ) : trainings.length === 0 ? (
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
                                                {currentTrainings.map((training, index) => {
                                                    const likes = training.user_like ? JSON.parse(training.user_like) : [];
                                                    const shares = training.user_share ? JSON.parse(training.user_share) : {};
                                                    const { totalCount, countBySocial } = countShares(shares);
                                                    const favs = training.user_fav ? JSON.parse(training.user_fav) : {};
                                                    const { changedFavs, activeCount, canceledCount } = filterFavChanges(favs);

                                                    return (
                                                        <Tr key={index}>
                                                            <Td>{startIndex + index + 1}</Td>
                                                            <Td>{training.title}</Td>
                                                            <Td>{training.created_at}</Td>
                                                            <Td>
                                                                <Badge
                                                                    colorScheme="blue"
                                                                    cursor="pointer"
                                                                    onClick={() => handleShowLikes(likes)}
                                                                >
                                                                    {likes.length}
                                                                </Badge>
                                                            </Td>
                                                            <Td>
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

                                                                <Box className='flex flex-col items-center justify-start gap-1'>
                                                                    <Badge colorScheme='green'>Line: {countBySocial.line}</Badge>
                                                                    <Badge colorScheme='green'>Facebook: {countBySocial.facebook}</Badge>
                                                                    <Badge colorScheme='green'>Copy: {countBySocial.copy}</Badge>
                                                                    <Badge colorScheme='green'>Twitter: {countBySocial.twitter}</Badge>
                                                                    <Badge colorScheme='green'>WhatsApp: {countBySocial.whatsapp}</Badge>
                                                                </Box>
                                                            </Td>
                                                            <Td>
                                                                <Box>
                                                                    <Text>รายการโปรดทั้งหมด <Badge
                                                                        colorScheme="blue"
                                                                        cursor="pointer"
                                                                        onClick={() => handleShowFavs(favs)}
                                                                    >
                                                                        {activeCount + canceledCount}
                                                                    </Badge> </Text>
                                                                </Box>
                                                                <Box className='flex flex-col justify-center items-center gap-1'>
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
                                                            </Td>
                                                            <Td>
                                                                <Badge
                                                                    colorScheme="blue"
                                                                    cursor="pointer"
                                                                    onClick={() => handleShowViews(JSON.parse(training.user_view))}
                                                                >
                                                                    {Object.keys(JSON.parse(training.user_view)).length}
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

            {/* Modal for showing liked users */}
            <Modal isOpen={selectedLikes.length > 0} onClose={() => setSelectedLikes([])}>
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
                                                <Td>{likedUsers[userId]}</Td>
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

            {/* Modal to show shared users */}
            <Modal isOpen={Object.keys(selectedShares).length > 0} onClose={() => setSelectedShares({})}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Shared Users</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {Object.keys(selectedShares).length > 0 ? (
                            Object.keys(selectedShares).map((userId) => (
                                <Box key={userId} mb={4}>
                                    <Text fontWeight="bold">User ID: {userId} - Name: {sharedUsers[userId]}</Text>
                                    <TableContainer>
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th>Time</Th>
                                                    <Th>Social</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {Object.entries(selectedShares[userId]).map(([shareId, shareData]: any) => (
                                                    <Tr key={shareId}>
                                                        <Td>{shareData.datetime}</Td>
                                                        <Td>{shareData.social}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ))
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

            {Object.keys(selectedFavs).length > 0 && (
                <Modal isOpen={true} onClose={() => setSelectedFavs({})} size={'lg'}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Favorite Changes</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <TableContainer>
                                <Table variant='simple'>
                                    <Thead>
                                        <Tr>
                                            <Th>User ID</Th>
                                            <Th>User Name</Th>
                                            <Th>Status</Th>
                                            <Th>Date Time</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {Object.keys(selectedFavs).map((userId, index) => {
                                            const userFavs = selectedFavs[userId];
                                            return Object.keys(userFavs).map((favId) => (
                                                <Tr key={favId}>
                                                    <Td>{userId}</Td>
                                                    <Td>{favUsers[userId] || 'Unknown'}</Td>
                                                    <Td>{userFavs[favId].status}</Td>
                                                    <Td>{userFavs[favId].datetime}</Td>
                                                </Tr>
                                            ));
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={() => setSelectedFavs({})}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}

            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} size="lg">
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
                                        <Th>User Name</Th>
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
                        <Button colorScheme="blue" onClick={() => setViewModalOpen(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    );
};

export default TableRowTraining;
