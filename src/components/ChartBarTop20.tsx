import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, BarElement, LinearScale, Tooltip, Legend } from "chart.js";
import axios from "axios";
import html2canvas from "html2canvas"; // ใช้ในการจับภาพ
import jsPDF from "jspdf"; // ใช้ในการสร้าง PDF
import DatePicker from "react-datepicker"; // นำเข้า react-datepicker
import { format, isSameDay } from "date-fns"; // นำเข้า format และ isSameDay เพื่อเปรียบเทียบวันที่
import "react-datepicker/dist/react-datepicker.css"; // นำเข้า CSS ของ react-datepicker

// Register necessary Chart.js components
Chart.register(CategoryScale, BarElement, LinearScale, Tooltip, Legend);

interface CountContentData {
    total_count?: number;
    count?: number;
    log_content: string;
    date?: string;
}

const Top20Chart: React.FC = () => {
    const [logContentData, setLogContentData] = useState<CountContentData[]>([]);
    const [countsByDate, setCountsByDate] = useState<CountContentData[]>([]); // ใช้ข้อมูลทั้งหมดที่มีวันที่
    const [filteredData, setFilteredData] = useState<CountContentData[]>([]); // สำหรับกรองข้อมูลตามช่วงเวลา
    const [startDate, setStartDate] = useState<Date | null>(null); // วันเริ่มต้น
    const [endDate, setEndDate] = useState<Date | null>(null); // วันสิ้นสุด
    const [showTotal, setShowTotal] = useState<boolean>(true); // เพื่อสลับการแสดงผล
    const chartRef = useRef<HTMLDivElement | null>(null); // สร้าง ref สำหรับจับภาพ
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false); // state สำหรับการกดปุ่ม

    // Fetch data from API
    useEffect(() => {
        const fetchLogContentData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/countcontent`);

                if (response.data.totalCounts && Array.isArray(response.data.totalCounts)) {
                    const sortedTotalData = response.data.totalCounts.sort(
                        (a: CountContentData, b: CountContentData) => b.total_count! - a.total_count!
                    );
                    setLogContentData(sortedTotalData); // ข้อมูลรวม
                }

                if (response.data.countsByDate && Array.isArray(response.data.countsByDate)) {
                    const sortedFilteredData = response.data.countsByDate.sort(
                        (a: CountContentData, b: CountContentData) => b.count! - a.count!
                    );
                    setCountsByDate(sortedFilteredData); // ข้อมูลที่มีวันที่
                }
            } catch (error) {
                console.error("Error fetching log content data:", error);
            }
        };

        fetchLogContentData();
    }, []);

    // ฟิลเตอร์ข้อมูลตามช่วงวันที่
    const handleFilterData = () => {
        if (!startDate || !endDate) {
            setHasSubmitted(true); // แสดงข้อความแจ้งเตือน
            return;
        }

        // ฟิลเตอร์ข้อมูลจาก countsByDate ตามช่วงวันที่
        const filtered = countsByDate.filter((data) => {
            const dataDate = new Date(data.date!); // แปลงฟิลด์ date เป็น Date object

            // ตรวจสอบว่าข้อมูลอยู่ในช่วงวันที่ (รวมการเปรียบเทียบเมื่อวันเริ่มต้นและสิ้นสุดเป็นวันเดียวกัน)
            return (
                (isSameDay(dataDate, startDate) || dataDate >= startDate) &&
                (isSameDay(dataDate, endDate) || dataDate <= endDate)
            );
        });

        // จัดกลุ่มข้อมูลตาม log_content และนับจำนวนครั้งของ count
        const groupedData = filtered.reduce((acc: Record<string, number>, curr) => {
            acc[curr.log_content] = (acc[curr.log_content] || 0) + (curr.count || 0); // นับจำนวนครั้งของ log_content
            return acc;
        }, {});

        // แปลงข้อมูลกลับเป็น array และจัดเรียงตามจำนวนครั้งที่นับได้ (จากมากไปน้อย)
        const sortedData = Object.keys(groupedData)
            .map((log_content) => ({
                log_content,
                count: groupedData[log_content], // ใช้ค่า count ที่รวมแล้ว
            }))
            .sort((a, b) => b.count - a.count) // เรียงข้อมูลจากมากไปน้อย
            .slice(0, 20); // เก็บเฉพาะ Top 20

        // อัปเดตข้อมูลที่กรองแล้ว
        setFilteredData(sortedData); // อัปเดตข้อมูลที่ฟิลเตอร์แล้วใน state
        setShowTotal(false); // สลับไปแสดงข้อมูลที่กรอง
    };

    // ฟังก์ชันรีเซ็ตวันที่ใน input
    const resetDates = () => {
        setStartDate(null);
        setEndDate(null);
        setFilteredData([]); // รีเซ็ตข้อมูลที่กรอง
        setShowTotal(true); // กลับไปแสดงข้อมูลทั้งหมด
    };

    // ฟังก์ชันการ export กราฟเป็น PDF
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

    // เลือกข้อมูลที่จะใช้แสดงผลในกราฟ
    const displayedData = showTotal ? logContentData.slice(0, 20) : filteredData.slice(0, 20);

    // Prepare data for chart
    const chartData = {
        labels: displayedData.map((data) => data.log_content), // Top 20 labels
        datasets: [
            {
                label: showTotal ? "20 อันดับแรกที่คนเข้าเยอะที่สุด" : "20 อันดับแรกที่คนเข้าเยอะที่สุด(ตามช่วงเวลา)",
                data: displayedData.map((data) => showTotal ? data.total_count! : data.count!), // Top 20 counts
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
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

    return (
        <div className="p-4">
            <div className="flex flex-row justify-center items-center gap-10">
                <div className="flex flex-row items-center gap-3">
                    <h2 className="text-lg font-semibold">
                        {showTotal ? "20 อันดับแรกที่คนเข้าเยอะที่สุด" : "20 อันดับแรกที่คนเข้าเยอะที่สุด(ตามช่วงเวลา)"}
                    </h2>

                    <button
                        onClick={() => resetDates()}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        แสดงทั้งหมด
                    </button>
                </div>

                {/* ค้นหาตามช่วงเวลา */}
                <div className="my-4 flex flex-row items-center gap-5">
                    <div className="relative">
                        <label htmlFor="start-date">วันเริ่มต้น :  </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="mr-4"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="end-date">วันสิ้นสุด : </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            minDate={startDate || undefined}
                        />
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
            <div ref={chartRef}>
                {/* อ้างอิง chart เพื่อให้สามารถจับภาพได้ */}
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default Top20Chart;
