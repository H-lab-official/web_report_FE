import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Type definitions
interface ShareData {
    datetime: string;
    social: string;
}

interface FavData {
    status: string;
    datetime: string;
}

interface ViewData {
    userId: string;
    viewCount: number;
    lastView: string;
}

interface ShareInteractionMap {
    [key: string]: { [key: string]: ShareData };
}

interface FavInteractionMap {
    [key: string]: { [key: string]: FavData };
}

// Function to export data to Excel
export const exportToExcel = async (
    selectedLikes: string[],
    selectedShares: ShareInteractionMap,
    selectedFavs: FavInteractionMap,
    selectedViews: ViewData[]
) => {
    // Helper function to fetch user details
    const fetchUserDetailsForExport = async (userIds: string[]): Promise<{ [key: string]: string }> => {
        try {
            const responses = await Promise.all(
                userIds.map(userId =>
                    axios.get(`http://localhost:3000/users`, { params: { user_id: userId } })
                )
            );

            const userMap: { [key: string]: string } = {};
            responses.forEach((response) => {
                if (response.data.length > 0) {
                    const user = response.data[0];
                    userMap[user.id] = user.name;
                }
            });
            return userMap;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return {};
        }
    };

    // Fetch user details for likes, shares, favs, and views
    const likedUsersMap = await fetchUserDetailsForExport(selectedLikes);
    const sharedUsersMap = await fetchUserDetailsForExport(Object.keys(selectedShares));
    const favUsersMap = await fetchUserDetailsForExport(Object.keys(selectedFavs));
    const viewedUsersMap = await fetchUserDetailsForExport(selectedViews.map(view => view.userId));

    // Define parse functions for each interaction type
    const parseLikes = (items: string[]) =>
        items.map((userId, index) => ({
            No: index + 1,
            Name: likedUsersMap[userId] || 'Unknown',
            User_ID: userId,
        }));

    const parseShares = (items: [string, { [key: string]: ShareData }][]) =>
        items.flatMap(([userId, shares], index) =>
            Object.entries(shares).map(([shareId, shareData]) => ({
                No: index + 1,
                User_ID: userId,
                Name: sharedUsersMap[userId] || 'Unknown',
                Time: shareData.datetime,
                Social: shareData.social,
            }))
        );

    const parseFavs = (items: [string, { [key: string]: FavData }][]) =>
        items.flatMap(([userId, userFavs], index) =>
            Object.entries(userFavs).map(([favId, favData]) => ({
                No: index + 1,
                User_ID: userId,
                Name: favUsersMap[userId] || 'Unknown',
                Status: favData.status,
                DateTime: favData.datetime,
            }))
        );

    const parseViews = (items: ViewData[]) =>
        items.map((view, index) => ({
            No: index + 1,
            User_ID: view.userId,
            User_Name: viewedUsersMap[view.userId] || 'Unknown',
            View_Count: view.viewCount,
            Last_View: view.lastView,
        }));

    // Function to create sheets for user interactions
    const createUserSheet = <T,>(items: T[], parseFunc: (items: T[]) => any[]): XLSX.WorkSheet => {
        const userLogs = parseFunc(items);
        return XLSX.utils.json_to_sheet(userLogs);
    };

    // Create the sheets for user interactions
    const userLikesSheet = createUserSheet(selectedLikes, parseLikes);
    const userSharesSheet = createUserSheet(Object.entries(selectedShares), parseShares);
    const userFavsSheet = createUserSheet(Object.entries(selectedFavs), parseFavs);
    const userViewsSheet = createUserSheet(selectedViews, parseViews);

    // Create a new workbook and append all sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, userLikesSheet, "User Likes");
    XLSX.utils.book_append_sheet(wb, userSharesSheet, "User Shares");
    XLSX.utils.book_append_sheet(wb, userFavsSheet, "User Favs");
    XLSX.utils.book_append_sheet(wb, userViewsSheet, "User Views");

    // Write the workbook and trigger the download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "user_interactions.xlsx");
};
