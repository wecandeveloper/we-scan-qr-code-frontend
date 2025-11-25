import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

import "./OrderDashboard.scss"

import { RiExpandUpDownFill } from "react-icons/ri"
import { FaCaretLeft, FaCaretRight, FaCheck, FaUtensils } from "react-icons/fa6"
import { MdEditSquare, MdRemoveRedEye } from "react-icons/md"
import { FaHome } from "react-icons/fa";
import { IoIosClose, IoMdCheckmark, IoMdDownload } from "react-icons/io";
import { GiMeal, GiPaperBagFolded } from "react-icons/gi";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import ConfirmToast from "../../../../../Designs/ConfirmToast/ConfirmToast"
import AdminOrderCancelToast from "../../../../../Designs/ConfirmToast/AdminOrderCancelToast"
import "../../../../../Designs/ConfirmToast/AdminOrderCancelToast.scss"
import { BiSolidFoodMenu, BiSolidTrash } from "react-icons/bi"
import CustomAlert from "../../../../../Designs/CustomAlert"
import { toast } from "react-toastify"
import { IoArrowBack, IoClose, IoAdd, IoRefresh, IoFastFood } from "react-icons/io5";
import { startChangeOrderStatus, startGetRestaurantOrders, startDeleteOrder, startBulkDeleteOrders } from "../../../../../Actions/orderActions";
import { removeMultipleRecentOrdersFromStorage } from "../../../../../Utils/recentOrdersUtils";
import { cleanupDeletedOrders, cleanupSingleDeletedOrder } from "../../../../../Utils/orderCleanupUtils";
import { useAuth } from "../../../../../Context/AuthContext";
import {  LuUtensils } from "react-icons/lu";
import { TbPackageExport, TbTruckDelivery } from "react-icons/tb";
import handleExportRestaurantOrderPDF from "../../../../../Utils/pdfExports/handleExportRestaurantOrderPDF";
import handleExportSingleOrderPDF from "../../../../../Utils/pdfExports/handleExportSingleOrderPDF";
import { startGetMyRestaurant } from "../../../../../Actions/restaurantActions";
import { startGetCategories } from "../../../../../Actions/categoryActions";
import { startGetAllProducts } from "../../../../../Actions/productActions";
import { 
  getRecentOrdersFromStorage, 
  removeRecentOrderFromStorage, 
  markRecentOrderAsRead,
  saveRecentOrderToStorage,
  updateRecentOrderStatus 
} from "../../../../../Utils/recentOrdersUtils";
import { initializeDailyCleanup } from "../../../../../Utils/dailyCleanupUtils";
import { IoNotifications } from "react-icons/io5";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const UploadButton = styled(Button)(() => ({
    backgroundColor: "#470531",
    border: "1.5px solid #470531",
    color: '#fff',
    fontFamily: "Montserrat",
    width: '250px', // reduced width
    padding: '6px 10px',
    textTransform: 'none',
    fontWeight: 500,
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: "white",
        color: "#470531",
        border: "1.5px solid #470531",
    },
}))

function formatDeliveryDate(isoString) {
  const date = new Date(isoString);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  // Add ordinal suffix (1st, 2nd, 3rd, 4th...)
  const getOrdinalSuffix = (n) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `Order placed on ${dayName}, ${getOrdinalSuffix(day)} ${month}, ${formattedHour}:${formattedMinutes} ${ampm}`;
}

// Utility function to get status options based on order type
const getStatusOptions = (orderType) => {
    switch (orderType) {
        case 'Take-Away':
            return [
                { value: 'Order Received', label: 'Order Received' },
                { value: 'Preparing', label: 'Preparing' },
                { value: 'Ready for Collection', label: 'Ready for Collection' },
                { value: 'Collected', label: 'Collected' },
                { value: 'Cancelled', label: 'Cancelled' }
            ];
        case 'Dine-In':
            return [
                { value: 'Order Received', label: 'Order Received' },
                { value: 'Preparing', label: 'Preparing' },
                { value: 'Ready to Serve', label: 'Ready to Serve' },
                { value: 'Served', label: 'Served' },
                { value: 'Cancelled', label: 'Cancelled' }
            ];
        case 'Home-Delivery':
            return [
                { value: 'Order Received', label: 'Order Received' },
                { value: 'Preparing', label: 'Preparing' },
                { value: 'Out for Delivery', label: 'Out for Delivery' },
                { value: 'Delivered', label: 'Delivered' },
                { value: 'Cancelled', label: 'Cancelled' }
            ];
        default:
            return [
                { value: 'Order Received', label: 'Order Received' },
                { value: 'Preparing', label: 'Preparing' },
                { value: 'Ready', label: 'Ready' },
                { value: 'Cancelled', label: 'Cancelled' }
            ];
    }
};

export default function OrderDashboard({restaurant}) {
    const dispatch = useDispatch()
    const { user, handleDashboardMenuChange, restaurantId } = useAuth()
    const isLoggedIn = Boolean(user && user._id);

    const orders = useSelector((state) => {
        return state.orders.data
    })

    const orderTypes = [];

    if (restaurant?.isDineInAvailable) {
    orderTypes.push("Dine-In");
    }

    if (restaurant?.isHomeDeliveryAvailable) {
    orderTypes.push("Home-Delivery");
    }

    if (restaurant?.isTakeAwayAvailable) {
    orderTypes.push("Take-Away");
    }

    const icons = {
        "Dine-In": <GiMeal />,
        "Home-Delivery": <TbTruckDelivery/>,
        "Take-Away": <GiPaperBagFolded />,
        "All": <BiSolidFoodMenu />
    };

    const [ selectedOrderType, setSelectedOrderType ] = useState(null);
    const [ orderFilter, setOrderFilter ] = useState("daily")
    const [ fromDate, setFromDate ] = useState("");
    const [ toDate, setToDate ] = useState("");
    
    // Recent Orders states
    const [ recentOrders, setRecentOrders ] = useState([]);
    const [ selectedRecentOrders, setSelectedRecentOrders ] = useState([]);
    const [ selectAllRecentOrders, setSelectAllRecentOrders ] = useState(false);
    const [ showRecentOrders, setShowRecentOrders ] = useState(true);
    const [ expandedRecentOrder, setExpandedRecentOrder ] = useState(null);
    const [ recentOrderStatusUpdate, setRecentOrderStatusUpdate ] = useState({});
    
    // Delete confirmation states
    const [ showConfirmDeleteOrder, setShowConfirmDeleteOrder ] = useState(null);
    const [ showConfirmBulkDelete, setShowConfirmBulkDelete ] = useState(false);
    const [ showConfirmBulkDeleteTable, setShowConfirmBulkDeleteTable ] = useState(false);
    const [ isBulkDeleting, setIsBulkDeleting ] = useState(false);
    
    // Admin cancel reason toast states
    const [ showAdminCancelReasonToast, setShowAdminCancelReasonToast ] = useState(false);
    const [ cancelOrderData, setCancelOrderData ] = useState(null);
    
    // Refresh orders state
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    // derive start & end dates
    const getReportDates = () => {
        const today = new Date();
        let startDate, endDate;

        if (orderFilter === "daily") {
            startDate = today;
            endDate = today;
        } else if (orderFilter === "weekly") {
            const firstDayOfWeek = new Date(today);
            firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
            startDate = firstDayOfWeek;
            endDate = today;
        } else if (orderFilter === "monthly") {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (orderFilter === "custom") {
            startDate = fromDate ? new Date(fromDate) : null;
            endDate = toDate ? new Date(toDate) : null;
        }

        return { startDate, endDate };
    };

    const [ searchText, setSearchText ] = useState("")
    const [ sortBy, setSortBy ] = useState("")
    const [ showNo, setShowNo ] = useState(10)
    const [ currentPage, setCurrentPage ] = useState(1);

    const [ isViewSectionOpen, setIsViewSectionOpen ] = useState(false)
    const [ orderId, setOrderId ] = useState("")
    const [ order, setOrder ] = useState({})
    const [ orderStatus, setOrderStatus ] = useState("Order Received")

    // Bulk delete state
    const [ selectedOrders, setSelectedOrders ] = useState([])
    const [ selectAll, setSelectAll ] = useState(false)
    
    // Custom date search state
    const [ customDateSearch, setCustomDateSearch ] = useState(false)
    const show = false;

    useEffect(() => {
        let url;
        if (orderFilter === "custom") {
            // Don't fetch orders for custom filter until search is triggered
            return;
        } else if (orderFilter && orderFilter !== "custom") {
            url = `?filter=${orderFilter}`;
        } else {
            url = "";
        }
        if(isLoggedIn) {
            dispatch(startGetRestaurantOrders(url));
        }
    }, [isLoggedIn, dispatch, orderFilter]);

    // Separate useEffect for custom date search
    useEffect(() => {
        if (orderFilter === "custom" && customDateSearch && fromDate && toDate && isLoggedIn) {
            const url = `?filter=custom&from=${fromDate}&to=${toDate}`;
            dispatch(startGetRestaurantOrders(url));
        }
    }, [isLoggedIn, dispatch, customDateSearch, fromDate, toDate, orderFilter]);
    
    useEffect(() => {
        if (orderId && orders.length > 0) {
            const found = orders.find(ele => ele._id === orderId);
            if (found) setOrder(found);
            // const customerId = found.customerId._id;
            // (async () => {
            //     try {
            //     const response = await axios.get(`${localhost}/api/address/customerAddress/${found.customerId._id}`, {
            //         headers: {
            //             "Authorization": localStorage.getItem("token")
            //         }
            //     })
            //     const data = response.data.data
        }
    }, [orderId, orders]);

    // Load notifications from localStorage
    // Removed old notification loading logic


    // Filtered and sorted array based on selected filters and sort option
    const getProcessedOrders = () => {
        // Apply category and price filters
        let filteredArray = orders?.filter((ele) => {
            if (searchText.trim() && !ele.orderNo.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            // Filter by selectedOrderType if chosen
            if (selectedOrderType && selectedOrderType !== "All" && ele.orderType !== selectedOrderType) {
                return false;
            }
            return true; // Include the item if it passes the filters
        });

        // Apply status filter if a status is selected
        if (sortBy === "Order Received" || sortBy === "Preparing" || sortBy === "Ready for Collection" || sortBy === "Collected" || sortBy === "Ready to Serve" || sortBy === "Served" || sortBy === "Out for Delivery" || sortBy === "Delivered" || sortBy === "Cancelled") {
            filteredArray = filteredArray?.filter(order => order.status === sortBy);
        }

        // Sort the array based on selected sort criteria
        filteredArray = filteredArray?.sort((a, b) => {
            if (sortBy === "Amount") {
                return a.totalAmount - b.totalAmount;
            } else if (sortBy === "Type") {
                // Sort by orderType alphabetically or customize order
                // Example: Dine-In first, Home-Delivery second
                const orderTypePriority = { "Dine-In": 1, "Home-Delivery": 2, "Take-Away": 3 };
                return (orderTypePriority[a.orderType] || 99) - (orderTypePriority[b.orderType] || 99);
            }

            return 0; // Default: no sorting
        });


        // Slice the array for pagination
        const startIndex = (currentPage - 1) * showNo;
        const endIndex = startIndex + showNo;
        return filteredArray?.slice(startIndex, endIndex);
    };


    const totalFilteredItems = (orders ?? [])?.filter((ele) => {
        // Filter by search text
        if (searchText.trim() && !ele.orderNo.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }

        // Filter by selectedOrderType if chosen
        if (selectedOrderType && selectedOrderType !== "All" && ele.orderType !== selectedOrderType) {
            return false;
        }

        // Apply status filter if a status is selected
        if (sortBy === "Order Received" || sortBy === "Preparing" || sortBy === "Ready for Collection" || sortBy === "Collected" || sortBy === "Ready to Serve" || sortBy === "Served" || sortBy === "Out for Delivery" || sortBy === "Delivered" || sortBy === "Cancelled") {
            if (ele.status !== sortBy) {
                return false;
            }
        }

        return true;
    }).length;

    const getShowOptions = () => {
        const options = [];
        const step = 10;
        const minOptions = [10, 20];

        // Include minimum options only if valid
        minOptions.forEach((num) => {
            if (orders?.length >= num) {
                options.push(num);
            }
        });

        // Dynamically add more options in steps of 10
        let next = 30;
        while (next < orders?.length) {
            options.push(next);
            next += step;
        }

        // Always include "All"
        options.push(orders?.length || 0);

        return options;
    };

    const totalPages = Math.ceil(totalFilteredItems / (showNo || 1)) || 1;


    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleShow = (e) => {
        setShowNo(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when showNo changes
    };

    // Reset custom date search when filter changes
    const handleFilterChange = (filter) => {
        setOrderFilter(filter)
        if (filter !== "custom") {
            setCustomDateSearch(false)
            setFromDate("")
            setToDate("")
        }
    }

    // Handle Prev and Next clicks
    const handlePrev = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    // Handle clicking a specific page number
    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    // Handle single order delete
    const handleDeleteOrder = async (orderId) => {
        try {
            // Find the order to get its details for cleanup
            const orderToDelete = orders.find(order => order._id === orderId);
            
            await dispatch(startDeleteOrder(orderId, () => {
                setShowConfirmDeleteOrder(null);
                
                // Clean up localStorage after successful deletion
                if (orderToDelete) {
                    const cleanupResults = cleanupSingleDeletedOrder(orderToDelete, restaurant._id);
                    if (cleanupResults.errors.length > 0) {
                        console.warn('Some cleanup operations failed:', cleanupResults.errors);
                    }
                }
                
                // Refresh orders after deletion
                dispatch(startGetRestaurantOrders(`?filter=${orderFilter}`));
            }));
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete order');
        }
    };

    // Handle bulk delete recent orders (localStorage only)
    const handleBulkDeleteOrders = async () => {
        if (selectedRecentOrders.length === 0) {
            toast.warning('No orders selected for deletion');
            return;
        }

        if (isBulkDeleting) {
            toast.warning('Bulk delete already in progress');
            return;
        }

        try {
            setIsBulkDeleting(true);
            
            // Remove from localStorage only (no backend API call needed)
            const success = removeMultipleRecentOrdersFromStorage(selectedRecentOrders, restaurant._id);
            
            if (success) {
                // Update local state to remove deleted orders
                setRecentOrders(prev => prev.filter(order => !selectedRecentOrders.includes(order.id)));
                
                // Clear selections
                setSelectedRecentOrders([]);
                setSelectAllRecentOrders(false);
                setShowConfirmBulkDelete(false);
                
                toast.success(`${selectedRecentOrders.length} recent orders deleted successfully`);
            } else {
                toast.error('Failed to delete recent orders');
            }
        } catch (error) {
            console.error('Error bulk deleting recent orders:', error);
            toast.error('Failed to delete some recent orders');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    // Recent Orders management functions
    const handleSelectRecentOrder = (orderId) => {
        setSelectedRecentOrders(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId);
            } else {
                return [...prev, orderId];
            }
        });
    };

    const handleSelectAllRecentOrders = () => {
        if (selectAllRecentOrders) {
            setSelectedRecentOrders([]);
        } else {
            setSelectedRecentOrders(recentOrders.map(order => order.id));
        }
        setSelectAllRecentOrders(!selectAllRecentOrders);
    };

    const handleRemoveRecentOrder = (orderId) => {
        if (removeRecentOrderFromStorage(orderId, restaurant._id)) {
            setRecentOrders(prev => prev.filter(order => order.id !== orderId));
            setSelectedRecentOrders(prev => prev.filter(id => id !== orderId));
            toast.success("Recent order removed successfully");
        } else {
            toast.error("Failed to remove recent order");
        }
    };


    const handleMarkRecentOrderAsRead = (orderId) => {
        if (markRecentOrderAsRead(orderId, restaurant._id)) {
            setRecentOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, isRead: true } : order
            ));
        }
    };

    const handleToggleRecentOrderDetails = (orderId) => {
        setExpandedRecentOrder(prev => prev === orderId ? null : orderId);
    };

    const handleRecentOrderStatusChange = (recentOrderId, originalOrderId, newStatus) => {
        // Update database first using the original order ID
        if (originalOrderId) {
            dispatch(startChangeOrderStatus(originalOrderId, { status: newStatus }, () => {
                
                // Database update successful, now update localStorage
                const localSuccess = updateRecentOrderStatus(recentOrderId, newStatus, restaurant._id);
                
                if (localSuccess) {
                    // Update local state
                    setRecentOrders(prev => 
                        prev.map(order => 
                            order.id === recentOrderId 
                                ? { ...order, orderStatus: newStatus, status: newStatus } 
                                : order
                        )
                    );
                    // toast.success("Order status updated successfully");
                } else {
                    toast.error("Failed to update local status");
                }
                
                // Reset states
                setRecentOrderStatusUpdate({});
            }));
        } else {
            // If no original order ID, just update localStorage
            const localSuccess = updateRecentOrderStatus(recentOrderId, newStatus, restaurant._id);
            
            if (localSuccess) {
                setRecentOrders(prev => 
                    prev.map(order => 
                        order.id === recentOrderId 
                            ? { ...order, orderStatus: newStatus, status: newStatus } 
                            : order
                    )
                );
                toast.success("Recent order status updated");
            } else {
                toast.error("Failed to update recent order status");
            }
            
            // Reset states
            setRecentOrderStatusUpdate({});
        }
    };

    // Load recent orders from localStorage
    useEffect(() => {
        if (restaurant?._id) {
            const storedRecentOrders = getRecentOrdersFromStorage(restaurant._id);
            setRecentOrders(storedRecentOrders);
        }
    }, [restaurant?._id]);

    // Initialize daily cleanup when restaurant is loaded
    useEffect(() => {
        if (restaurant?._id) {
            initializeDailyCleanup(restaurant._id, () => {
                // Refresh recent orders data after cleanup
                setRecentOrders([]);
                
                // Reload fresh data
                const storedRecentOrders = getRecentOrdersFromStorage(restaurant._id);
                setRecentOrders(storedRecentOrders);
                
            });
        }
    }, [restaurant?._id]);

    useEffect(() => {
        (async () => {
            if(restaurantId?._id) {
                await dispatch(startGetMyRestaurant())
                await dispatch(startGetRestaurantOrders())
            }
            if(restaurant?.slug) {
                await dispatch(startGetCategories(restaurant.slug))
                await dispatch(startGetAllProducts(restaurant.slug))
            }
            // if(restaurant.slug) {
            //     await dispatch(startGetCategories(restaurant.slug))
            // }
            // try {
            //     const coupons = await axios.get(`${localhost}/api/coupon/list`)
        }) ()
    }, [dispatch, restaurantId?._id, restaurant?.slug])



        // Removed automatic addition of latest order to recent orders
    // Recent orders will only be populated through manual actions or notifications

    // Function to manually add order to recent orders
    const handleAddToRecentOrders = (order) => {
        const savedRecentOrder = saveRecentOrderToStorage(order, restaurant._id);
        if (savedRecentOrder) {
            setRecentOrders(prev => [savedRecentOrder, ...prev.slice(0, 49)]);
            toast.success("Order added to recent orders");
        } else {
            toast.error("Failed to add order to recent orders");
        }
    };

    const confirmChangeOrderStatus = (orderId, orderStatus) => {
        const statusValue = orderStatus[orderId]; // get the selected status for current order

        if (!statusValue) {
            toast.error("Select Order Status");
            return;
        }

        // If status is "Cancelled", show reason input toast
        if (statusValue === "Cancelled") {
            const order = orders.find(o => o._id === orderId);
            if (order) {
                setCancelOrderData({
                    orderId: orderId,
                    orderNo: order.orderNo,
                    orderType: order.orderType,
                    tableNo: order.tableId?.tableNumber || null,
                    customerName: order.deliveryAddress?.name || null,
                    customerPhone: order.deliveryAddress?.phone?.countryCode + order.deliveryAddress?.phone?.number || null
                });
                setShowAdminCancelReasonToast(true);
            }
            return;
        }

        dispatch(startChangeOrderStatus(orderId, { status: statusValue }, handleCloseAll));
    };


    const handleCloseAll = () => {
        setOrderId("")
        setOrder("")
        setIsViewSectionOpen(false)
        setOrderStatus("")
        setSelectedOrders([])
        setSelectAll(false)
        // setShowBulkDeleteConfirm(false)
        setCustomDateSearch(false)
        setShowAdminCancelReasonToast(false)
        setCancelOrderData(null)
    }

    const handleAdminCancelConfirm = async (cancellationReason) => {
        try {
            await dispatch(startChangeOrderStatus(cancelOrderData.orderId, { 
                status: "Cancelled", 
                cancellationReason: cancellationReason 
            }, handleCloseAll));
            setShowAdminCancelReasonToast(false);
            setCancelOrderData(null);
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Failed to cancel order");
        }
    };

    const handleAdminCancelClose = () => {
        setShowAdminCancelReasonToast(false);
        setCancelOrderData(null);
    };

    // Refresh orders handler
    const handleRefreshOrders = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(startGetRestaurantOrders());
            toast.success("Orders refreshed successfully");
        } catch (error) {
            console.error("Error refreshing orders:", error);
            toast.error("Failed to refresh orders");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Bulk delete functions
    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId)
            } else {
                return [...prev, orderId]
            }
        })
    }

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedOrders([])
            setSelectAll(false)
        } else {
            const allOrderIds = getProcessedOrders().map(order => order._id)
            setSelectedOrders(allOrderIds)
            setSelectAll(true)
        }
    }

    const handleBulkDelete = () => {
        if (selectedOrders.length === 0) {
            toast.error("Please select orders to delete")
            return
        }
        setShowConfirmBulkDeleteTable(true)
    }

    // Handle bulk delete for main table orders
    const handleBulkDeleteTableOrders = async () => {
        if (selectedOrders.length === 0) {
            toast.warning('No orders selected for deletion');
            return;
        }

        if (isBulkDeleting) {
            toast.warning('Bulk delete already in progress');
            return;
        }

        try {
            setIsBulkDeleting(true);
            
            // Find the orders to get their details for cleanup
            const ordersToDelete = orders.filter(order => selectedOrders.includes(order._id));
            
            // Use the new bulk delete action
            await dispatch(startBulkDeleteOrders(selectedOrders));
            
            // Clean up localStorage after successful deletion
            if (ordersToDelete.length > 0) {
                const cleanupResults = cleanupDeletedOrders(ordersToDelete, restaurant._id);
                if (cleanupResults.errors.length > 0) {
                    console.warn('Some cleanup operations failed:', cleanupResults.errors);
                }
            }
            
            // Clear selections and refresh
            setSelectedOrders([]);
            setSelectAll(false);
            setShowConfirmBulkDeleteTable(false);
            
            // Refresh orders
            dispatch(startGetRestaurantOrders(`?filter=${orderFilter}`));
        } catch (error) {
            console.error('Error bulk deleting table orders:', error);
            toast.error('Failed to delete some orders');
        } finally {
            setIsBulkDeleting(false);
        }
    };


    // Custom date search function
    const handleCustomDateSearch = () => {
        if (!fromDate || !toDate) {
            toast.error("Please select both From and To dates")
            return
        }
        
        if (new Date(fromDate) > new Date(toDate)) {
            toast.error("From date cannot be later than To date")
            return
        }
        
        setCustomDateSearch(true)
        toast.success("Searching orders for the selected date range...")
    }

    console.log(order)

    return (
        <section>
            <div className="order-dashboard-section">
                {restaurant ? (
                    restaurant?.isApproved && !restaurant?.isBlocked ? (
                        selectedOrderType ? (
                            <>
                                {/* Back Button */}
                                <div className="btn-div">
                                    <div className="btn btn-primary" onClick={() => {
                                        setSelectedOrderType(null)
                                        setOrderFilter("daily")
                                        }}>
                                        <IoArrowBack /> Back to Order Types
                                    </div>
                                    <div className="filter-custom-date-div">
                                        <div className="order-report-filters">
                                            <label htmlFor="sort-select">Sort:</label>
                                            <div className="sort-select-div">
                                                <select id="sort-select" value={orderFilter} onChange={(e) => {handleFilterChange(e.target.value)}}>
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="custom">Custom Date</option>
                                                </select>
                                                <RiExpandUpDownFill/>
                                            </div>
                                        </div>
                                        {orderFilter === "custom" && (
                                            <div className="custom-date-inputs">
                                                <div className="date-inputs-row">
                                                    <label>From:</label>
                                                    <input
                                                        className="date-select-div"
                                                        type="date"
                                                        value={fromDate}
                                                        onChange={(e) => setFromDate(e.target.value)}
                                                    />
                                                    <label>To:</label>
                                                    <input
                                                        className="date-select-div"
                                                        type="date"
                                                        value={toDate}
                                                        onChange={(e) => setToDate(e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleCustomDateSearch}
                                                >
                                                    Search Orders
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Table Section */}
                                <div className="order-dashboard-body">
                                    <div className="dashboard-header">
                                        <h1 className="dashboard-head">{selectedOrderType} Orders</h1>
                                        <button 
                                            className="refresh-orders-btn"
                                            onClick={handleRefreshOrders}
                                            disabled={isRefreshing}
                                            title="Refresh Orders"
                                        >
                                            <IoRefresh className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} />
                                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                    
                                    {/* Custom Date Filter Message */}
                                    {orderFilter === "custom" && !customDateSearch && (
                                        <div className="custom-date-message">
                                            <p>Please select date range and click "Search Orders" to view filtered results.</p>
                                        </div>
                                    )}

                                    {/* Table Header */}
                                    <div className="table-header">
                                        <div className="search-bar">
                                            <input
                                                type="text"
                                                placeholder="Search Order by Order No..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </div>
                                        <div className="table-actions">
                                            <div className="order-filters">
                                                <div className="sort-show">
                                                    <label htmlFor="sort-select">Sort:</label>
                                                    <div className="sort-select-div">
                                                        <select id="sort-select" value={sortBy} onChange={(e) => {setSortBy(e.target.value)}}>
                                                            <option value="">Default</option>
                                                            <option value="Type">Type</option>
                                                            <option value="Amount">Amount</option>
                                                            <option value="Order Received">Order Received</option>
                                                            <option value="Preparing">Preparing</option>
                                                            <option value="Ready for Collection">Ready for Collection</option>
                                                            <option value="Collected">Collected</option>
                                                            <option value="Ready to Serve">Ready to Serve</option>
                                                            <option value="Served">Served</option>
                                                            <option value="Out for Delivery">Out for Delivery</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                        <RiExpandUpDownFill/>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedOrders.length > 0 && (
                                                <button
                                                    className="delete-selected-btn"
                                                    onClick={handleBulkDelete}
                                                >
                                                    Delete Selected ({selectedOrders.length})
                                                </button>
                                            )}
                                            <button
                                                className="export-btn"
                                                onClick={() => {
                                                    const { startDate, endDate } = getReportDates();
                                                    // Get filtered orders based on current filters
                                                    const filteredOrders = orders?.filter((ele) => {
                                                        if (searchText.trim() && !ele.orderNo.toLowerCase().includes(searchText.toLowerCase())) {
                                                            return false;
                                                        }
                                                        // Filter by selectedOrderType if chosen
                                                        if (selectedOrderType && selectedOrderType !== "All" && ele.orderType !== selectedOrderType) {
                                                            return false;
                                                        }
                                                        return true;
                                                    });
                                                    
                                                    handleExportRestaurantOrderPDF(
                                                    filteredOrders,
                                                    restaurant?.name,
                                                    selectedOrderType,
                                                    orderFilter,
                                                    startDate,
                                                    endDate
                                                    );
                                                }}
                                                >
                                                Export
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="order-table-container">
                                        <table className="order-table">
                                        <thead>
                                            <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th>SI No</th>
                                            <th>Order No</th>
                                            {selectedOrderType === "All" && <th>Order Type</th>}
                                            <th>
                                                {selectedOrderType === "Dine-In"
                                                ? "Table No"
                                                : selectedOrderType === "Home-Delivery"
                                                ? "Delivery Address"
                                                : selectedOrderType === "Take-Away"
                                                ? "Customer Details"
                                                : "Table / Address / Customer"}
                                            </th>
                                            <th>No.of LineItems</th>
                                            <th>Total Amount</th>
                                            <th>Order Status</th>
                                            <th>Action</th>
                                            </tr>
                                        </thead>

                                        {getProcessedOrders()?.length > 0 ? (
                                            <tbody>
                                            {getProcessedOrders().map((order, index) => (
                                                <tr key={order._id} className={`order-type-${order.orderType.toLowerCase().replace(/\s+/g, '-')}`}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrders.includes(order._id)}
                                                        onChange={() => handleSelectOrder(order._id)}
                                                    />
                                                </td>
                                                <td>{(currentPage - 1) * showNo + index + 1}</td>
                                                <td>{order.orderNo}</td>

                                                {selectedOrderType === "All" && <td>{order.orderType}</td>}

                                                <td>
                                                    {order?.orderType === "Dine-In" ? (
                                                    <span>{order.tableId?.tableNumber}</span>
                                                    ) : order?.orderType === "Home-Delivery" ? (
                                                    <div className="delivery-details-div">
                                                        <div className="name">{order?.deliveryAddress?.name}</div>
                                                        <div className="name">
                                                            {order?.deliveryAddress?.phone?.countryCode}{" "}
                                                            {order?.deliveryAddress?.phone?.number}
                                                        </div>
                                                        <div className="address-details">
                                                            {order?.deliveryAddress?.addressNo},{" "}
                                                            {order?.deliveryAddress?.street}, <br />
                                                            {order?.deliveryAddress?.city}
                                                        </div>
                                                    </div>
                                                    ) : order?.orderType === "Take-Away" ? (
                                                    <div className="delivery-details-div">
                                                        <div className="name">{order?.deliveryAddress?.name}</div>
                                                        <div className="name">
                                                            {order?.deliveryAddress?.phone?.countryCode}{" "}
                                                            {order?.deliveryAddress?.phone?.number}
                                                        </div>
                                                        {order?.deliveryAddress?.vehicleNo && (
                                                            <div className="address-details">
                                                                Vehicle No: {order?.deliveryAddress?.vehicleNo}
                                                            </div>
                                                        )}
                                                    </div>
                                                    ) : null}
                                                </td>

                                                <td>{(order.lineItems?.length || 0) + (order.addOnsLineItems?.length || 0)}</td>
                                                <td>{order.totalAmount}</td>
                                                {/* <td>{order.status}</td> */}
                                                <td>
                                                    <div className="status-change-container">
                                                        <FormControl size="small" className="status-select-field">
                                                            <Select
                                                                value={order._id === orderId ? orderStatus : order.status}
                                                                onChange={(e) => {
                                                                    setOrderId(order._id);
                                                                    setOrderStatus(e.target.value);
                                                                }}
                                                                displayEmpty
                                                            >
                                                                {getStatusOptions(order.orderType).map((status) => (
                                                                    <MenuItem key={status.value} value={status.value}>
                                                                        {status.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                        <button 
                                                            className={`status-update-btn ${order.status === "Cancelled" ? "disabled" : ""}`}
                                                            onClick={() => {
                                                                if (order.status === "Cancelled") {
                                                                    toast.warning("Cannot change status of a Cancelled order");
                                                                    return;
                                                                }

                                                                if (order._id !== orderId || !orderStatus || orderStatus === order.status) {
                                                                    toast.warning("Please change Order Status");
                                                                    return;
                                                                }
                                                                confirmChangeOrderStatus(order._id, { [order._id]: orderStatus });
                                                            }}
                                                            disabled={order.status === "Cancelled"}
                                                        >
                                                            <IoMdCheckmark />
                                                        </button>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="action-div">
                                                        <button
                                                            className="view-btn"
                                                            onClick={() => {
                                                            setIsViewSectionOpen(true);
                                                            setOrderId(order._id);
                                                            }}
                                                        >
                                                            <MdRemoveRedEye />
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => {
                                                                setShowConfirmDeleteOrder(order._id);
                                                            }}
                                                        >
                                                            <BiSolidTrash />
                                                        </button>
                                                        <button
                                                            className="download-btn"
                                                            onClick={async () => {
                                                                await handleExportSingleOrderPDF(order, restaurant);
                                                            }}
                                                        >
                                                            <IoMdDownload />
                                                        </button>
                                                        <button
                                                            className="add-recent-btn"
                                                            onClick={() => handleAddToRecentOrders(order)}
                                                            title="Add to Recent Orders"
                                                        >
                                                            <IoAdd />
                                                        </button>
                                                    </div>
                                                </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        ) : (
                                            <tbody>
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: "center" }}>
                                                <p className="no-order-text">
                                                    No {selectedOrderType} Orders Found
                                                </p>
                                                </td>
                                            </tr>
                                            </tbody>
                                        )}
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="table-footer">
                                        <div className="footer-pagination">
                                            <span
                                                disabled={currentPage === 1}
                                                className={`prev ${currentPage === 1 ? "disabled" : ""}`}
                                                onClick={handlePrev}
                                            >
                                                <FaCaretLeft />
                                            </span>
                                            {pageNumbers.map((page) => (
                                                <span
                                                    key={page}
                                                    className={`page-number ${page === currentPage ? "active" : ""}`}
                                                    onClick={() => handlePageClick(page)}
                                                >
                                                    {page}
                                                </span>
                                            ))}
                                            <span
                                                disabled={currentPage === totalPages}
                                                className={`next ${currentPage === totalPages ? "disabled" : ""}`}
                                                onClick={handleNext}
                                            >
                                                <FaCaretRight />
                                            </span>
                                        </div>
                                        <div className="footer-details">
                                            Showing {(currentPage - 1) * showNo + 1}-
                                            {Math.min(currentPage * showNo, totalFilteredItems)} of {totalFilteredItems} Orders
                                        </div>
                                        <div className="sort-show">
                                            <label htmlFor="show-select">Show:</label>
                                            <div className="sort-select-div">
                                                <select id="show-select" value={showNo} onChange={handleShow}>
                                                    {getShowOptions().map((value, index) => (
                                                        <option key={index} value={value}>
                                                            {value === orders?.length ? "All" : value}
                                                        </option>
                                                    ))}
                                                </select>
                                                <RiExpandUpDownFill/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                            ) : (
                            // Default: show order type cards only
                            <div className="order-dashboard-overview">
                                <h1 className="order-dashboard-overview-head">Order Dashboard</h1>
                                
                                <div className="order-dashboard-overview-grid">
                                {orderTypes.map((type, index) => (
                                    <div
                                        key={index}
                                        className="dashboard-overview-card"
                                        onClick={() => setSelectedOrderType(type)}
                                    >
                                        <div className="icon">{icons[type] || <LuUtensils />}</div>
                                        <div className="overview-details">
                                            <h1 className="title">{type}</h1>
                                            <p className="count">
                                            {orders?.filter((order) => order.orderType === type).length || 0} Orders
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                    <div
                                        className="dashboard-overview-card"
                                        onClick={() => setSelectedOrderType("All")}
                                    >
                                        <div className="icon">{icons["All"] || <LuUtensils />}</div>
                                        <div className="overview-details">
                                            <h1 className="title">All</h1>
                                            <p className="count">
                                            {orders?.length || 0} Orders
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* // Main Order Dashboard */}
                                {!show && <div className="order-dashboard-home-section">
                                    {/* Recent Orders Section */}
                                    <div className="notifications-section">
                                        <div className="notifications-header">
                                            <h3 className="notifications-title">
                                                <IoNotifications className="notifications-icon" />
                                                Recent Orders ({recentOrders.length})
                                            </h3>
                                            <div className="notifications-actions">
                                                {selectedRecentOrders.length > 0 && showRecentOrders && (
                                                    <>
                                                        <button 
                                                            className="btn btn-danger bulk-delete-notifications-btn"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setShowConfirmBulkDelete(true);
                                                            }}
                                                            disabled={isBulkDeleting}
                                                            style={{ 
                                                                pointerEvents: isBulkDeleting ? 'none' : 'auto',
                                                                opacity: isBulkDeleting ? 0.6 : 1,
                                                                position: 'relative',
                                                                zIndex: 999,
                                                                cursor: isBulkDeleting ? 'not-allowed' : 'pointer',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '8px 16px',
                                                                borderRadius: '6px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            {isBulkDeleting ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Deleting...
                                                                </>
                                                            ) : (
                                                                `Delete Selected (${selectedRecentOrders.length})`
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    className={`btn toggle-notifications-btn`}
                                                    onClick={() => setShowRecentOrders(!showRecentOrders)}
                                                >
                                                    {showRecentOrders ? 'Hide Recent Orders' : 'Show Recent Orders'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {showRecentOrders && (
                                                <motion.div 
                                                    className="notifications-content-wrapper"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    style={{ overflow: "hidden" }}
                                                >
                                                    {recentOrders.length > 0 ? (
                                                        <div className="notifications-content">
                                                            <div className="notifications-controls">
                                                                <label className="select-all-notifications">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectAllRecentOrders}
                                                                        onChange={handleSelectAllRecentOrders}
                                                                    />
                                                                    Select All
                                                                </label>
                                                            </div>
                                                            
                                                            <div className="notifications-list">
                                                                {recentOrders.map((recentOrder) => (
                                                                    <div 
                                                                        key={recentOrder.id} 
                                                                        className={`notification-card ${!recentOrder.isRead ? 'unread' : 'read'}`}
                                                                    >
                                                                        <div className="notification-card-top">
                                                                            <div className="notification-checkbox">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedRecentOrders.includes(recentOrder.id)}
                                                                                    onChange={() => handleSelectRecentOrder(recentOrder.id)}
                                                                                />
                                                                            </div>
                                                                            
                                                                            <div className="notification-content">
                                                                                <div className="notification-header">
                                                                                    <h4 className="notification-order-no">#{recentOrder.orderNo || recentOrder.originalOrderNo || recentOrder._id?.slice(-6) || 'N/A'}</h4>
                                                                                    <div className="notification-type-badge-container">
                                                                                        <span className={`notification-type-badge ${recentOrder?.orderType?.toLowerCase().replace('-', '')}`}>
                                                                                            {icons[recentOrder?.orderType] || <BiSolidFoodMenu />}
                                                                                            <span>
                                                                                                {recentOrder?.orderType || 'Unknown'}
                                                                                                {recentOrder?.orderType === 'Dine-In' && recentOrder?.tableNumber && (
                                                                                                    <span className="table-info"> - Table {recentOrder.tableNumber}</span>
                                                                                                )}
                                                                                            </span>
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className="notification-time">
                                                                                        {new Date(recentOrder.timestamp || recentOrder.createdAt).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                                
                                                                                <div className="notification-details">
                                                                                    {/* <div className="order-location-info">
                                                                                        {recentOrder?.orderType === "Dine-In" ? (
                                                                                            <div className="table-info">
                                                                                                <span className="location-icon">📍</span>
                                                                                                <span className="location-label">Table:</span>
                                                                                                <span className="location-value">{recentOrder.tableId?.tableNumber || recentOrder.tableNo || 'N/A'}</span>
                                                                                            </div>
                                                                                        ) : recentOrder?.orderType === "Home-Delivery" ? (
                                                                                            <div className="delivery-info">
                                                                                                <span className="location-icon">🏠</span>
                                                                                                <span className="location-label">Delivery to:</span>
                                                                                                <span className="location-value">{recentOrder?.deliveryAddress?.city || 'N/A'}</span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="takeaway-info">
                                                                                                <span className="location-icon">{icons[recentOrder?.orderType]}</span>
                                                                                                <span className="location-label">Take-Away Order</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div> */}
                                                                                    
                                                                                    <div className="order-items-list">
                                                                                        <h5 className="items-section-title">Order Items</h5>
                                                                                        {recentOrder?.lineItems?.map((item, index) => {
                                                                                            // Safely access productId - handle both populated object and ID string
                                                                                            const productId = typeof item?.productId === 'object' ? item.productId : null;
                                                                                            const productName = productId?.name || 'Product Name';
                                                                                            const categoryId = typeof productId?.categoryId === 'object' ? productId.categoryId : null;
                                                                                            const categoryName = categoryId?.name || 'Category';
                                                                                            
                                                                                            return (
                                                                                                <div key={index} className="order-item-row">
                                                                                                    <div className="item-info">
                                                                                                        <span className="item-name">
                                                                                                            {productName} - {categoryName} - Qty: {item?.quantity || 1}
                                                                                                        </span>
                                                                                                        {/* Display Size if available */}
                                                                                                        {item?.selectedSize && (
                                                                                                            <span className="item-size" style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginTop: '2px' }}>
                                                                                                                Size: {item.selectedSize.name}
                                                                                                            </span>
                                                                                                        )}
                                                                                                        {/* Display Product AddOns if available */}
                                                                                                        {item?.productAddOns && item.productAddOns.length > 0 && (
                                                                                                            <span className="item-addons" style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginTop: '2px' }}>
                                                                                                                Add-Ons: {item.productAddOns.map(a => a.name).join(', ')}
                                                                                                            </span>
                                                                                                        )}
                                                                                                        {/* Display Comments if available */}
                                                                                                        {item?.comments && (
                                                                                                            <span className="item-comments" style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>
                                                                                                                Note: {item.comments}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <span className="item-price">AED {item?.itemTotal || ((item?.itemSubtotal || item?.basePrice || item?.price || 0) * (item?.quantity || 1))}</span>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                        {/* Display Add-Ons separately */}
                                                                                        {recentOrder?.addOnsLineItems && recentOrder.addOnsLineItems.length > 0 && (
                                                                                            <>
                                                                                                <h5 className="items-section-title" style={{ marginTop: '10px' }}>Add-Ons</h5>
                                                                                                {recentOrder.addOnsLineItems.map((item, index) => (
                                                                                                    <div key={`addon-${index}`} className="order-item-row">
                                                                                                        <span className="item-name">{item?.commonAddOnName || 'Add-On'} - Qty: {item?.quantity || 1}</span>
                                                                                                        <span className="item-price">AED {((item?.price || 0) * (item?.quantity || 1))}</span>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </>
                                                                                        )}
                                                                                        <div className="order-total-row">
                                                                                            <span className="total-label">Total:</span>
                                                                                            <span className="total-amount">AED {recentOrder.totalAmount || 0}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    
                                                                                    {/* Simple Status Update */}
                                                                                    {/* <div className="simple-status-update">
                                                                                        <div className="current-status">
                                                                                            <span className="status-label">Status:</span>
                                                                                            <span className={`status-badge ${(recentOrder.orderStatus || recentOrder.status || 'Order Received').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                                                {recentOrder.orderStatus || recentOrder.status || 'Order Received'}
                                                                                            </span>
                                                                                        </div>
                                                                                        
                                                                                        <div className="status-change">
                                                                                            <FormControl size="small" className="status-select">
                                                                                                <Select
                                                                                                    value={recentOrderStatusUpdate[recentOrder.id] || ''}
                                                                                                    onChange={(e) => {
                                                                                                        const newStatus = e.target.value;
                                                                                                        setRecentOrderStatusUpdate(prev => ({
                                                                                                            ...prev,
                                                                                                            [recentOrder.id]: newStatus
                                                                                                        }));
                                                                                                    }}
                                                                                                    displayEmpty
                                                                                                >
                                                                                                    <MenuItem value="">
                                                                                                        <em>Change Status</em>
                                                                                                    </MenuItem>
                                                                                                    {getStatusOptions(recentOrder.orderType).map((status) => (
                                                                                                        <MenuItem key={status.value} value={status.value}>
                                                                                                            {status.label}
                                                                                                        </MenuItem>
                                                                                                    ))}
                                                                                                </Select>
                                                                                            </FormControl>
                                                                                            
                                                                                            {recentOrderStatusUpdate[recentOrder.id] && 
                                                                                             recentOrderStatusUpdate[recentOrder.id] !== (recentOrder.orderStatus || recentOrder.status) && (
                                                                                                <button
                                                                                                    className="update-btn"
                                                                                                    onClick={() => handleRecentOrderStatusChange(
                                                                                                        recentOrder.id, 
                                                                                                        recentOrder.originalOrderId, 
                                                                                                        recentOrderStatusUpdate[recentOrder.id]
                                                                                                    )}
                                                                                                >
                                                                                                    Update
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div> */}
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="notification-actions">
                                                                                {!recentOrder.isRead ? (
                                                                                    <button 
                                                                                        className="btn btn-sm mark-read-btn"
                                                                                        onClick={() => handleMarkRecentOrderAsRead(recentOrder.id)}
                                                                                    >
                                                                                        Mark Read
                                                                                    </button>
                                                                                ) : (
                                                                                    <button 
                                                                                        className="btn btn-sm mark-read-btn"
                                                                                    >
                                                                                        Seen
                                                                                    </button>
                                                                                )}
                                                                                <button 
                                                                                    className="btn btn-sm btn-info view-details-btn"
                                                                                    onClick={() => handleToggleRecentOrderDetails(recentOrder.id)}
                                                                                >
                                                                                    {expandedRecentOrder === recentOrder.id ? 'Hide Details' : 'View Details'}
                                                                                </button>
                                                                                <button 
                                                                                    className="btn btn-sm btn-danger remove-notification-btn"
                                                                                    onClick={() => handleRemoveRecentOrder(recentOrder.id)}
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <AnimatePresence>
                                                                            {expandedRecentOrder === recentOrder.id && (
                                                                                <motion.div 
                                                                                    className="notification-expanded-details"
                                                                                    initial={{ height: 0, opacity: 0 }}
                                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                                    exit={{ height: 0, opacity: 0 }}
                                                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                                    style={{ overflow: "hidden" }}
                                                                                >
                                                                                    <div className="expanded-content">
                                                                                        <div className="order-summary">
                                                                                            <h5 className="summary-title">Order Summary</h5>
                                                                                            <div className="order-info">
                                                                                                <p><strong>Total Amount:</strong> AED {recentOrder?.totalAmount || 0}</p>
                                                                                                <p><strong>Items Count:</strong> {recentOrder?.lineItems?.length || 0} items</p>
                                                                                                {/* <p><strong>Order Status:</strong> {recentOrder?.orderStatus || recentOrder?.status || 'Placed'}</p> */}
                                                                                            </div>
                                                                                        </div>
                                                                                        
                                                                                        {recentOrder?.deliveryAddress && (
                                                                                            <div className="customer-details">
                                                                                                <h5 className="details-title">Customer Details</h5>
                                                                                                <div className="customer-info">
                                                                                                    <p><strong>Name:</strong> {recentOrder?.deliveryAddress?.name}</p>
                                                                                                    <p><strong>Phone:</strong> {recentOrder?.deliveryAddress?.phone?.countryCode} {recentOrder?.deliveryAddress?.phone?.number}</p>
                                                                                                    {recentOrder?.orderType === "Home-Delivery" && (
                                                                                                        <p><strong>Address:</strong> {recentOrder?.deliveryAddress?.addressNo}, {recentOrder?.deliveryAddress?.street}, {recentOrder?.deliveryAddress?.city}</p>
                                                                                                    )}
                                                                                                    {recentOrder?.orderType === "Take-Away" && recentOrder?.deliveryAddress?.vehicleNo && (
                                                                                                        <p><strong>Vehicle:</strong> {recentOrder?.deliveryAddress?.vehicleNo}</p>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        
                                                                                        <div className="line-items">
                                                                                            <h5 className="items-title">Order Items</h5>
                                                                                            <div className="items-list">
                                                                                                {recentOrder?.lineItems?.map((item, index) => {
                                                                                                    // Safely access productId - handle both populated object and ID string
                                                                                                    const productId = typeof item?.productId === 'object' ? item.productId : null;
                                                                                                    const productName = productId?.name || 'Product Name';
                                                                                                    const productImages = productId?.images || [];
                                                                                                    const productImageUrl = productImages?.[0]?.url || '/default-product.png';
                                                                                                    const categoryId = typeof productId?.categoryId === 'object' ? productId.categoryId : null;
                                                                                                    const categoryName = categoryId?.name || 'Category';
                                                                                                    
                                                                                                    return (
                                                                                                        <div key={index} className="item-card">
                                                                                                            <div className="item-image">
                                                                                                                <img 
                                                                                                                    src={productImageUrl} 
                                                                                                                    alt={productName} 
                                                                                                                    onError={(e) => {
                                                                                                                        e.target.src = '/default-product.png';
                                                                                                                    }}
                                                                                                                />
                                                                                                            </div>
                                                                                                            <div className="item-details">
                                                                                                                <h6 className="item-name">{productName}</h6>
                                                                                                                <p className="item-category">{categoryName}</p>
                                                                                                                
                                                                                                                {/* Display Size if available */}
                                                                                                                {item?.selectedSize && (
                                                                                                                    <p className="item-size" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                                                                                        Size: {item.selectedSize.name}
                                                                                                                    </p>
                                                                                                                )}
                                                                                                                
                                                                                                                {/* Display Product AddOns if available */}
                                                                                                                {item?.productAddOns && item.productAddOns.length > 0 && (
                                                                                                                    <div className="item-addons" style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                                                                                        Add-Ons: {item.productAddOns.map(a => a.name).join(', ')}
                                                                                                                    </div>
                                                                                                                )}
                                                                                                                
                                                                                                                {/* Display Comments if available */}
                                                                                                                {item?.comments && (
                                                                                                                    <p className="item-comments" style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic', marginTop: '4px' }}>
                                                                                                                        Note: {item.comments}
                                                                                                                    </p>
                                                                                                                )}
                                                                                                                
                                                                                                                <div className="item-pricing">
                                                                                                                    {/* <span className="item-price">AED {item?.itemSubtotal || item?.price || 0}</span> */}
                                                                                                                    <span className="item-quantity">Qty: {item?.quantity || 1}</span>
                                                                                                                    <span className="item-total">Total: AED {item?.itemTotal || ((item?.itemSubtotal || item?.basePrice || item?.price || 0) * (item?.quantity || 1))}</span>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                                {/* Display Add-Ons separately */}
                                                                                                {recentOrder?.addOnsLineItems && recentOrder.addOnsLineItems.length > 0 && (
                                                                                                    <>
                                                                                                        <h5 className="items-title" style={{ marginTop: '15px' }}>Add-Ons</h5>
                                                                                                        <div className="items-list">
                                                                                                            {recentOrder.addOnsLineItems.map((item, index) => (
                                                                                                                <div key={`addon-${index}`} className="item-card" style={{ borderLeft: '4px solid #ff9800' }}>
                                                                                                                    <div className="item-image">
                                                                                                                        <IoFastFood style={{ fontSize: '2rem', color: '#ff9800' }} />
                                                                                                                    </div>
                                                                                                                    <div className="item-details">
                                                                                                                        <h6 className="item-name">{item?.commonAddOnName || 'Add-On'}</h6>
                                                                                                                        <div className="item-pricing">
                                                                                                                            <span className="item-price">AED {item?.price || 0}</span>
                                                                                                                            <span className="item-quantity">Qty: {item?.quantity || 1}</span>
                                                                                                                            <span className="item-total">Total: AED {((item?.price || 0) * (item?.quantity || 1))}</span>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="no-notifications-message">
                                                            <IoNotifications className="no-notifications-icon" />
                                                            <p>No recent orders available</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>}
                            </div>
                        )

                    ) : (
                    restaurant?.isBlocked ? (
                        <div className="order-dashboard-body-empty">
                            
                            <p>Your account is currently blocked. You can contact the admin to resolve this issue.</p>
                            <p>Once it's Solved, you can see and manage the restaurant Orders</p>
                        </div>
                    ) : (
                        <div className="order-dashboard-body-empty">
                            <p>Your restaurant profile has been created. Once it's approved by the admin, you can see and manage the restaurant Orders</p>
                            <p>You will recieve an email once your profile is approved.</p>
                        </div>
                ))) : (
                    <div className="details-div">
                        <p>It looks like you haven't created the restaurants profile yet. Let's get started!<br/>
                        Create a restaurant profile to unlock the full dashboard experience.</p>
                        <span>Go to <a onClick={() => {handleDashboardMenuChange("restaurant-profile")}}>Restaurant Profile</a></span>
                    </div>
                )}
            </div>
            <AnimatePresence mode="wait">
                {isViewSectionOpen && (
                    <>
                        <div className="overlay" onClick={handleCloseAll}></div>
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }} 
                            className="order-form-section"
                        >
                            <div className="close-btn" onClick={handleCloseAll}><IoIosClose className="icon"/></div>
                            <div className="order-content">
                                {/* <div> */}
                                    <h1 className="order-head">View Order</h1>
                                    <div key={order?._id} className="customer-order-card">
                                        {/* Order ID and Table No Table */}
                                        <table className="order-info-table">
                                            <tbody>
                                                <tr>
                                                    <td className="table-label">Order ID</td>
                                                    <td className="table-value">{order?.orderNo}</td>
                                                </tr>
                                                {order?.tableId?.tableNumber && (
                                                    <tr>
                                                        <td className="table-label">Table No</td>
                                                        <td className="table-value">{order.tableId.tableNumber}</td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td className="table-label">Date</td>
                                                    <td className="table-value">{formatDeliveryDate(order?.orderDate)}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Order Status and Total Amount Table */}
                                        <table className="order-info-table">
                                            <tbody>
                                                <tr>
                                                    <td className="table-label">Order Status</td>
                                                    <td className="table-value">{order?.status}</td>
                                                </tr>
                                                <tr>
                                                    <td className="table-label">Total Amount</td>
                                                    <td className="table-value">AED {order?.totalAmount}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        
                                        {/* Payment Status Table - Full Width */}
                                        {(order?.paymentStatus || (order?.paymentId && typeof order.paymentId === 'object' && order.paymentId.transactionID)) && (
                                            <table className="order-info-table payment-status-table">
                                                <tbody>
                                                    {order?.paymentId && typeof order.paymentId === 'object' && order.paymentId.transactionID && (
                                                        <tr>
                                                            <td className="table-label">Payment ID</td>
                                                            <td className="table-value">{order.paymentId.transactionID}</td>
                                                        </tr>
                                                    )}
                                                    {order?.paymentStatus && (
                                                        <tr>
                                                            <td className="table-label">Status</td>
                                                            <td className="table-value">
                                                                <span className={`payment-status-badge payment-${order.paymentStatus}`}>
                                                                    {order.paymentStatus === 'paid' && '✓ Paid'}
                                                                    {order.paymentStatus === 'pending' && '⏳ Pending'}
                                                                    {order.paymentStatus === 'failed' && '✗ Failed'}
                                                                    {order.paymentStatus === 'refunded' && '↩ Refunded'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                        <div className="order-details-div">
                                            <h2 className="head-title">Order Details</h2>
                                            <div className="lineItems-grid">
                                                <h1 className="linItems-head">Order Items</h1>
                                                {order?.lineItems?.map((item) => {
                                                    // Safely access productId - handle both populated object and ID string
                                                    const productId = typeof item.productId === 'object' ? item.productId : null;
                                                    const productName = productId?.name || 'Product Name';
                                                    const productImages = productId?.images || [];
                                                    const productImageUrl = productImages?.[0]?.url || '/default-product.png';
                                                    const categoryId = typeof productId?.categoryId === 'object' ? productId.categoryId : null;
                                                    const categoryName = categoryId?.name || 'Category';
                                                    
                                                    return (
                                                        <div key={item._id || item._id || `item-${Date.now()}-${Math.random()}`} className="lineItems-card">
                                                            <div className="img-div">
                                                                <img 
                                                                    src={productImageUrl} 
                                                                    alt={productName}
                                                                    onError={(e) => {
                                                                        e.target.src = '/default-product.png';
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="item-details-div">
                                                                <div className="item-name-div">
                                                                    <h1 className="name">{productName}</h1>
                                                                    <h3 className="category">{categoryName}</h3>
                                                                    
                                                                    {/* Display Size if available */}
                                                                    {item?.selectedSize && (
                                                                        <p className="item-size" style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px', fontWeight: '500' }}>
                                                                            Size: {item.selectedSize.name}
                                                                        </p>
                                                                    )}
                                                                    
                                                                    {/* Display Product AddOns if available */}
                                                                    {item?.productAddOns && item.productAddOns.length > 0 && (
                                                                        <div className="item-addons" style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                                                                            Add-Ons: {item.productAddOns.map(a => a.name).join(', ')}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Display Comments if available */}
                                                                    {item?.comments && (
                                                                        <p className="item-comments" style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic', marginTop: '5px' }}>
                                                                            Note: {item.comments}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="price-qty-div">
                                                                    <p>Price: AED {item?.itemSubtotal || item?.basePrice || item?.price || 0}</p>
                                                                    <p>Qty: {item?.quantity || 1}</p>
                                                                    <p>Total: AED {item?.itemTotal || ((item?.itemSubtotal || item?.basePrice || item?.price || 0) * (item?.quantity || 1))}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {/* Display Add-Ons separately - Compact version */}
                                                {order?.addOnsLineItems && order.addOnsLineItems.length > 0 && (
                                                    <div className="addons-compact-section">
                                                        <h3 className="addons-compact-title">Add-Ons</h3>
                                                        <div className="addons-compact-list">
                                                            {order.addOnsLineItems.map((item, index) => (
                                                                <div key={`addon-${index}`} className="addon-compact-item">
                                                                    <span className="addon-name">{item.commonAddOnName}</span>
                                                                    <span className="addon-qty">x{item.quantity || 1}</span>
                                                                    <span className="addon-price">AED {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                {/* </div> */}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            
            {/* Delete Confirmation Toasts */}
            {showConfirmDeleteOrder && (
                <ConfirmToast
                    message="Are you sure you want to delete this order? This action cannot be undone."
                    onConfirm={() => handleDeleteOrder(showConfirmDeleteOrder)}
                    onCancel={() => setShowConfirmDeleteOrder(null)}
                />
            )}
            
            {showConfirmBulkDelete && (
                <ConfirmToast
                    message={`Are you sure you want to delete ${selectedRecentOrders.length} selected orders? This action cannot be undone.`}
                    onConfirm={handleBulkDeleteOrders}
                    onCancel={() => {
                        setShowConfirmBulkDelete(false);
                        // Optionally clear selections on cancel
                        // setSelectedRecentOrders([]);
                        // setSelectAllRecentOrders(false);
                    }}
                />
            )}
            
            {showConfirmBulkDeleteTable && (
                <ConfirmToast
                    message={`Are you sure you want to delete ${selectedOrders.length} selected orders from the table? This action cannot be undone.`}
                    onConfirm={handleBulkDeleteTableOrders}
                    onCancel={() => {
                        setShowConfirmBulkDeleteTable(false);
                    }}
                />
            )}
            
            {/* Admin Cancel Reason Toast */}
            {showAdminCancelReasonToast && cancelOrderData && (
                <AdminOrderCancelToast
                    orderNo={cancelOrderData.orderNo}
                    orderType={cancelOrderData.orderType}
                    tableNo={cancelOrderData.tableNo}
                    customerName={cancelOrderData.customerName}
                    customerPhone={cancelOrderData.customerPhone}
                    onConfirm={handleAdminCancelConfirm}
                    onClose={handleAdminCancelClose}
                />
            )}

        </section>
    )
}