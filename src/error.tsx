import error404 from '@/assets/images/error404.png'
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="flex flex-col justify-center items-center text-[#3c3f46] h-screen">
      <div className="bg-white rounded-lg px-6  mx-6 mb-2 mt-12 max-w-2xl h-auto flex flex-col w-[400px] gap-3 justify-center items-center  ">
        <img src={error404} alt="" />
        <p className='text-[2rem] font-bold'>404</p>
        <p className='text-[2rem] font-bold'>Page Not Found</p>
        <button className=' bg-red-500 text-white w-[180px] h-9 rounded-full mt-5'><Link to="https://azayagencyjourney.com/tools">Go Home</Link></button>
      </div>
    </div>
  )
};

export default ErrorPage;
