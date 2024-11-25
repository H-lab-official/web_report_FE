import { useState, useEffect } from 'react';
import {
    Tr, Td, Table,
    Thead,
    Tbody,
    Th,
    TableContainer,
    Spinner,
    Alert,
    AlertIcon,
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Flex,
    Button, Text,
} from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/th'; // ภาษาไทย
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

moment.locale('th'); // ตั้งค่า moment เป็นภาษาไทย

const TableFHC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [filterType, setFilterType] = useState<'day' | 'week' | 'month'>('day');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const planMap: { [key: string]: string } = {
        '1': 'ProtectionPlan',
        '2': 'HealthPlan',
        '3': 'RetirementPlan',
        '4': 'EducationPlan',
        '5': 'AllPlan',
    };

    const renderPlans = (plans: string[]) => {
        return plans.map((plan) => planMap[plan] || plan).join(', ');
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setLogs([]);

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL_2}/logs`);
                const allLogs = response.data;

                const filterDate = moment('2024-09-01T00:00:00.000Z');
                const filtered = allLogs.filter((log: any) =>
                    moment(log.timestamp).isSameOrAfter(filterDate)
                );

                const sortedLogs = filtered.sort((a: any, b: any) =>
                    moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf()
                );

                setLogs(sortedLogs);
            } catch (err) {
                setError('Error fetching logs');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (logs.length > 0) {
            prepareChartData(logs); // Re-generate chart data when filterType or logs change
        }
    }, [filterType, logs]);

    const prepareChartData = (logs: any[]) => {
        const groupedLogs: { [key: string]: number } = {};

        logs.forEach((log) => {
            const startOfUnit =
                filterType === 'day'
                    ? 'day'
                    : filterType === 'week'
                        ? 'isoWeek'
                        : 'month';

            const dateKey = moment(log.timestamp).startOf(startOfUnit).format('YYYY-MM-DD');
            groupedLogs[dateKey] = (groupedLogs[dateKey] || 0) + 1;
        });

        const labels = Object.keys(groupedLogs).sort();
        const data = labels.map((label) => groupedLogs[label]);

        setChartData({
            labels,
            datasets: [
                {
                    label: `Logs (${filterType})`,
                    data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        });
    };

    const handleFilterChange = (filter: 'day' | 'week' | 'month') => {
        setFilterType(filter);
    };

    const exportToExcel = (data: any[], fileName: string) => {
        const worksheet = XLSX.utils.json_to_sheet(
            data.map((log, index) => ({
                No: index + 1,
                AGENCY_code: log.user_params || 'N/A',
                Selected_Plans: log.selectedPlans ? renderPlans(log.selectedPlans) : 'N/A',
                Timestamp: moment(log.timestamp).format('DD MMM YYYY, HH:mm'),
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(dataBlob, `${fileName}_${moment().format('YYYYMMDD')}.xlsx`);
    };

    const totalPages = Math.ceil(logs.length / itemsPerPage);
    const currentLogs = logs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <Box>
            {loading ? (
                <Spinner />
            ) : error ? (
                <Alert status="error">
                    <AlertIcon />
                    {error}
                </Alert>
            ) : (
                <Tabs>
                    <TabList>
                        <Tab className={`cursor-pointer border-2 border-[#0E2B81] w-full rounded-full p-3 flex justify-center items-center bg-[#0E2B81] text-white`}>Logs</Tab>
                        <Tab className={`cursor-pointer border-2 border-[#0E2B81] w-full rounded-full p-3 flex justify-center items-center bg-[#0E2B81] text-white`}>Graph</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>No.</Th>
                                            <Th>AGENCY code</Th>
                                            <Th>Selected Plans</Th>
                                            <Th>Timestamp</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {currentLogs.map((log, index) => (
                                            <Tr key={log.id}>
                                                <Td>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
                                                <Td>{log.user_params || 'N/A'}</Td>
                                                <Td>
                                                    {log.selectedPlans
                                                        ? renderPlans(log.selectedPlans)
                                                        : 'N/A'}
                                                </Td>
                                                <Td>{moment(log.timestamp).format('DD MMM YYYY, HH:mm')}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                            <Flex justify="space-between" mt={4}>
                                <Button
                                    onClick={goToPreviousPage}
                                    isDisabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Text>
                                    Page {currentPage} of {totalPages}
                                </Text>
                                <Button
                                    onClick={goToNextPage}
                                    isDisabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </Flex>
                            <Button
                                mt={4}
                                colorScheme="green"
                                onClick={() => exportToExcel(logs, 'Logs')}
                            >
                                Export Logs to Excel
                            </Button>
                        </TabPanel>

                        <TabPanel>
                            <Flex gap={4} mb={4}>
                                <Button
                                    colorScheme={filterType === 'day' ? 'blue' : 'gray'}
                                    onClick={() => handleFilterChange('day')}
                                >
                                    Day
                                </Button>
                                <Button
                                    colorScheme={filterType === 'week' ? 'blue' : 'gray'}
                                    onClick={() => handleFilterChange('week')}
                                >
                                    Week
                                </Button>
                                <Button
                                    colorScheme={filterType === 'month' ? 'blue' : 'gray'}
                                    onClick={() => handleFilterChange('month')}
                                >
                                    Month
                                </Button>
                            </Flex>
                            {chartData ? (
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: `Logs Overview (${filterType})`,
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <Text>No data available for the selected filter</Text>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs >
            )}
        </Box >
    );
};

export default TableFHC;
