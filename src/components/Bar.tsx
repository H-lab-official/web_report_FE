import React, { useState } from 'react';
import LoginChart from '@/components/ChartBarLogin';
import Top20Chart from '@/components/ChartBarTop20';
import MenuChart from '@/components/ChartBarMenu';
import IconChart from '@/components/ChartBarTop20Icon';
import ButtonChart from '@/components/ChartBarTop20Button';
import LoginAndLogoutChart from '@/components/ChartBarLoginAndLogout';

const Bar = () => {
    const [activeChart, setActiveChart] = useState<string>('LoginChart'); // ตั้งค่า default chart ที่ต้องการให้แสดง

    const renderChart = () => {
        switch (activeChart) {
            case 'LoginChart':
                return <LoginChart />;
            case 'Top20Chart':
                return <Top20Chart />;
            case 'MenuChart':
                return <MenuChart />;
            case 'IconChart':
                return <IconChart />;
            case 'ButtonChart':
                return <ButtonChart />;
            case 'LoginAndLogoutChart':
                return <LoginAndLogoutChart />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className='border-l-orange-300 w-full h-10 flex flex-row justify-evenly items-center mt-10'>
                <div onClick={() => setActiveChart('LoginChart')} className={`cursor-pointer border-2 border-[#0E2B81] w-48 rounded-full p-3 flex justify-center items-center ${activeChart==='LoginChart'?'bg-[#0E2B81] text-white':''}`}>
                    Login Chart
                </div>
                <div onClick={() => setActiveChart('Top20Chart')} className={`cursor-pointer border-2 border-[#0E2B81] w-48 rounded-full p-3 flex justify-center items-center ${activeChart==='Top20Chart'?'bg-[#0E2B81] text-white':''}`}>
                    Top20 Chart
                </div>
                <div onClick={() => setActiveChart('MenuChart')} className={`cursor-pointer border-2 border-[#0E2B81] w-48 rounded-full p-3 flex justify-center items-center ${activeChart==='MenuChart'?'bg-[#0E2B81] text-white':''}`}>
                    Menu Chart
                </div>
                <div onClick={() => setActiveChart('IconChart')} className={`cursor-pointer border-2 border-[#0E2B81] w-48 rounded-full p-3 flex justify-center items-center ${activeChart==='IconChart'?'bg-[#0E2B81] text-white':''}`}>
                    Icon Chart
                </div>
                <div onClick={() => setActiveChart('ButtonChart')} className={`cursor-pointer border-2 border-[#0E2B81] w-48 rounded-full p-3 flex justify-center items-center ${activeChart==='ButtonChart'?'bg-[#0E2B81] text-white':''}`}>
                    Button Chart
                </div>
                {/* <div onClick={() => setActiveChart('LoginAndLogoutChart')} className={`cursor-pointer border-2 border-[#0E2B81] w-48 rounded-full p-3 flex justify-center items-center ${activeChart==='LoginAndLogoutChart'?'bg-[#0E2B81] text-white':''}`}>
                    Login&LogoutChart
                </div> */}
            </div>

            <div className='mt-8'>
                {renderChart()}
            </div>
        </div>
    );
};

export default Bar;
