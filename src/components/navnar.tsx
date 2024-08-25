import { Box } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

const NavBar: React.FC = () => {
    const location = useLocation();

    // Define the active style
    const activeStyle = {
        backgroundColor: "#243286",
        color: "white",
    };

    return (
        <Box className="flex flex-row gap-5 justify-start items-center w-full ml-10">
            <Box
                className={`text-[#B8C6D8] hover:bg-[#7695f3] py-1 w-[130px] text-center rounded-full border-2 cursor-pointer ${location.pathname === "/" ? activeStyle : ""}`}

            >
                หน้า LOG-IN
            </Box>
            <Box
                className={`text-[#B8C6D8] hover:bg-[#7695f3] py-1 w-[130px] text-center rounded-full border-2 cursor-pointer`}
                style={location.pathname === "/home" ? activeStyle : {}}
            >
                HOME
            </Box>
            <Box
                className={`text-[#B8C6D8] hover:bg-[#7695f3] py-1 w-[130px] text-center rounded-full border-2 cursor-pointer`}
                style={location.pathname === "/training" ? activeStyle : {}}
            >
                TRAINING
            </Box>
            <Box
                className={`text-[#B8C6D8] hover:bg-[#7695f3] py-1 w-[130px] text-center rounded-full border-2 cursor-pointer`}
                style={location.pathname === "/product" ? activeStyle : {}}
            >
                PRODUCT
            </Box>
            <Box
                className={`text-[#B8C6D8] hover:bg-[#7695f3] py-1 w-[130px] text-center rounded-full border-2 cursor-pointer`}
                style={location.pathname === "/news" ? activeStyle : {}}
            >
                NEWS
            </Box>
            <Box
                className={`text-[#B8C6D8] hover:bg-[#7695f3] py-1 w-[130px] text-center rounded-full border-2 cursor-pointer`}
                style={location.pathname === "/tool" ? activeStyle : {}}
            >
                TOOL
            </Box>
            <Box
                className={`text-[#B8C6D8] hover:bg-[#7695f3] py-1 w-[130px] text-center rounded-full border-2 cursor-pointer`}
                style={location.pathname === "/user" ? activeStyle : {}}
            >
                USER
            </Box>
        </Box>
    );
};

export default NavBar;
