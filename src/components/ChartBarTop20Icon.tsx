import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, BarElement, LinearScale, Tooltip, Legend } from "chart.js";
import axios from "axios";
import html2canvas from "html2canvas"; // สำหรับจับภาพ
import jsPDF from "jspdf"; // สำหรับสร้าง PDF
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay } from "date-fns";
// Register necessary Chart.js components
Chart.register(CategoryScale, BarElement, LinearScale, Tooltip, Legend);

interface CountContentData {
    log_content: string;
    date?: string;
    count?: number;
    total_count?: number;
}

const IconChart: React.FC = () => {
    const [iconClickData, setIconClickData] = useState<CountContentData[]>([]);
    const [filteredData, setFilteredData] = useState<CountContentData[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null); // วันเริ่มต้น
    const [endDate, setEndDate] = useState<Date | null>(null); // วันสิ้นสุด
    const [showTotal, setShowTotal] = useState<boolean>(true); // เพื่อสลับการแสดงผลทั้งหมดหรือช่วงเวลา
    const [totalIconClickData, setTotalIconClickData] = useState<CountContentData[]>([]); // เก็บข้อมูลทั้งหมดไว้
    const chartRef = useRef<HTMLDivElement | null>(null); // ใช้ ref สำหรับจับภาพ
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false); // state สำหรับการกดปุ่ม

    // Fetch data from API
    useEffect(() => {
        const fetchLogContentData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/countcontent`);

                if (response.data.totalCounts && Array.isArray(response.data.totalCounts)) {
                    const filteredIcons = response.data.totalCounts
                        .filter((item: CountContentData) => item.log_content && item.log_content.endsWith('_icon')) // กรองเฉพาะที่ log_content ไม่เป็น null และลงท้ายด้วย _icon
                        .sort((a:any, b:any) => b.total_count! - a.total_count!) // เรียงข้อมูลจากมากไปน้อย
                        .slice(0, 20); // เลือกเฉพาะ Top 20

                    setIconClickData(filteredIcons); // ตั้งค่าเริ่มต้นเป็นข้อมูลทั้งหมด
                    setTotalIconClickData(filteredIcons); // เก็บข้อมูลทั้งหมดในตัวแปรใหม่
                } else {
                    console.error("Data received is not in expected format:", response.data);
                }

                if (response.data.countsByDate && Array.isArray(response.data.countsByDate)) {
                    const filteredIconsByDate = response.data.countsByDate
                        .filter((item: CountContentData) => item.log_content && item.log_content.endsWith('_icon'));
                    setFilteredData(filteredIconsByDate);
                }
            } catch (error) {
                console.error("Error fetching log content data:", error);
            }
        };

        fetchLogContentData();
    }, []);

    // ฟิลเตอร์ข้อมูลตามช่วงวันที่ที่กำหนด
    const handleFilterData = () => {
        if (!startDate || !endDate) {
            setHasSubmitted(true); // แสดงข้อความแจ้งเตือน
            return; // ออกจากฟังก์ชัน ไม่ทำงานต่อ
        }

        const filtered = filteredData.filter((data) => {
            const dataDate = new Date(data.date!);
            return (
                (isSameDay(dataDate, startDate) || dataDate >= startDate) &&
                (isSameDay(dataDate, endDate) || dataDate <= endDate)
            );
        });

        // จัดกลุ่มและรวมจำนวนคลิกของไอคอนที่ซ้ำกัน
        const groupedData = filtered.reduce((acc: Record<string, number>, curr) => {
            acc[curr.log_content] = (acc[curr.log_content] || 0) + (curr.count || 0);
            return acc;
        }, {});

        // แปลงข้อมูลกลับเป็น array และจัดเรียงตามจำนวนคลิก (จากมากไปน้อย)
        const sortedData = Object.keys(groupedData)
            .map((log_content) => ({
                log_content,
                count: groupedData[log_content],
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20); // เก็บเฉพาะ Top 20

        setIconClickData(sortedData);
        setShowTotal(false); // สลับไปแสดงข้อมูลที่กรอง
    };

    // ฟังก์ชันรีเซ็ตวันที่ใน input และแสดงข้อมูลทั้งหมด
    const resetDates = () => {
        setStartDate(null);
        setEndDate(null);
        setHasSubmitted(false);
        setShowTotal(true);
        setIconClickData(totalIconClickData); // คืนค่าข้อมูลทั้งหมด
    };

    // Prepare data for chart
    const chartData = {
        labels: iconClickData.map((data) => data.log_content), // Top 20 labels
        datasets: [
            {
                label: showTotal ? "Top Icon Clicks (All Time)" : "Top Icon Clicks (Filtered by Date)",
                data: iconClickData.map((data) => showTotal ? data.total_count : data.count), // Top 20 counts
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top" as const,
            },
            tooltip: {
                enabled: true,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    // ฟังก์ชันการ export กราฟเป็น PDF
    const handleExportPDF = () => {
        const chartElement = chartRef.current; // ใช้ ref ที่เราสร้างเพื่อจับภาพกราฟ
        if (chartElement) {
            html2canvas(chartElement).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "px",
                    format: [canvas.width, canvas.height],
                });
                pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
                pdf.save("chart.pdf");
            });
        }
    };

    return (
        <div className="p-4">
            <div className="flex flex-row  justify-center items-center gap-5">
                <h2 className="text-lg font-semibold">Top Icon Clicks</h2>
                <button
                    onClick={() => {
                        setShowTotal(true);
                        resetDates(); // รีเซ็ตวันที่เมื่อกดปุ่ม "แสดงทั้งหมด"
                    }}
                    className={`bg-green-500 text-white px-4 py-2 rounded `}
                >
                    แสดงทั้งหมด
                </button>
                <div className="my-4 flex flex-row items-center gap-5">
                    <div className="relative">
                        <label htmlFor="start-date">Start Date: </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="mr-4"
                        />
                        {hasSubmitted && !startDate && (
                            <p className="text-red-500 mt-1 text-center absolute left-20">กรุณาเลือกวันเริ่มต้น</p>
                        )}
                    </div>
                    <div className="relative">
                        <label htmlFor="end-date">End Date: </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            minDate={startDate || undefined}
                        />
                        {hasSubmitted && !endDate && (
                            <p className="text-red-500 mt-2 absolute left-20">กรุณาเลือกวันสิ้นสุด</p>
                        )}
                    </div>

                    <button
                        onClick={handleFilterData}
                        className="bg-green-500 text-white px-4 py-2 rounded ml-4"
                    >
                        ค้นหา
                    </button>

                    <button onClick={handleExportPDF} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Export to PDF
                    </button>
                </div>
            </div>
            <div ref={chartRef}> {/* อ้างอิง chart เพื่อให้สามารถจับภาพได้ */}
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default IconChart;
