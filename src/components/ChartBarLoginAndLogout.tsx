import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, BarElement, LinearScale, Tooltip, Legend } from "chart.js";
import axios from "axios";
import html2canvas from "html2canvas"; // สำหรับจับภาพ
import jsPDF from "jspdf"; // สำหรับสร้าง PDF

// Register necessary Chart.js components
Chart.register(CategoryScale, BarElement, LinearScale, Tooltip, Legend);

interface CountContentData {
    _count: {
        log_content: number;
    };
    log_content: string | null;
}

const LoginAndLogoutChart: React.FC = () => {
    const [iconClickData, setIconClickData] = useState<CountContentData[]>([]);
    const chartRef = useRef<HTMLDivElement | null>(null); // ใช้ ref สำหรับจับภาพ

    // Fetch data from API
    useEffect(() => {
        const fetchLogContentData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/countcontent`);

                if (response.data.counts && Array.isArray(response.data.counts)) {
                    const filteredIcons = response.data.counts
                        .filter((item: CountContentData) => item.log_content && item.log_content.endsWith('_page')) // กรองเฉพาะที่ log_content ไม่เป็น null และลงท้ายด้วย _icon
                        .sort((a, b) => b._count.log_content - a._count.log_content) // เรียงข้อมูลจากมากไปน้อย
                        .slice(0, 20); // เลือกเฉพาะ Top 20
                        
                    setIconClickData(filteredIcons);
                } else {
                    console.error("Data received is not in expected format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching log content data:", error);
            }
        };

        fetchLogContentData();
    }, []);

    // Prepare data for chart
    const chartData = {
        labels: iconClickData.map((data) => data.log_content), // Top 20 labels
        datasets: [
            {
                label: "Top 20 Icon Clicks",
                data: iconClickData.map((data) => data._count.log_content), // Top 20 counts
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
                    orientation: "portrait",
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
            <h2 className="text-lg font-semibold mb-4">Login And Logout Clicks</h2>
            
            <div ref={chartRef}> {/* อ้างอิง chart เพื่อให้สามารถจับภาพได้ */}
                <Bar data={chartData} options={options} />
            </div>

            <button onClick={handleExportPDF} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Export to PDF
            </button>
        </div>
    );
};

export default LoginAndLogoutChart;
