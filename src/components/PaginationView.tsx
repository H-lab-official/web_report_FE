import React, { useState } from 'react';
import { Box, Button, ButtonGroup, Text, Tr } from '@chakra-ui/react';

interface PaginationViewProps<T> {
    itemsPerPage: number;
    totalItems: number;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
}

const PaginationView = <T extends unknown>({ itemsPerPage, totalItems, items, renderItem }: PaginationViewProps<T>) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <>
            {getPageItems().map(renderItem)}

            <Box mt={4} display="flex" justifyContent="center" alignItems="center">
               
                    <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
                        Previous
                    </Button>
                    <Text mx={2}>
                        Page {currentPage} of {totalPages}
                    </Text>
                    <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
                        Next
                    </Button>
              
            </Box>
        </>
    );
};

export default PaginationView;
