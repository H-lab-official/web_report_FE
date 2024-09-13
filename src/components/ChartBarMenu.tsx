import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, BarElement, LinearScale, Tooltip, Legend } from "chart.js";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import html2canvas from "html2canvas"; // ใช้ในการจับภาพ
import jsPDF from "jspdf";
import { format, isSameDay } from "date-fns";
// Register necessary Chart.js components
Chart.register(CategoryScale, BarElement, LinearScale, Tooltip, Legend);

interface CountContentData {
    log_content: string;
    date?: string;
    count?: number;
    total_count?: number;
}

const MenuChart: React.FC = () => {
    const [menuClickData, setMenuClickData] = useState<number[]>([0, 0, 0, 0, 0]);
    const [countsByDate, setCountsByDate] = useState<CountContentData[]>([]);
    const [totalCounts, setTotalCounts] = useState<CountContentData[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [filteredData, setFilteredData] = useState<number[]>([0, 0, 0, 0, 0]);
    const [showTotal, setShowTotal] = useState<boolean>(true);
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const chartRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const fetchLogContentData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/countcontent`);

                if (response.data.countsByDate && Array.isArray(response.data.countsByDate)) {
                    setCountsByDate(response.data.countsByDate);
                }

                if (response.data.totalCounts && Array.isArray(response.data.totalCounts)) {
                    const totalData = response.data.totalCounts;
                    setTotalCounts(totalData);

                    const trainingMenuCount = totalData.find((item: any) => item.log_content === "Training_menu")?.total_count || 0;
                    const productMenuCount = totalData.find((item: any) => item.log_content === "Product_menu")?.total_count || 0;
                    const homeMenuCount = totalData.find((item: any) => item.log_content === "Home_menu")?.total_count || 0;
                    const toolsMenuCount = totalData.find((item: any) => item.log_content === "Tools_menu")?.total_count || 0;
                    const newsMenuCount = totalData.find((item: any) => item.log_content === "News_menu")?.total_count || 0;

                    setMenuClickData([trainingMenuCount, productMenuCount, homeMenuCount, toolsMenuCount, newsMenuCount]);
                } else {
                    console.error("Data received is not in expected format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching log content data:", error);
            }
        };

        fetchLogContentData();
    }, []);

    const handleFilterData = () => {
        if (!startDate || !endDate) {
            setHasSubmitted(true); // แสดงข้อความแจ้งเตือน
            return; // ออกจากฟังก์ชัน ไม่ทำงานต่อ
        }

        // ฟิลเตอร์ข้อมูลตามช่วงเวลาที่กำหนด
        const filtered = countsByDate.filter((data) => {
            const dataDate = new Date(data.date!);
            return (
                (isSameDay(dataDate, startDate) || dataDate >= startDate) &&
                (isSameDay(dataDate, endDate) || dataDate <= endDate)
            );
        });

        // นับรวมค่าทั้งหมดของแต่ละหัวข้อ
        const trainingMenuCount = filtered
            .filter(item => item.log_content === "Training_menu")
            .reduce((acc, curr) => acc + (curr.count || 0), 0);

        const productMenuCount = filtered
            .filter(item => item.log_content === "Product_menu")
            .reduce((acc, curr) => acc + (curr.count || 0), 0);

        const homeMenuCount = filtered
            .filter(item => item.log_content === "Home_menu")
            .reduce((acc, curr) => acc + (curr.count || 0), 0);

        const toolsMenuCount = filtered
            .filter(item => item.log_content === "Tools_menu")
            .reduce((acc, curr) => acc + (curr.count || 0), 0);

        const newsMenuCount = filtered
            .filter(item => item.log_content === "News_menu")
            .reduce((acc, curr) => acc + (curr.count || 0), 0);

        // อัปเดตข้อมูลที่กรอง
        setFilteredData([trainingMenuCount, productMenuCount, homeMenuCount, toolsMenuCount, newsMenuCount]);
        setShowTotal(false); // สลับไปแสดงข้อมูลที่กรอง
        setHasSubmitted(true);
    };

    // Prepare data for chart
    const chartData = {
        labels: ["Training Menu", "Product Menu", "Home Menu", "Tools Menu", "News Menu"], // Menu labels
        datasets: [
            {
                label: "Menu Clicks",
                data: startDate && endDate ? filteredData : menuClickData, // ถ้าเลือกช่วงเวลา ให้ใช้ข้อมูลที่กรอง
                backgroundColor: [
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                ],
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

    // ฟังก์ชันรีเซ็ตวันที่ใน input
    const resetDates = () => {
        setStartDate(null);
        setEndDate(null);
        setHasSubmitted(false);
    };
    const handleExportPDF = () => {
        const chartElement = chartRef.current;
        if (chartElement) {
            html2canvas(chartElement).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");

                // ขนาดของกระดาษ A4 (ใน pixel)
                const pdf = new jsPDF({
                    orientation: "landscape",
                    unit: "mm",
                    format: "a4",
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                // เพิ่มระยะขอบที่ต้องการ (เช่น 10mm)
                const margin = 10;
                const canvasWidth = pdfWidth - margin * 2;
                const canvasHeight = (canvas.height * canvasWidth) / canvas.width;

                // เพิ่มรูปภาพลงใน pdf และจัดให้พอดีกับขนาดและระยะขอบที่กำหนด
                pdf.addImage(
                    imgData,
                    "PNG",
                    margin, // ระยะห่างจากขอบซ้าย
                    margin, // ระยะห่างจากขอบบน
                    canvasWidth, // ความกว้างของภาพใน PDF
                    canvasHeight // ความสูงของภาพใน PDF
                );

                // บันทึกไฟล์ PDF
                pdf.save("chart.pdf");
            });
        }
    };


    return (
        <div className="p-4 ">
            <div className="my-4 flex flex-row justify-center items-center gap-5">
                <h2 className="text-lg font-semibold">จำนวนเข้าเมนูต่างๆ</h2>
                <button
                    onClick={() => {
                        setShowTotal(true);
                        resetDates(); // รีเซ็ตวันที่เมื่อกดปุ่ม "แสดงทั้งหมด"
                    }}
                    className={`bg-green-500 text-white px-4 py-2 rounded `}
                >
                    แสดงทั้งหมด
                </button>

                {/* ค้นหาตามช่วงเวลา */}

                <div className="my-4 flex flex-row items-center gap-5">
                    <div className="relative">
                        <label htmlFor="start-date">วันเริ่มต้น :  </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy" // ตั้งรูปแบบวันที่เป็น DD/MM/YYYY
                            className="mr-4"
                        />
                        {hasSubmitted && !startDate && (
                            <p className="text-red-500 mt-1 text-center absolute left-20">กรุณาเลือกวันเริ่มต้น</p>
                        )}
                    </div>
                    <div className="relative">
                        <label htmlFor="end-date">วันสิ้นสุด : </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy" // ตั้งรูปแบบวันที่เป็น DD/MM/YYYY
                            minDate={startDate || undefined} // ตั้งค่า minDate ให้เป็น undefined ถ้า startDate เป็น null
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
            <div ref={chartRef}>  <Bar data={chartData} options={options} /></div>

        </div>
    );
};

export default MenuChart;
