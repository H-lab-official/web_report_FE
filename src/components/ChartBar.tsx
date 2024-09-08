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
    //24hr
    const [changeToday, setChangeToday] = useState<number>(0);
    const [changeYesterday, setChangeYesterday] = useState<number>(0);
    //7d
    const [last7dChange, setLast7dChange] = useState<number>(0);
    const [beforeLast7dChange, setBeforeLast7dChange] = useState<number>(0)
    //1M
    const [last1mChange, setLast1mChange] = useState<number>(0);
    const [beforeLast1mChange, setBeforeLast1mChange] = useState<number>(0)
    //1Y
    const [last1yChange, setLast1yChange] = useState<number>(0);
    const [beforeLast1yChange, setBeforeLast1yChange] = useState<number>(0)


    // State for counts in each time range
    const [count24h, setCount24h] = useState<number>(0);
    const [countYesterday, setCountYesterday] = useState<number>(0);
    const [countDayBeforeYesterday, setCountDayBeforeYesterday] = useState<number>(0);

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

    const [count7dBeforeLast, setCount7dBeforeLast] = useState<number>(0);
    const [count7d, setCount7d] = useState<number>(0);
    const [count1mBeforeLast, setCount1mBeforeLast] = useState<number>(0);
    const [count1mLast, setCount1mLast] = useState<number>(0);
    const [count1yBeforeLast, setCount1yBeforeLast] = useState<number>(0);
    const [count1yLast, setCount1yLast] = useState<number>(0);
    const [count7dBeforeBeforeLast, setCount7dBeforeBeforeLast] = useState<number>(0);
    const [count1mBeforeBeforeLast, setCount1mBeforeBeforeLast] = useState<number>(0);
    const [count1yBeforeBeforeLast, setCount1yBeforeBeforeLast] = useState<number>(0);

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

        const endOfToday = new Date(now);
        ///1
        const filtered24hData = logData.filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= startOfToday && logDate <= endOfToday;
        });

        const count24h = filtered24hData.length;
        ///2
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        const countYesterday = logData.filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= startOfYesterday && logDate <= endOfYesterday;
        }).length;

        const startOfDayBeforeYesterday = new Date(startOfYesterday);
        startOfDayBeforeYesterday.setDate(startOfDayBeforeYesterday.getDate() - 1);
        const endOfDayBeforeYesterday = new Date(startOfDayBeforeYesterday);
        endOfDayBeforeYesterday.setHours(23, 59, 59, 999);

        const countDayBeforeYesterday = logData.filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= startOfDayBeforeYesterday && logDate <= endOfDayBeforeYesterday;
        }).length;

        // คำนวณจำนวนล็อกอินย้อนหลัง 7 วัน
        const last7Days = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        const count7dLast = logData.filter((log) => new Date(log.created_at) >= last7Days && new Date(log.created_at) <= endOfToday).length;

        const startOfBeforeLast7Days = new Date(last7Days.getTime() - 7 * 24 * 60 * 60 * 1000);
        const count7dBeforeLast = logData.filter((log) => new Date(log.created_at) >= startOfBeforeLast7Days && new Date(log.created_at) <= last7Days).length;

        const startOfBeforeBeforeLast7Days = new Date(startOfBeforeLast7Days.getTime() - 7 * 24 * 60 * 60 * 1000);
        const count7dBeforeBeforeLast = logData.filter((log) => new Date(log.created_at) >= startOfBeforeBeforeLast7Days && new Date(log.created_at) <= startOfBeforeLast7Days).length;

        // คำนวณจำนวนล็อกอินย้อนหลัง 1 เดือน
        const last30Days = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        const startOfBeforeLast30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startOfBeforeBeforeLast30Days = new Date(startOfBeforeLast30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

        const count1mLast = logData.filter((log) => new Date(log.created_at) >= last30Days && new Date(log.created_at) <= endOfToday).length;
        const count1mBeforeLast = logData.filter((log) => new Date(log.created_at) >= startOfBeforeLast30Days && new Date(log.created_at) <= last30Days).length;
        const count1mBeforeBeforeLast = logData.filter((log) => new Date(log.created_at) >= startOfBeforeBeforeLast30Days && new Date(log.created_at) <= startOfBeforeLast30Days).length;

        // คำนวณจำนวนล็อกอินย้อนหลัง 1 ปี
        const last365Days = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000);
        const startOfBeforeLast365Days = new Date(last365Days.getTime() - 365 * 24 * 60 * 60 * 1000);
        const startOfBeforeBeforeLast365Days = new Date(startOfBeforeLast365Days.getTime() - 365 * 24 * 60 * 60 * 1000);

        const count1yLast = logData.filter((log) => new Date(log.created_at) >= last365Days && new Date(log.created_at) <= endOfToday).length;
        const count1yBeforeLast = logData.filter((log) => new Date(log.created_at) >= startOfBeforeLast365Days && new Date(log.created_at) <= last365Days).length;
        const count1yBeforeBeforeLast = logData.filter((log) => new Date(log.created_at) >= startOfBeforeBeforeLast365Days && new Date(log.created_at) <= startOfBeforeLast365Days).length;

        const countAll = logData.length;
        // console.log('===============logData=====================');
        // console.log(logData);
        // console.log('================count1yLast====================');
        // console.log(count1yLast);
        // console.log('====================================');

        // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
        const todayChange = calculatePercentageChange(count24h, countYesterday);
        const yesterdayChange = calculatePercentageChange(countYesterday, countDayBeforeYesterday);

        const last7dChange = calculatePercentageChange(count7dLast, count7dBeforeLast);
        const beforeLast7dChange = calculatePercentageChange(count7dBeforeLast, count7dBeforeBeforeLast);

        const last1mChange = calculatePercentageChange(count1mLast, count1mBeforeLast);
        const beforeLast1mChange = calculatePercentageChange(count1mBeforeLast, count1mBeforeBeforeLast);

        const last1yChange = calculatePercentageChange(count1yLast, count1yBeforeLast);
        const beforeLast1yChange = calculatePercentageChange(count1yBeforeLast, count1yBeforeBeforeLast);

        // Set state values
        setChangeToday(todayChange);
        setChangeYesterday(yesterdayChange);

        setCount24h(count24h);
        setCountYesterday(countYesterday);
        setCountDayBeforeYesterday(countDayBeforeYesterday);
        //การเปลี่ยน ของ 7 วัน
        setLast7dChange(last7dChange)
        setBeforeLast7dChange(beforeLast7dChange)

        setCount7d(count7dLast);
        setCount7dBeforeLast(count7dBeforeLast);
        setCount7dBeforeBeforeLast(count7dBeforeBeforeLast);
        // การเปลี่ยน 1 เดือน
        setLast1mChange(last1mChange)
        setBeforeLast1mChange(beforeLast1mChange)

        setCount1m(count1mLast);
        setCount1mBeforeLast(count1mBeforeLast);
        setCount1mBeforeBeforeLast(count1mBeforeBeforeLast);

        //การเปลี่ยน 1 ปี
        setLast1yChange(last1yChange)
        setBeforeLast1yChange(beforeLast1yChange)

        setCount1y(count1yLast);
        setCount1yBeforeLast(count1yBeforeLast);
        setCount1yBeforeBeforeLast(count1yBeforeBeforeLast);

        setCountAll(countAll);

        // Update filtered data for charts
        setFilteredData(filtered24hData);
    };

    const calculatePercentageChange = (currentCount: number, previousCount: number) => {
        if (previousCount > 0) {
            return ((currentCount - previousCount) / previousCount) * 100;
        }
        return 0; // ถ้า previousCount เป็น 0 จะคืนค่า 0%
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
        const chartElements = document.querySelectorAll(".chart-section"); // เลือกทุกกราฟที่มี class เป็น chart-section

        const pdf = new jsPDF("p", "mm", "a4"); // สร้างไฟล์ PDF ขนาด A4

        let promises = Array.from(chartElements).map((chartElement, index) => {
            return html2canvas(chartElement as HTMLElement).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const imgWidth = 190; // ความกว้างของภาพใน PDF
                const pageHeight = 295; // ความสูงของหน้า PDF
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const position = 10 + index * (imgHeight + 10); // ตำแหน่ง y ที่จะเพิ่มรูป

                // ถ้าอยู่ในหน้าแรก ให้เพิ่มรูปไปเรื่อยๆ
                if (index === 0) {
                    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                } else {
                    // สำหรับรูปที่อยู่หน้าใหม่ ให้เพิ่มหน้าใหม่แล้วเพิ่มรูป
                    pdf.addPage();
                    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
                }
            });
        });

        Promise.all(promises).then(() => {
            pdf.save("login_chart.pdf"); // บันทึกไฟล์ PDF เมื่อทำการจับภาพเสร็จแล้ว
        });
    };

    const loginCountsByDate = filteredData.reduce((acc, log) => {
        const logDate = new Date(log.created_at).toLocaleDateString(); // Format log date as "dd/mm/yyyy"

        if (!acc[logDate]) {
            acc[logDate] = 0;
        }
        acc[logDate] += 1;
        return acc;
    }, {} as { [date: string]: number });



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
    // สำหรับ 7 วัน
    const lineChartData7d = {
        labels: ["ช่วงก่อนหน้า", "ช่วงที่ผ่านมา", "ปัจจุบัน"],
        datasets: [
            {
                label: "จำนวนล็อกอิน",
                data: [count7dBeforeBeforeLast, count7dBeforeLast, count7d],
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                fill: true,
            },
        ],
    };

    // สำหรับ 1 เดือน
    const lineChartData1m = {
        labels: ["ช่วงก่อนหน้า", "ช่วงที่ผ่านมา", "ปัจจุบัน"],
        datasets: [
            {
                label: "จำนวนล็อกอิน",
                data: [count1mBeforeBeforeLast, count1mBeforeLast, count1m],
                borderColor: "rgba(153, 102, 255, 1)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                fill: true,
            },
        ],
    };

    // สำหรับ 1 ปี
    const lineChartData1y = {
        labels: ["ช่วงก่อนหน้า", "ช่วงที่ผ่านมา", "ปัจจุบัน"],
        datasets: [
            {
                label: "จำนวนล็อกอิน",
                data: [count1yBeforeBeforeLast, count1yBeforeLast, count1y],
                borderColor: "rgba(255, 159, 64, 1)",
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                fill: true,
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
            }, datalabels: {
                display: false, // ปิดการแสดงตัวเลขบนข้อมูล
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
                    className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start items-center cursor-pointer ${timeRange === "24h" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    <div className=" text-white p-3 flex flex-col justify-evenly  items-center rounded-xl gap-2 ">
                        {/* การแสดงข้อมูลของวันนี้ */}
                        <div className="px-4  rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center  text-gray-600 gap-2">
                            <p className="text-[14px] w-[100px]">Today ({count24h})</p>
                            <p className="flex items-center text-[14px]">
                                {renderChangeIcon(changeToday)}
                                <span className="ml-2">
                                    {Math.abs(changeToday).toFixed(2)}%
                                </span>
                            </p>
                        </div>

                        {/* การแสดงข้อมูลของเมื่อวาน */}
                        <div className="px-4  rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center  text-gray-600 gap-2">
                            <p className="text-[14px]  w-[100px]">Yesterday ({countYesterday})</p>
                            <p className="flex items-center text-[14px]">
                                {renderChangeIcon(changeYesterday)}
                                <span className="ml-2">
                                    {Math.abs(changeYesterday).toFixed(2)}%
                                </span>
                            </p>
                        </div>
                        {/* กราฟแสดงข้อมูลของ 3 วัน */}
                        <div className="font-semibold h-12 w-52 flex flex-row justify-start items-center text-gray-700 gap-2 rounded-md ">
                            <Line data={lineChartData} options={lineChartOptions} className="px-4" />
                        </div>
                        {/* การแสดงข้อมูลของวานซืน */}
                        {/* <div className="px-4  rounded-lg font-semibold w-52  flex-col justify-start items-center  text-gray-700 hidden">
                            <p className="text-[14px]">วานซืน ({countDayBeforeYesterday})</p>
                        </div> */}
                    </div>
                </div>
                <div
                    onClick={() => handleTimeRangeChange("7d")}
                    className={`p-3 rounded-lg font-semibold h-40 w-52 flex cursor-pointer flex-col justify-start items-center ${timeRange === "7d" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"
                        }`}
                >

                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center text-gray-600 gap-2">
                        <p className="text-[0.8rem] w-[100px]">This Week ({count7d})</p>
                        <p className="flex items-center text-[14px]">
                            {renderChangeIcon(last7dChange)}
                            <span className="ml-2">
                                {Math.abs(last7dChange).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center text-gray-600 gap-2">
                        <p className="text-[0.8rem] w-[100px]">Last week ({count7dBeforeLast})</p>
                        <p className="flex items-center text-[14px]">
                            {renderChangeIcon(beforeLast7dChange)}
                            <span className="ml-2">
                                {Math.abs(beforeLast7dChange).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                    <div className="font-semibold h-12 w-52 flex flex-row justify-start items-center text-gray-700 gap-2 rounded-md mt-3">
                        <Line data={lineChartData7d} options={lineChartOptions} className="px-4" />
                    </div>
                </div>
                <div
                    onClick={() => handleTimeRangeChange("1m")}
                    className={`p-3  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start cursor-pointer items-center ${timeRange === "1m" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >

                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center text-gray-600 gap-2">
                        <p className="text-[0.7rem] w-[100px]">This month ({count1m})</p>
                        <p className="flex items-center text-[14px]">
                            {renderChangeIcon(last1mChange)}
                            <span className="ml-2">
                                {Math.abs(last1mChange).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center text-gray-600 gap-2">
                        <p className="text-[0.7rem] w-[100px]">Last month ({count1mBeforeLast})</p>
                        <p className="flex items-center text-[14px]">
                            {renderChangeIcon(beforeLast1mChange)}
                            <span className="ml-2">
                                {Math.abs(beforeLast1mChange).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                    <div className="font-semibold h-12 w-52 flex flex-row justify-start items-center text-gray-700 gap-2 rounded-md mt-4">
                        <Line data={lineChartData1m} options={lineChartOptions} className="px-4" />
                    </div>
                </div>
                <div
                    onClick={() => handleTimeRangeChange("1y")}
                    className={`p-3  rounded-lg font-semibold h-40 w-52 flex flex-col justify-start cursor-pointer items-center ${timeRange === "1y" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >

                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center text-gray-600 gap-2">
                        <p className="text-[0.7rem] w-[100px]">This years ({count1y})</p>
                        <p className="flex items-center text-[14px]">
                            {renderChangeIcon(last1yChange)}
                            <span className="ml-2">
                                {Math.abs(last1yChange).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-evenly items-center text-gray-600 gap-2">
                        <p className="text-[0.7rem] w-[100px]">This years ({count1yBeforeLast})</p>
                        <p className="flex items-center text-[14px]">
                            {renderChangeIcon(beforeLast1yChange)}
                            <span className="ml-2">
                                {Math.abs(beforeLast1yChange).toFixed(2)}%
                            </span>
                        </p>
                    </div>
                    <div className="font-semibold h-12 w-52 flex flex-row justify-start items-center text-gray-700 gap-2 rounded-md mt-3">
                        <Line data={lineChartData1y} options={lineChartOptions} className="px-4" />
                    </div>
                </div>
                {/* <div
                    onClick={() => handleTimeRangeChange("all")}
                    className={`p-3  rounded-lg font-semibold h-40 w-52 flex flex-col justify-center cursor-pointer items-center ${timeRange === "all" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                  
                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-center items-center  text-gray-600 ">
                        <p className="text-[0.9rem] w-full flex justify-center">All Data</p>

                    </div>
                </div> */}
                <div
                    onClick={() => handleTimeRangeChange("custom")}
                    className={`p-3  rounded-lg font-semibold h-40 w-52 flex flex-col justify-center cursor-pointer items-center ${timeRange === "custom" ? "border-2 border-gray-400 bg-white text-gray-600" : "bg-white text-gray-600"}`}
                >
                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-center items-center   text-gray-600 ">
                        {timeRange === "custom" ? ` กำหนดเอง (${totalCount})` : "กำหนดเอง"}
                    </div>

                </div>

                <div onClick={handleExportPDF} className={`px-4  rounded-lg font-semibold h-40 w-52 flex flex-col cursor-pointer justify-center items-center  bg-white text-gray-600 `}>
                    <div className="p-3 rounded-lg font-semibold h-8 w-52 flex flex-row justify-center items-center   text-gray-600 ">
                        Export to PDF
                    </div>

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
            <div className=" grid grid-cols-2 gap-4">
                <div className="chart-section mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Date</h2>
                    <Bar data={chartData} options={options} />
                </div>

                {/* Login Count by Role */}
                <div className="chart-section mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Role</h2>
                    <Bar data={roleChartData} options={options} />
                </div>

                {/* Login Count by Rank */}
                <div className="chart-section mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Rank</h2>
                    <Bar data={rankChartData} options={options} />
                </div>

                <div className="chart-section mt-6">
                    <h2 className="text-lg font-semibold mb-4">Login Count by Times</h2>
                    <Bar data={hourlyChartData} options={options} />
                </div>

            </div>
        </div>
    );
};

export default LoginChart;
