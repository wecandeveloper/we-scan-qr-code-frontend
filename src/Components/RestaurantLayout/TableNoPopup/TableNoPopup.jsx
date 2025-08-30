import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { localhost } from "../../../Api/apis";
import axios from "axios";

import "./TableNoPopup.scss"
import { motion, AnimatePresence } from "framer-motion";
import { MdTableBar } from "react-icons/md";
import { useAuth } from "../../../Context/AuthContext";
import { toast } from "react-toastify";

function TableNoPopup({ setOpenSelectTableNumberModal }) {
  const { setGlobalTableId } = useAuth()
  const [ restaurantTables, setRestaurantTables ] = useState("")
  const [ tableId, setTableId ] = useState("");

  const restaurant = useSelector((state) => {
    return state.restaurants.selected;
  })

  console.log(restaurant)

  useEffect(()=>{
    (async()=>{
        if(restaurant) {
            try {
                const response = await axios.get(`${localhost}/api/table/listByRestaurant/${restaurant._id}`)
                console.log(response.data.data)
                setRestaurantTables(response.data.data)
            } catch(err) {
                console.log(err)
            }
        }
    })()
  },[restaurant])

  const handleSubmit = () => {
    if (!tableId) {
        toast.error("Please select a table first!");
        return;
    }

    // 1. Store table ID in localStorage
    localStorage.setItem("selectedTableId", tableId);
    setGlobalTableId(tableId)

    // 3. Close the modal
    setOpenSelectTableNumberModal(false);

    console.log("Selected Table ID saved:", tableId);
  };


  return (
    <AnimatePresence>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="table-popup-modal-overlay">
      <motion.div 
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className="modal-content">
        <div className="select-table-number">
          <h1 className="head">Select Table Number</h1>
          <div className="table-number-input-div">
              <MdTableBar />
              <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
              >
                  <option value="">Select Table</option>
                  {restaurantTables && restaurantTables.map((table) => (
                    <option key={table._id} value={table._id}>
                        Table {table.tableNumber}
                    </option>
                  ))}
              </select>
              </div>

          <div className="btn-div">
          <button
              className="btn-dark"
              onClick={handleSubmit}
          >
              Submit
          </button>
          <button
              className="btn-dark"
              onClick={() => setOpenSelectTableNumberModal(false)}
          >
              Cancel
          </button>
          </div>
      </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
}

export default TableNoPopup;