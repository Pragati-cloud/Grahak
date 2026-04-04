export const placeOrder = async ({
    shopId,
    encryptedToken,
    user,
    payment,
    products,
}) => {
    try {
        const BASE_URL = "http://localhost:5000";
        const res = await fetch(`${BASE_URL}/api/place-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                shop_id: shopId,
                encrypted_qr: encryptedToken,
                user,
                payment,
                products,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to place order");
        }

        return data;
    } catch (error) {
        console.error("Place order error:", error.message);
        throw error;
    }
};

export const getShopAndTokenFromURL = () => {
    const [shopId, encryptedToken] = window.location.pathname
        .slice(1)
        .split("/");

    return { shopId, encryptedToken };
};