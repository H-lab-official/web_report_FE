import React, { useState, useEffect, useRef } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart, CategoryScale, BarElement, LinearScale, Tooltip, Legend, PointElement, LineElement, } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

// Register the plugin
Chart.register(CategoryScale, BarElement, LinearScale, Tooltip, Legend, ChartDataLabels, PointElement, LineElement);

interface LogData {
    id: number;
    log_content: string;
    created_at: string;
    updated_at: string;
    user_id: number;
    name: string;
    current_rank: string | null;
    role: string;
}

const LoginChart: React.FC = () => {
    const [timeRange, setTimeRange] = useState<string>("24h");
    const [logData, setLogData] = useState<LogData[]>([]);
    const [filteredData, setFilteredData] = useState<LogData[]>([]);
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");
    const chartRef = useRef<HTMLDivElement | null>(null);

    const [changeToday, setChangeToday] = useState<number>(0);
    const [changeYesterday, setChangeYesterday] = useState<number>(0);

    // State for counts in each time range
    const [count24h, setCount24h] = useState<number>(0);
    const [countYesterday, setCountYesterday] = useState<number>(0);
    const [countDayBeforeYesterday, setCountDayBeforeYesterday] = useState<number>(0);
    const [count7d, setCount7d] = useState<number>(0);
    const [count1m, setCount1m] = useState<number>(0);
    const [count1y, setCount1y] = useState<number>(0);
    const [countAll, setCountAll] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [hourlyChartData, setHourlyChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Login Count by Hour",
                data: [],
                backgroundColor: "rgba(255, 159, 64, 0.6)",
            },
        ],
    });


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
    const renderChangeIcon = (change: number) => {
        if (change > 0) {
            return <FaArrowUp className="text-green-500" />;
        } else if (change < 0) {
            return <FaArrowDown className="text-red-500" />;
        } else {
            return <span>-</span>;
        }
    };
    const calculateCounts = () => {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(now); // Current time of today

        const filtered24hData = logData.filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= startOfToday && logDate <= endOfToday; // Filter for today
        });

        // นับจำนวนล็อกอินสำหรับวันนี้
        const count24h = filtered24hData.length;


        // นับจำนวนล็อกอินสำหรับเมื่อวาน
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        const countYesterday = logData.filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= startOfYesterday && logDate <= endOfYesterday;
        }).length;

        // นับจำนวนล็อกอินของวานซืน
        const startOfDayBeforeYesterday = new Date(startOfYesterday);
        startOfDayBeforeYesterday.setDate(startOfDayBeforeYesterday.getDate() - 1);
        const endOfDayBeforeYesterday = new Date(startOfDayBeforeYesterday);
        endOfDayBeforeYesterday.setHours(23, 59, 59, 999);

        const countDayBeforeYesterday = logData.filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= startOfDayBeforeYesterday && logDate <= endOfDayBeforeYesterday;
        }).length;

        const last7Days = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  
        
        const count7d = logData.filter((log) => new Date(log.created_at) >= last7Days && new Date(log.created_at) <= endOfToday).length;


        const last30Days = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        const count1m = logData.filter((log) => new Date(log.created_at) >= last30Days && new Date(log.created_at) <= endOfToday).length;

        const last365Days = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000);
        const count1y = logData.filter((log) => new Date(log.created_at) >= last365Days && new Date(log.created_at) <= endOfToday).length;

        const countAll = logData.length;
        console.log(countAll);
        console.log(logData);
        
        

        const todayChange = countYesterday > 0 ? ((count24h - countYesterday) / countYesterday) * 100 : 0;
        const yesterdayChange = countDayBeforeYesterday > 0 ? ((countYesterday - countDayBeforeYesterday) / countDayBeforeYesterday) * 100 : 0;

        // Set state values
        setChangeToday(todayChange);
        setChangeYesterday(yesterdayChange);
        setCount24h(count24h);
        setCountYesterday(countYesterday);
        setCountDayBeforeYesterday(countDayBeforeYesterday);
        setCount7d(count7d);
        setCount1m(count1m);
        setCount1y(count1y);
        setCountAll(countAll);

        // Update filtered data for charts
        setFilteredData(filtered24hData);
    };



    useEffect(() => {
        calculateCounts();
    }, [logData]);

    useEffect(() => {
        const filterDataByTimeRange = () => {
            let filtered: LogData[] = [];
            const now = new Date();
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0); // เริ่มต้นที่ 00:00 ของวันนี้
            const endOfToday = new Date(now); // เวลาในปัจจุบันของวันนี้

            switch (timeRange) {
                case "24h": {
                    // ฟิลเตอร์ข้อมูลเฉพาะช่วงเวลาของวันนี้
                    filtered = logData.filter((log) => {
                        const logDate = new Date(log.created_at);
                        return logDate >= startOfToday && logDate <= endOfToday;
                    });
                    break;
                }

                case "7d": {
                    // กรองข้อมูลย้อนหลัง 6 วันเต็ม และรวมเวลาปัจจุบันของวันนี้ด้วย
                    const last7Days = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
                    filtered = logData.filter((log) => {
                        const logDate = new Date(log.created_at);
                        return logDate >= last7Days && logDate <= endOfToday; // รวมเวลาของวันนี้
                    });
                    break;
                }

                case "1m": {
                    const last30Days = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
                    filtered = logData.filter((log) => {
                        const logDate = new Date(log.created_at);
                        return logDate >= last30Days && logDate <= endOfToday;
                    });
                    break;
                }

                case "1y": {
                    const last365Days = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000);
                    filtered = logData.filter((log) => {
                        const logDate = new Date(log.created_at);
                        return logDate >= last365Days && logDate <= endOfToday;
                    });
                    break;
                }

                case "all": {
                    filtered = logData.filter((log) => {
                        const logDate = new Date(log.created_at);
                        return logDate <= endOfToday; // ดึงข้อมูลทั้งหมดจนถึงเวลาปัจจุบัน
                    });
                    break;
                }

                case "custom": {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    end.setHours(23, 59, 59, 999); // กำหนดเวลาสิ้นสุดของวันนั้นให้เป็น 23:59:59
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

            // คำนวณจำนวนการล็อกอินตามชั่วโมง
            const loginCountsByHour = filtered.reduce((acc, log) => {
                const logDate = new Date(log.created_at);
                const hour = logDate.getHours(); // ดึงค่าเวลาเป็นชั่วโมง
                const hourString = hour.toString().padStart(2, "0") + ":00"; // เปลี่ยนเป็นฟอร์แมต "00:00", "01:00" ฯลฯ

                if (!acc[hourString]) {
                    acc[hourString] = 0;
                }
                acc[hourString] += 1;

                return acc;
            }, {} as { [hour: string]: number });

            // อัปเดตข้อมูลกราฟต่อชั่วโมง
            setHourlyChartData({
                labels: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0") + ":00"),
                datasets: [
                    {
                        label: "Login Count by Hour",
                        data: Array.from({ length: 24 }, (_, i) => loginCountsByHour[i.toString().padStart(2, "0") + ":00"] || 0),
                        backgroundColor: "rgba(255, 159, 64, 0.6)",
                    },
                ],
            });
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
    const loginCountsByDate = filteredData.reduce((acc, log) => {
        const logDate = new Date(log.created_at).toLocaleDateString(); // Format log date as "dd/mm/yyyy"

        if (!acc[logDate]) {
            acc[logDate] = 0;
        }
        acc[logDate] += 1;
        return acc;
    }, {} as { [date: string]: number });
    console.log('test');

    console.log(loginCountsByDate);



    const loginCountsByRole = filteredData.reduce((acc, log) => {
        // Normalize the role to lowercase to handle case insensitivity
        const role = log.role ? log.role.toLowerCase() : "unknown"; // Handle null/undefined roles

        if (!acc[role]) {
            acc[role] = 0;
        }
        acc[role] += 1;
        return acc;
    }, {} as { [role: string]: number });

    const loginCountsByRank = filteredData.reduce((acc, log) => {
        const rank = log.current_rank === null || log.current_rank === "" ? "staff" : log.current_rank; // Handle null/empty ranks
        if (!acc[rank]) {
            acc[rank] = 0;
        }
        acc[rank] += 1;
        return acc;
    }, {} as { [rank: string]: number });

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

    const roleChartData = {
        labels: Object.keys(loginCountsByRole),
        datasets: [
            {
                label: "Login Count by Role",
                data: Object.values(loginCountsByRole),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
        ],
    };


    const rankChartData = {
        labels: Object.keys(loginCountsByRank),
        datasets: [
            {
                label: "Login Count by Rank",
                data: Object.values(loginCountsByRank),
                backgroundColor: "rgba(153, 102, 255, 0.6)", // Different color for rank chart
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

    // Line chart data for the past 3 days
    const lineChartData = {
        labels: ["วานซืน", "เมื่อวาน", "วันนี้"],
        datasets: [
            {
                label: "จำนวนล็อกอิน",
                data: [countDayBeforeYesterday, countYesterday, count24h],
                borderColor: "rgba(75, 192, 192, 1)", // Line color
                backgroundColor: "rgba(75, 192, 192, 0.2)", // Fill color
                fill: true, // Enable fill under the line
            },
        ],
    };

    // Line chart options
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false, // ปิดการรักษาสัดส่วนของกราฟ เพื่อให้กราฟขยายตามขนาด div
        plugins: {
            legend: {
                display: false, // ปิดการแสดง label ด้านบน
            },
            tooltip: {
                enabled: false,
            },
        },
        scales: {
            x: {
                display: false, // ซ่อนทั้งแกน X และเส้นกริด
            },
            y: {
                display: false, // ซ่อนทั้งแกน Y และเส้นกริด
            },
        },
        // },
    };

    return (
        <div className="p-3">
            <div className=" text-white p-3 flex flex-row justify-evenly  items-center rounded-xl gap-4">
                <div
                    onClick={() => handleTimeRangeChange("24h")}
                    className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center ${timeRange === "24h" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    <div className=" text-white p-3 flex flex-col justify-evenly  items-center rounded-xl gap-2 ">
                        {/* การแสดงข้อมูลของวันนี้ */}
                        <div className="px-4  rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center  text-gray-600 gap-2">
                            <p className="text-[14px] w-[100px]">วันปัจจุบัน ({count24h})</p>
                            <p className="flex items-center text-[14px]">
                                {renderChangeIcon(changeToday)}
                                <span className="ml-2">
                                    {Math.abs(changeToday).toFixed(2)}%
                                </span>
                            </p>
                        </div>

                        {/* การแสดงข้อมูลของเมื่อวาน */}
                        <div className="px-4  rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center  text-gray-600 gap-2">
                            <p className="text-[14px]  w-[100px]">เมื่อวาน ({countYesterday})</p>
                            <p className="flex items-center text-[14px]">
                                {renderChangeIcon(changeYesterday)}
                                <span className="ml-2">
                                    {Math.abs(changeYesterday).toFixed(2)}%
                                </span>
                            </p>
                        </div>
                        {/* กราฟแสดงข้อมูลของ 3 วัน */}
                        <div className="font-semibold h-12 w-52 flex flex-row justify-start items-center text-gray-700 gap-2 rounded-md border-[1px] border-gray-100">
                            <Line data={lineChartData} options={lineChartOptions} className="px-4"/>
                        </div>
                        {/* การแสดงข้อมูลของวานซืน */}
                        {/* <div className="px-4  rounded-lg font-semibold w-52  flex-col justify-start items-center  text-gray-700 hidden">
                            <p className="text-[14px]">วานซืน ({countDayBeforeYesterday})</p>
                        </div> */}
                    </div>
                </div>
                <div
                    onClick={() => handleTimeRangeChange("7d")}
                    className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center ${timeRange === "24h" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    7 วันล่าสุด ({count7d})
                    
                </div>
                <div
                    onClick={() => handleTimeRangeChange("1m")}
                    className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center ${timeRange === "24h" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    1 เดือนล่าสุด ({count1m})
                </div>
                <div
                    onClick={() => handleTimeRangeChange("1y")}
                    className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center ${timeRange === "24h" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    1 ปีล่าสุด ({count1y})
                </div>
                <div
                    onClick={() => handleTimeRangeChange("all")}
                    className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center ${timeRange === "24h" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    ทั้งหมด ({countAll})
                </div>
                <div
                    onClick={() => handleTimeRangeChange("custom")}
                    className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center ${timeRange === "24h" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    กำหนดเอง ({totalCount})
                </div>

                <div onClick={handleExportPDF} className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center border-2 border-gray-400 bg-white text-gray-600 `}>
                    Export to PDF
                </div>
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
            <div className="grid grid-cols-2 gap-4">
                <div ref={chartRef} className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Date</h2>
                    <Bar data={chartData} options={options} />
                </div>

                {/* Login Count by Role */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Role</h2>
                    <Bar data={roleChartData} options={options} />
                </div>

                {/* Login Count by Rank */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Rank</h2>
                    <Bar data={rankChartData} options={options} />
                </div>
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Times</h2>
                    <Bar data={hourlyChartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default LoginChart;
ช่วยเหมือน 24hr ในช่วยของ ช่วงเวลาอื่นๆ เช่น 7d ก็ทำย้อนหลัง ไป 3 ช่วงเวลา(รวมปัจจุบันด้วย)
ทำ 1 m 1y ด้วย