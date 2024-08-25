import { useState, useEffect } from 'react';
import {
    Accordion, AccordionItem, AccordionButton, AccordionPanel,
    AccordionIcon, Box, TableContainer, Table, Thead, Tr, Th,
    Tbody, Td
} from '@chakra-ui/react';
import axios from 'axios';
import Pagination from './Pagination';

interface Log {
    datetime: string;
    countTime: string;
}

interface LogVideoAccordionWithPaginationProps {
    logVideo: { [key: string]: { [key: string]: Log } };
}

const LogVideoAccordionWithPagination: React.FC<LogVideoAccordionWithPaginationProps> = ({ logVideo }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
    
    const totalPages = Math.ceil(Object.keys(logVideo).length / itemsPerPage);


    useEffect(() => {
        const fetchUserNames = async () => {
            const userIds = Object.keys(logVideo);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedUserIds = userIds.slice(startIndex, startIndex + itemsPerPage);
            const userNameMap: { [key: string]: string } = { ...userNames };
    
            for (const userId of paginatedUserIds) {
                if (!userNameMap[userId]) { 
                    try {
                        const response = await axios.get(`http://localhost:3000/users`, {
                            params: { user_id: userId }
                        });
    
                        if (response.data.length > 0) {
                            userNameMap[userId] = response.data[0].name;
                        } else {
                            userNameMap[userId] = 'Unknown';
                        }
                    } catch (error) {
                        console.error(`Error fetching name for user ${userId}:`, error);
                        userNameMap[userId] = 'Unknown';
                    }
                }
            }
    
            setUserNames(userNameMap);
        };
    
        fetchUserNames();
    }, [logVideo, currentPage]); 
    

    const renderLogVideoAccordion = (logVideo: { [key: string]: { [key: string]: Log } }, currentPage: number, itemsPerPage: number) => {
        const items: JSX.Element[] = [];
        const userIds = Object.keys(logVideo);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedUserIds = userIds.slice(startIndex, startIndex + itemsPerPage);

        paginatedUserIds.forEach((userId) => {
            const logs = logVideo[userId];
            const logRows: JSX.Element[] = [];

            for (const logId in logs) {
                const log = logs[logId];
                logRows.push(
                    <Tr key={`${userId}-${logId}`}>
                        <Td>{logId}</Td>
                        <Td>{log.datetime}</Td>
                        <Td>{log.countTime}</Td>
                    </Tr>
                );
            }

            items.push(
                <AccordionItem key={userId}>
                    <h2>
                        <AccordionButton>
                            <Box flex="1" textAlign="left">
                                {/* User ID: {userId} -  */}
                                Name: {userNames[userId]}
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Log ID</Th>
                                        <Th>Date Time</Th>
                                        <Th>Count Time</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {logRows}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </AccordionPanel>
                </AccordionItem>
            );
        });

        return (
            <Accordion allowToggle>
                {items}
            </Accordion>
        );
    };

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

    return (
        <Box>
            {renderLogVideoAccordion(logVideo, currentPage, itemsPerPage)}

            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                goToPage={goToPage}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
            />
        </Box>
    );
};

export default LogVideoAccordionWithPagination;
