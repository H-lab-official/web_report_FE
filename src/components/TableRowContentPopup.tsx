import { useState, useEffect } from 'react';
import {
    Tr, Td, Box, Table, Thead, Tbody, Th, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, ModalCloseButton,
    useDisclosure, TableContainer, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
} from '@chakra-ui/react';
import axios from 'axios';
import LogVideoAccordionWithPagination from './renderLogVideoAccordion'
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

    return (
        <>
            <Tr>
                <Td>{id}</Td>
                <Td>{title}</Td>
                <Td>{status === 'Yes' ? 'เปิด' : 'ปิด'}</Td>
                <Td>{new Date(created_at).toLocaleString()}</Td>
                <Td> <Button onClick={onOpen}>Show Logs</Button></Td>
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
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default TableRowContentPopup;
