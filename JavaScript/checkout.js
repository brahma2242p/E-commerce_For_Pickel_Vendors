document.addEventListener("DOMContentLoaded", () => {
    const addressSelector = document.getElementById("addressSelector");
    const newAddressRadio = document.getElementById("newAddressRadio");
    const newAddressForm = document.getElementById("newAddressForm");
    const summaryItemsContainer = document.getElementById("summaryItemsContainer");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const SHIPPING_COST = 50.00;
    const TAX_RATE = 0.05;
    

    async function loadInitialData() {
        renderOrderSummary();
        try {
            const response = await fetch('/checkout');
            if (!response.ok) {
                if (response.status === 401) {
                    alert("Please log in to proceed to checkout.");
                    window.location.href = 'index.html';
                }
                throw new Error("Could not load your addresses.");
            }
            const addresses = await response.json();
            renderAddresses(addresses);
        } catch (error) {
            console.error("Fetch Error:", error);
            addressSelector.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }
    
    function renderAddresses(addresses) {
        addressSelector.innerHTML = '';
        if (addresses && addresses.length > 0) {
            addresses.forEach((addr, index) => {
                const addressOption = document.createElement('div');
                addressOption.className = 'saved-address-option';
                addressOption.innerHTML = `
                    <input type="radio" id="addr_${addr.addressId}" name="selectedAddress" value="${addr.addressId}" ${index === 0 ? 'checked' : ''}>
                    <label for="addr_${addr.addressId}">
                        <strong>${addr.fullName}</strong><br>${addr.addressLine1}, ${addr.addressLine2 || ''}<br>${addr.city}, ${addr.state} - ${addr.pincode}<br>Phone: ${addr.mobileNumber}
                    </label>`;
                addressSelector.appendChild(addressOption);
            });
        } else {
             addressSelector.innerHTML = '<p>No saved addresses found.</p>';
             newAddressRadio.checked = true;
             newAddressForm.style.display = 'block';
        }
        document.querySelectorAll('input[name="selectedAddress"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                newAddressForm.style.display = e.target.value === 'new' ? 'block' : 'none';
            });
        });
    }

    function renderOrderSummary() {
        const summarySubtotalElem = document.getElementById("summarySubtotal");
        const summaryShippingElem = document.getElementById("summaryShipping");
        const summaryTaxesElem = document.getElementById("summaryTaxes");
        const summaryGrandTotalElem = document.getElementById("summaryGrandTotal");
        if (cart.length === 0) {
            summaryItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            if(placeOrderBtn) placeOrderBtn.disabled = true;
            return;
        }
        summaryItemsContainer.innerHTML = "";
        let subtotal = 0;
        cart.forEach(item => {
            const itemTotalPrice = item.pricePerGram * item.weight * item.quantity;
            subtotal += itemTotalPrice;
            const itemElement = document.createElement("div");
            itemElement.className = "summary-item";
            itemElement.innerHTML = `
                <div class="summary-item-image">
                    <img src="/api/product-image?id=${item.id}" alt="${item.name}">
                    <span class="item-quantity-badge">${item.quantity}</span>
                </div>
                <div class="summary-item-info"><strong>${item.name}</strong><p>${item.weight}g</p></div>
                <div class="summary-item-price"><strong>₹${itemTotalPrice.toFixed(2)}</strong></div>`;
            summaryItemsContainer.appendChild(itemElement);
        });
        const taxes = subtotal * TAX_RATE;
        const grandTotal = subtotal + SHIPPING_COST + taxes;
        if (summarySubtotalElem) summarySubtotalElem.textContent = `₹${subtotal.toFixed(2)}`;
        if (summaryShippingElem) summaryShippingElem.textContent = `₹${SHIPPING_COST.toFixed(2)}`;
        if (summaryTaxesElem) summaryTaxesElem.textContent = `₹${taxes.toFixed(2)}`;
        if (summaryGrandTotalElem) summaryGrandTotalElem.textContent = `₹${grandTotal.toFixed(2)}`;
    }

    async function placeOrder() {
        const params = new URLSearchParams();
        const selectedAddressRadio = document.querySelector('input[name="selectedAddress"]:checked');
        
        if (!selectedAddressRadio) {
            alert("Please select a shipping address.");
            return;
        }

        if (selectedAddressRadio.value === 'new') {
            const formData = new FormData(newAddressForm);
            let formIsValid = true;
            for (const [key, value] of formData.entries()) {
                if (!value && key !== 'apartment') {
                    formIsValid = false;
                    break;
                }
                params.append(key, value);
            }
            if (!formIsValid) {
                alert("Please fill all required fields for the new address.");
                return;
            }
        } else {
            params.append('addressId', selectedAddressRadio.value);
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.pricePerGram * item.weight * item.quantity), 0);
        const totalAmount = subtotal + SHIPPING_COST + (subtotal * TAX_RATE);
        
        params.append('totalAmount', totalAmount.toFixed(2));
        params.append('cartItems', JSON.stringify(cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            pricePerGram: item.pricePerGram,
            weightGrams: item.weight
        }))));

        try {
            const response = await fetch('/checkout', {
                method: 'POST',
                body: params
            });
            const result = await response.json();
            if (result.success) {
                alert("Order placed successfully!");
                localStorage.removeItem("cart");
                window.location.href = "index.html";
            } else {
                alert("Error placing order: " + result.message);
            }
        } catch (error) {
            console.error("Place Order Error:", error);
            alert("A network error occurred. Please try again.");
        }
    }

    if (placeOrderBtn) {
        // This listener is now inside the main DOMContentLoaded event
        placeOrderBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const selectedPayment = document.querySelector('input[name="payment-method"]:checked').value;
            if (selectedPayment === "cod") {
                placeOrder(); // COD order directly
            } else if (selectedPayment === "upi") {
                // Placeholder for UPI integration
                alert("UPI Payment is not yet implemented.");
                // initiateUPIPayment(); 
            }
        });
    }
    loadInitialData();
});
