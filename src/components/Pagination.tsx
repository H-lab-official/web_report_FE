import React from 'react';
import { Box, Button, ButtonGroup } from '@chakra-ui/react';
interface PaginationProps {
    totalPages: number;
    currentPage: number;
    goToPage: (page: number) => void;
    goToPreviousPage: () => void;
    goToNextPage: () => void;
}
const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, goToPage, goToPreviousPage, goToNextPage }) => {
    const getPageNumbers = (): (number | string)[] => {
        const pageNumbers: (number | string)[] = [];
        const maxPageNumbers = 5;

        if (totalPages <= maxPageNumbers) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(currentPage - 2, 1);
            let endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

            if (endPage === totalPages) {
                startPage = totalPages - maxPageNumbers + 1;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (startPage > 1) {
                pageNumbers.unshift('...');
                pageNumbers.unshift(1);
            }

            if (endPage < totalPages) {
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    return (
        <Box mt={4} display="flex" justifyContent="center">
            <ButtonGroup>
                <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
                    Previous
                </Button>

                {getPageNumbers().map((number, index) =>
                    number === '...' ? (
                        <Button key={index} variant="ghost">
                            ...
                        </Button>
                    ) : (
                        <Button
                            key={index}
                            onClick={() => goToPage(Number(number))}
                            variant={currentPage === number ? 'solid' : 'outline'}
                        >
                            {number}
                        </Button>
                    )
                )}

                <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </ButtonGroup>
        </Box>
    );
};

export default Pagination;
