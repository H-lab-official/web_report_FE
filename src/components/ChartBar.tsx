import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, BarElement, LinearScale, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Register the plugin
Chart.register(CategoryScale, BarElement, LinearScale, Tooltip, Legend, ChartDataLabels);

interface LogData {
    id: number;
    log_content: string;
    created_at: string;
    updated_at: string;
    user_id: number;
    name: string;
    current_rank: string | null;
}

const LoginChart: React.FC = () => {
    const [timeRange, setTimeRange] = useState<string>("24h");
    const [logData, setLogData] = useState<LogData[]>([]);
    const [filteredData, setFilteredData] = useState<LogData[]>([]);
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const chartRef = useRef<HTMLDivElement | null>(null);
    
    // State for counts in each time range
    const [count24h, setCount24h] = useState<number>(0);
    const [count7d, setCount7d] = useState<number>(0);
    const [count1m, setCount1m] = useState<number>(0);
    const [count1y, setCount1y] = useState<number>(0);
    const [countAll, setCountAll] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(0);
    useEffect(() => {
        // Fetch data when the component mounts
        const fetchLogData = async () => {
            try {
                const response = await axios.get<LogData[]>(
                    `${import.meta.env.VITE_API_URL}/logs?log_content=login_page`
                );
                setLogData(response.data);
            } catch (error) {
                console.error("Error fetching log data:", error);
            }
        };

        fetchLogData();
    }, []);

    // Function to calculate login counts for each time range
    const calculateCounts = () => {
        const now = new Date();

        // 24 hours count
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const count24h = logData.filter((log) => new Date(log.created_at) >= last24Hours).length;

        // 7 days count
        const last7Days = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        const count7d = logData.filter((log) => new Date(log.created_at) >= last7Days).length;

        // 1 month count (30 days)
        const last30Days = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        const count1m = logData.filter((log) => new Date(log.created_at) >= last30Days).length;

        // 1 year count (365 days)
        const last365Days = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000);
        const count1y = logData.filter((log) => new Date(log.created_at) >= last365Days).length;

        // All count
        const countAll = logData.length;

        // Update state
        setCount24h(count24h);
        setCount7d(count7d);
        setCount1m(count1m);
        setCount1y(count1y);
        setCountAll(countAll);
    };

    useEffect(() => {
        calculateCounts(); // Calculate counts when logData changes
    }, [logData]);

    useEffect(() => {
        const filterDataByTimeRange = () => {
            let filtered: LogData[] = [];
            const now = new Date(); // Current date

            switch (timeRange) {
                case "24h": {
                    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    filtered = logData.filter((log) => new Date(log.created_at) >= last24Hours);
                    break;
                }
                case "7d": {
                    const last7Days = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
                    filtered = logData.filter((log) => new Date(log.created_at) >= last7Days);
                    break;
                }
                case "1m": {
                    const last30Days = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
                    filtered = logData.filter((log) => new Date(log.created_at) >= last30Days);
                    break;
                }
                case "1y": {
                    const last365Days = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000);
                    filtered = logData.filter((log) => new Date(log.created_at) >= last365Days);
                    break;
                }
                case "all": {
                    filtered = logData; // Show all data
                    break;
                }
                case "custom": {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    filtered = logData.filter((log) => {
                        const logDate = new Date(log.created_at);
                        return logDate >= start && logDate <= end;
                    });
                    break;
                }
                default:
                    break;
            }
            setFilteredData(filtered);
            setTotalCount(filtered.length);
        };

        filterDataByTimeRange();
    }, [timeRange, logData, customStartDate, customEndDate]);

    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range);
    };

    const handleExportPDF = () => {
        const chartElement = chartRef.current;
        if (chartElement) {
            html2canvas(chartElement).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF();
                pdf.addImage(imgData, "PNG", 10, 10, 190, 100);
                pdf.save("login_chart.pdf");
            });
        }
    };

    // Count logins per day for the chart
    const loginCountsByDate = filteredData.reduce((acc, log) => {
        const date = new Date(log.created_at).toLocaleDateString(); 
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += 1;
        return acc;
    }, {} as { [date: string]: number });

    const chartData = {
        labels: Object.keys(loginCountsByDate), 
        datasets: [
            {
                label: "Login Count",
                data: Object.values(loginCountsByDate), 
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: true,
                color: "black",
                font: {
                    // weight: `bold`,
                },
                formatter: (value: number) => {
                    return value;
                },
            },
        },
    };

    return (
        <div className="p-3">
            <div className="bg-slate-400 text-white p-3 flex flex-row justify-evenly items-center rounded-xl">
                <button
                    onClick={() => handleTimeRangeChange("24h")}
                    className={`px-4 py-2 rounded-lg font-semibold ${timeRange === "24h" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                >
                    24 ชั่วโมงล่าสุด ({count24h})
                </button>
                <button
                    onClick={() => handleTimeRangeChange("7d")}
                    className={`px-4 py-2 rounded-lg font-semibold ${timeRange === "7d" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                >
                    7 วันล่าสุด ({count7d})
                </button>
                <button
                    onClick={() => handleTimeRangeChange("1m")}
                    className={`px-4 py-2 rounded-lg font-semibold ${timeRange === "1m" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                >
                    1 เดือนล่าสุด ({count1m})
                </button>
                <button
                    onClick={() => handleTimeRangeChange("1y")}
                    className={`px-4 py-2 rounded-lg font-semibold ${timeRange === "1y" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                >
                    1 ปีล่าสุด ({count1y})
                </button>
                <button
                    onClick={() => handleTimeRangeChange("all")}
                    className={`px-4 py-2 rounded-lg font-semibold ${timeRange === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                >
                    ทั้งหมด ({countAll})
                </button>
                <button
                    onClick={() => handleTimeRangeChange("custom")}
                    className={`px-4 py-2 rounded-lg font-semibold ${timeRange === "custom" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                >
                    กำหนดเอง ({totalCount})
                </button>

                <button onClick={handleExportPDF} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold">Export to PDF</button>
            </div>

            {timeRange === "custom" && (
                <div className="bg-slate-200 p-3 flex flex-row justify-end items-center gap-5 rounded-lg">
                    <label>วันเริ่มต้น:</label>
                    <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                    <label>วันสิ้นสุด:</label>
                    <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                    <button onClick={() => handleTimeRangeChange("custom")}>กรองข้อมูล</button>
                </div>
            )}

            <div ref={chartRef}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default LoginChart;
