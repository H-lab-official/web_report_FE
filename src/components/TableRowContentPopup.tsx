import { useState, useEffect } from 'react';
import {
    Tr, Td, Box, Table, Thead, Tbody, Th, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, Text
} from '@chakra-ui/react';
import axios from 'axios';
import LogVideoAccordionWithPagination from './renderLogVideoAccordion'
import { btnStype, btnStypeExcel } from './css/stypeall'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface TableRowContentPopupProps {
    id: number;
}

const TableRowContentPopup: React.FC<TableRowContentPopupProps> = ({ id }) => {
    const [contentData, setContentData] = useState<any>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/contentpopup?id=${id}`);
                setContentData(response.data);
            } catch (error) {
                console.error('Error fetching content data:', error);
            }
        };

        fetchData();
    }, [id]);

    const parseLogVideo = (logVideo: string) => {
        if (!logVideo) return [];

        try {
            return JSON.parse(logVideo);
        } catch (error) {
            console.error('Error parsing log video data:', error);
            return [];
        }
    };

    if (!contentData) {
        return <Text>Loading...</Text>;
    }

    const { title, created_at, status, log_video } = contentData[0];

    const logVideoData = parseLogVideo(log_video);

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            contentData.map((content: any, index: any) => {
                const logVideo = content.log_video ? JSON.stringify(parseLogVideo(content.log_video)) : 'No Log Video';
                const maxLength = 32767;
                let logVideoParts = [];
    
                // Split the logVideo string into chunks of 32767 characters
                for (let i = 0; i < logVideo.length; i += maxLength) {
                    logVideoParts.push(logVideo.substring(i, i + maxLength));
                }
    
                return {
                    No: index + 1,
                    Title: content.title,
                    CreatedAt: new Date(content.created_at).toLocaleString(),
                    Status: content.status === 'Yes' ? 'เปิด' : 'ปิด',
                    LogVideoPart1: logVideoParts[0] || '',
                    LogVideoPart2: logVideoParts[1] || '',
                    // Add more parts if necessary
                };
            })
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ContentPopup");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "ContentPopup.xlsx");
    };
    
    return (
        <>
            <Tr>
                <Td>{id}</Td>
                <Td>{title}</Td>
                <Td>{status === 'Yes' ? 'เปิด' : 'ปิด'}</Td>
                <Td>{new Date(created_at).toLocaleString()}</Td>
                <Td> <Button variant="solid" sx={btnStype} onClick={onOpen}>Search</Button></Td>
            </Tr>

            <Modal isOpen={isOpen} onClose={onClose} size={'6xl'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Content Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box mb={4}>
                            <Text><strong>Title:</strong> {title}</Text>
                            <Text><strong>Created At:</strong> {new Date(created_at).toLocaleString()}</Text>
                            <Text><strong>Status:</strong> {status}</Text>
                        </Box>

                        <LogVideoAccordionWithPagination logVideo={logVideoData} />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="solid" sx={btnStypeExcel} mr={3} onClick={exportToExcel}>
                            Export to Excel
                        </Button>
                        <Button variant="solid" sx={btnStype} mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default TableRowContentPopup;
