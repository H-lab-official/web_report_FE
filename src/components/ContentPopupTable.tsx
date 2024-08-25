import { useState, useEffect } from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Box, Spinner, Text, TableContainer,
} from '@chakra-ui/react';
import axios from 'axios';
import TableRowContentPopup from './TableRowContentPopup';

const ContentPopupTable: React.FC = () => {
    const [ids, setIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchIds = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/contentpopup`);
                const contentData = response.data;
                const contentIds = contentData.map((content: any) => content.id);
                setIds(contentIds);
            } catch (error) {
                setError('Error fetching content IDs');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchIds();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <Text>{error}</Text>;
    }

    return (
        <Box>
            <TableContainer>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>Title</Th>
                            <Th>Status</Th>
                            <Th>Created At</Th>
                            <Th>Logs</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {ids.map(id => (
                            <TableRowContentPopup key={id} id={id} />
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ContentPopupTable;
