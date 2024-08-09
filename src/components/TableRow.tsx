import { useState } from 'react';
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
    Tfoot,

    Th,

    TableCaption,
    TableContainer,
} from '@chakra-ui/react';
import './css/TableRow.css'
interface TableRowProps {
    id: number;
    page: string;

}

const TableRow: React.FC<TableRowProps> = ({ id, page, }) => {
    const [timeStart, setTimeStart] = useState<string>('');
    const [timeEnd, setTimeEnd] = useState<string>('');
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <Tr>
            <Td>{id}</Td>
            <Td>{page}</Td>
            <Td><Input placeholder="กรูณาใส่ User Id" /></Td>
            <Td>
                <Input
                    placeholder='Select Date and Time'
                    size='md'
                    type='date'
                    onChange={(e) => setTimeStart(e.target.value)}
                />
            </Td>
            <Td>
                <Input
                    placeholder='Select Date and Time'
                    size='md'
                    type='date'
                    onChange={(e) => setTimeEnd(e.target.value)}
                />
            </Td>
            <Td><Button colorScheme='blue' className='rounded-md' onClick={onOpen}>Search</Button>

                <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
                    <ModalOverlay />
                    <ModalContent className="custom-modal-content">
                        <ModalHeader>Modal Title</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <TableContainer>
                                <Table variant='simple'>

                                    <Thead>
                                        <Tr>
                                            <Th>No.</Th>
                                            <Th>Data Type</Th>
                                            <Th>Search by userID</Th>
                                            <Th>Start Date</Th>
                                            <Th>End Date</Th>
                                            <Th>Active</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td></Td>
                                        </Tr>


                                    </Tbody>

                                </Table>
                            </TableContainer>

                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={onClose}>
                                Close
                            </Button>

                        </ModalFooter>
                    </ModalContent>
                </Modal></Td>
        </Tr>
    );
}

export default TableRow;
