import { useState, useEffect } from 'react';
import {
    Tr, Td, Input, Button, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Table, Thead, Tbody, Th, TableContainer,
    Spinner, Alert, AlertIcon, Box, Text, Badge
} from '@chakra-ui/react';
import PaginationView from './PaginationView';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Pagination from './Pagination';
import NProgress from 'nprogress';
import '../components/css/custom-nprogress.css'
import 'nprogress/nprogress.css';


interface TableRowProps {
    id: number;
    name_page: string;
}

const TableRowProducts: React.FC<TableRowProps> = ({ id, name_page }) => {
    const [title, setTitle] = useState<string>('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 8;
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
        NProgress.start();
        setLoading(true);
        setError(null);
        setProducts([]);

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
                params: { title: title || undefined },
            });

            const formattedProducts = response.data.map((product: any) => ({
                ...product,
                created_at: new Date(product.created_at).toLocaleString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }));

            setProducts(Array.isArray(formattedProducts) ? formattedProducts : []);
        } catch (err) {
            setError('Error fetching products data');
        } finally {
            setLoading(false);
            NProgress.done();
            onOpen();
        }
    };

    const fetchLikedUsers = async (userIds: string[]) => {
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

            setLikedUsers(userMap);
            setSharedUsers(userMap);
            setFavUsers(userMap);
        } catch (error) {
            console.error('Error fetching liked users:', error);
        }
    };
    const handleShowLikes = async (likes: string[]) => {
        NProgress.start(); // Start the loading bar
        try {
            await fetchLikedUsers(likes);
            setSelectedLikes(likes);
        } finally {
            NProgress.done(); // Complete the loading bar
        }
    };

    const handleShowShares = async (shares: any) => {
        NProgress.start();
        try {
            await fetchLikedUsers(Object.keys(shares));
            setSelectedShares(shares);
        } finally {
            NProgress.done();
        }
    };

    const handleShowFavs = async (favs: any) => {
        NProgress.start();
        try {
            await fetchLikedUsers(Object.keys(favs));
            setSelectedFavs(favs);
        } finally {
            NProgress.done();
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

    const handleShowViews = async (views: any) => {
        NProgress.start();
        try {
            const viewDetails = await Promise.all(
                Object.entries(views).map(async ([userId, viewData]) => {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, { params: { user_id: userId } });
                    const userName = response.data.length > 0 ? response.data[0].name : 'Unknown';
                    return {
                        userId,
                        userName,
                        viewCount: Object.keys(viewData).length,
                        lastView: viewData[Object.keys(viewData).pop()].datetime,
                    };
                })
            );
            setSelectedViews(viewDetails);
            setViewModalOpen(true);
        } finally {
            NProgress.done();
        }
    };


    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

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
    const fetchUserDetailsForExport = async (userIds: string[]): Promise<{ [key: string]: string }> => {
        try {
            const chunks = [];
            const chunkSize = 50;
            for (let i = 0; i < userIds.length; i += chunkSize) {
                chunks.push(userIds.slice(i, i + chunkSize));
            }
    
            const userMap: { [key: string]: string } = {};
    
            for (const chunk of chunks) {
                const responses = await Promise.all(
                    chunk.map(userId =>
                        axios.get(`${import.meta.env.VITE_API_URL}/users`, { params: { user_id: userId } })
                    )
                );
    
                responses.forEach((response) => {
                    if (response.data.length > 0) {
                        const user = response.data[0];
                        userMap[user.id] = user.name;
                    }
                });
            }
    
            return userMap;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return {};
        }
    };
    const fetchAllDataForExport = async () => {
        const allLikes = products.flatMap((product, index) => 
            (JSON.parse(product.user_like) || []).map(userId => ({
                productNo: index + 1,
                productTitle: product.title,
                userId
            }))
        );
    
        const allShares = products.flatMap((product, index) => 
            Object.entries(JSON.parse(product.user_share) || {}).flatMap(([userId, shares]) =>
                Object.entries(shares).map(([, shareData]) => ({
                    productNo: index + 1,
                    productTitle: product.title,
                    userId,
                    ...shareData
                }))
            )
        );
    
        const allFavs = products.flatMap((product, index) => 
            Object.entries(JSON.parse(product.user_fav) || {}).flatMap(([userId, favs]) =>
                Object.entries(favs).map(([, favData]) => ({
                    productNo: index + 1,
                    productTitle: product.title,
                    userId,
                    ...favData
                }))
            )
        );
    
        const allViews = products.flatMap((product, index) => {
            const views = JSON.parse(product.user_view) || {};
            return Object.entries(views).map(([userId, viewData]) => ({
                productNo: index + 1,
                productTitle: product.title,
                userId,
                viewCount: Object.keys(viewData).length,
                lastView: viewData[Object.keys(viewData).pop()].datetime,
            }));
        });
    
        const allUserIds = new Set([
            ...allLikes.map(like => like.userId),
            ...allShares.map(share => share.userId),
            ...allFavs.map(fav => fav.userId),
            ...allViews.map(view => view.userId)
        ]);
    
        const userDetailsMap = await fetchUserDetailsForExport(Array.from(allUserIds));
    
        return {
            likes: allLikes.map(like => ({
                ...like,
                userName: userDetailsMap[like.userId] || 'Unknown'
            })),
            shares: allShares.map(share => ({
                ...share,
                userName: userDetailsMap[share.userId] || 'Unknown'
            })),
            favs: allFavs.map(fav => ({
                ...fav,
                userName: userDetailsMap[fav.userId] || 'Unknown'
            })),
            views: allViews.map(view => ({
                ...view,
                userName: userDetailsMap[view.userId] || 'Unknown'
            }))
        };
    };

    const exportToExcel = async () => {
        NProgress.start();

        try {
            const allData = await fetchAllDataForExport();

            // Create sheets
            const wsProducts = XLSX.utils.json_to_sheet(products.map((product, index) => {
                const { activeCount, canceledCount } = filterFavChanges(JSON.parse(product.user_fav));
                const { countBySocial } = countShares(JSON.parse(product.user_share));

                return {
                    No: index + 1,
                    Title: product.title,
                    Created_At: product.created_at,
                    User_Like_Count: product.user_like ? JSON.parse(product.user_like).length : 0,
                    User_Share_Line: countBySocial.line || 0,
                    User_Share_Facebook: countBySocial.facebook || 0,
                    User_Share_Copy: countBySocial.copy || 0,
                    User_Fav_Changes: `Active: ${activeCount}, Canceled: ${canceledCount}`,
                    User_View: Object.keys(JSON.parse(product.user_view)).length,
                };
            }));

            const wsUserLikes = XLSX.utils.json_to_sheet(allData.likes);
            const wsUserShares = XLSX.utils.json_to_sheet(allData.shares);
            const wsUserFavs = XLSX.utils.json_to_sheet(allData.favs);
            const wsUserViews = XLSX.utils.json_to_sheet(allData.views);
    
            // Create workbook and append sheets
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsProducts, "Products");
            XLSX.utils.book_append_sheet(wb, wsUserLikes, "User Likes");
            XLSX.utils.book_append_sheet(wb, wsUserShares, "User Shares");
            XLSX.utils.book_append_sheet(wb, wsUserFavs, "User Favs");
            XLSX.utils.book_append_sheet(wb, wsUserViews, "User Views");
    
            // Write the workbook and trigger download
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(data, "data_export.xlsx");
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        } finally {
            NProgress.done();
        }
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
                    <Button variant="solid" onClick={handleSearch}>
                        Search
                    </Button>
                </Td>
            </Tr>

            <Box>
                <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>All PRODUCTS</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {loading ? (
                                <Spinner />
                            ) : error ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            ) : products.length === 0 ? (
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
                                                {currentProducts.map((product, index) => {
                                                    const likes = product.user_like ? JSON.parse(product.user_like) : [];
                                                    const shares = product.user_share ? JSON.parse(product.user_share) : {};
                                                    const { totalCount, countBySocial } = countShares(shares);
                                                    const favs = product.user_fav ? JSON.parse(product.user_fav) : {};
                                                    const { changedFavs, activeCount, canceledCount } = filterFavChanges(favs);

                                                    return (
                                                        <Tr key={index}>
                                                            <Td>{startIndex + index + 1}</Td>
                                                            <Td className="max-w-[320px] p-2 ">
                                                                <p className="whitespace-pre-line break-words">
                                                                    {product.title}
                                                                </p>
                                                            </Td>

                                                            <Td>{product.created_at}</Td>
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
                                                                    onClick={() => handleShowViews(JSON.parse(product.user_view))}
                                                                >
                                                                    {Object.keys(JSON.parse(product.user_view)).length}
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


            <Modal size="lg" isOpen={selectedLikes.length > 0} onClose={() => setSelectedLikes([])}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Liked Users</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedLikes.length > 0 ? (
                            <>
                                <Box display="flex" justifyContent="space-between" py={2} px={4} fontWeight="bold" bg="gray.100" borderBottom="1px solid #e2e8f0">
                                    <Text width="10%">No.</Text>
                                    <Text width="45%">Name</Text>
                                    <Text width="45%">User ID</Text>
                                </Box>
                                <PaginationView
                                    itemsPerPage={10}
                                    totalItems={selectedLikes.length}
                                    items={selectedLikes.map((userId, index) => ({
                                        no: index + 1,
                                        userId,
                                        userName: likedUsers[userId],
                                    }))}
                                    renderItem={(user, index) => (
                                        <Box key={index} display="flex" justifyContent="space-between" py={2} px={4} borderBottom="1px solid #e2e8f0">
                                            <Text width="10%">{user.no}</Text>
                                            <Text width="45%">{user.userName}</Text>
                                            <Text width="45%">{user.userId}</Text>
                                        </Box>
                                    )}
                                />
                            </>
                        ) : (
                            <Text>No liked users found.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Box display="flex" justifyContent="center" width="100%">
                            <Button colorScheme="blue" mr={3} onClick={() => setSelectedLikes([])}>
                                Close
                            </Button>
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal size={'lg'} isOpen={Object.keys(selectedShares).length > 0} onClose={() => setSelectedShares({})}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Shared Users</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {Object.keys(selectedShares).length > 0 ? (
                            <>
                                <PaginationView
                                    itemsPerPage={5}
                                    totalItems={Object.keys(selectedShares).length}
                                    items={Object.entries(selectedShares).map(([userId, shares]) => ({
                                        userId,
                                        userName: sharedUsers[userId],
                                        shares,
                                    }))}
                                    renderItem={(user, index) => (
                                        <Box key={index} mb={4}>
                                            <Text fontWeight="bold">User ID: {user.userId} - Name: {user.userName}</Text>
                                            {Object.entries(user.shares).map(([shareId, shareData]: any) => (
                                                <Box key={shareId} display="flex" justifyContent="space-between" py={2} px={4} borderBottom="1px solid #e2e8f0">
                                                    <Text width="50%">{shareData.datetime}</Text>
                                                    <Text width="50%">{shareData.social}</Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                />
                            </>
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

            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} size="6xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>View Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box display="flex" justifyContent="space-between" py={2} px={4} fontWeight="bold" bg="gray.100" borderBottom="1px solid #e2e8f0">
                            <Text width="20%">User ID</Text>
                            <Text width="30%">User Name</Text>
                            <Text width="20%">View Count</Text>
                            <Text width="30%">Last View</Text>
                        </Box>
                        <PaginationView
                            itemsPerPage={10}
                            totalItems={selectedViews.length}
                            items={selectedViews}
                            renderItem={(view, index) => (
                                <Box key={index} display="flex" justifyContent="space-between" py={2} px={4} borderBottom="1px solid #e2e8f0">
                                    <Text width="20%">{view.userId}</Text>
                                    <Text width="30%">{view.userName}</Text>
                                    <Text width="20%">{view.viewCount}</Text>
                                    <Text width="30%">{view.lastView}</Text>
                                </Box>
                            )}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Box display="flex" justifyContent="center" width="100%">
                            <Button colorScheme="blue" onClick={() => setViewModalOpen(false)}>
                                Close
                            </Button>
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={Object.keys(selectedFavs).length > 0} onClose={() => setSelectedFavs({})} size={'3xl'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Favorite Changes</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box display="flex" justifyContent="space-between" py={2} px={4} fontWeight="bold" bg="gray.100" borderBottom="1px solid #e2e8f0">
                            <Text width="20%">User ID</Text>
                            <Text width="30%">User Name</Text>
                            <Text width="20%">Status</Text>
                            <Text width="30%">Date Time</Text>
                        </Box>
                        <PaginationView
                            itemsPerPage={10}
                            totalItems={Object.values(selectedFavs).reduce((count, userFavs) => count + Object.keys(userFavs).length, 0)}
                            items={Object.entries(selectedFavs).flatMap(([userId, userFavs]) =>
                                Object.entries(userFavs).map(([favId, favData]) => ({
                                    userId,
                                    userName: favUsers[userId] || 'Unknown',
                                    status: favData.status,
                                    datetime: favData.datetime,
                                }))
                            )}
                            renderItem={(fav, index) => (
                                <Box key={index} display="flex" justifyContent="space-between" py={2} px={4} borderBottom="1px solid #e2e8f0">
                                    <Text width="20%">{fav.userId}</Text>
                                    <Text width="30%">{fav.userName}</Text>
                                    <Text width="20%">{fav.status}</Text>
                                    <Text width="30%">{fav.datetime}</Text>
                                </Box>
                            )}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Box display="flex" justifyContent="center" width="100%">
                            <Button colorScheme="blue" onClick={() => setSelectedFavs({})}>
                                Close
                            </Button>
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </>
    );
};

export default TableRowProducts;
