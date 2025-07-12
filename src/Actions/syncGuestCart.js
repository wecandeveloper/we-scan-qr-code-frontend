export const syncGuestCart = async () => {
  const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

  if (guestCart.length === 0) return;

  const payload = {
    lineItems: guestCart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  };

  try {
    const response = await axios.post(`${localhost}/api/user/cart/`, payload, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    // Optional: Dispatch this to update Redux
    dispatch({ type: "GET_CART", payload: response.data });

    // Clear guest cart
    localStorage.removeItem("guestCart");
  } catch (err) {
    console.log("Sync failed:", err);
  }
};
