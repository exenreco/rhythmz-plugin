/**
 * Ticket Increment
 * @param {*} e
 * @param {*} ticketRef
 * @returns
 */
function increment(e, ticketRef) {
  e.preventDefault();
  e.stopImmediatePropagation();
  const { quantityInput, message } = ticketRef;

  if (quantityInput) {
    const // user element input
      maxQty = Number(quantityInput?.max || 5),
      stepQty = Number(quantityInput?.step || 1),
      qtyValue = Number(quantityInput?.value || 1),
      availableQty = Number(quantityInput?.dataset?.quantity || 0);

    if (qtyValue + stepQty <= maxQty && qtyValue + stepQty <= availableQty) {
      quantityInput.value = `${qtyValue + stepQty}`;
    } else {
      if (message) {
        let messageText = "";
        if (qtyValue + stepQty > maxQty)
          messageText = `Only ${maxQty} tickets allowed!`;
        else if (maxQty > availableQty)
          messageText = `Only ${availableQty} tickets available!`;

        message.classList.add("error");
        message.textContent = messageText;
      }
    }
    quantityInput.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    if (message) {
      message.classList.add("error");
      message.textContent = "an error occurred with ticket increment";
    }
  }

  return;
}

/**
 * Ticket Decrement
 * @param {*} e
 * @param {*} ticketRef
 * @returns
 */
function decrement(e, ticketRef) {
  e.preventDefault();
  e.stopImmediatePropagation();
  const { quantityInput, message } = ticketRef;
  if (quantityInput) {
    const minQty = Number(quantityInput?.min || 1),
      stepQty = Number(quantityInput?.step || 1),
      qtyValue = Number(quantityInput?.value || 1),
      availableQty = Number(quantityInput?.dataset?.quantity || 0);

    if (qtyValue - stepQty >= minQty && qtyValue - stepQty <= availableQty) {
      quantityInput.value = `${qtyValue - stepQty}`;
    } else {
      let messageText = "";
      if (qtyValue - stepQty < minQty)
        messageText = `A minimum of ${minQty} tickets must be selected!`;
      else if (qtyValue - stepQty > availableQty)
        messageText = `Only ${availableQty} tickets available!`;
      if (message) {
        message.classList.add("error");
        message.textContent = messageText;
      }
    }
    quantityInput.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    if (message) {
      message.classList.add("error");
      message.textContent = "an error occurred with ticket decrement";
    }
  }
  return;
}
/**
 * Ticket Submit
 * @param {*} productId
 * @param {*} quantity
 * @param {*} messageEl
 * @returns
 */
async function submit(productId = 0, quantity = 0, messageEl) {
  const cartData = window.cart_data;

  if (!cartData || !cartData.nonce) {
    console.error("Cart data or Nonce missing. Check wp_localize_script.");
    return;
  }

  const enableMessage = messageEl && messageEl instanceof Node;

  const apiUrl = `${cartData.root}wc/store/v1/cart/add-item`;

  if (enableMessage) {
    messageEl.textContent = "Processing...";
    messageEl.classList.remove("error");
    messageEl.classList.add("success");
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Nonce: cartData.nonce,
        "X-WC-Store-API-Nonce": cartData.nonce, // Try sending both
      },
      credentials: "include", // Necessary for sessions
      body: JSON.stringify({
        id: parseInt(productId),
        quantity: parseInt(quantity),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Server Error:", data);
      if (enableMessage) {
        messageEl.innerHTML = `Error: ${
          data.message || "Error adding to cart"
        }`;
        messageEl.classList.remove("success");
        messageEl.classList.add("error");
      }
      return;
    }

    if (enableMessage) {
      messageEl.innerHTML = `Success: Ticket was added successfully! Reloading...`;
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
    }
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    if (enableMessage) {
      messageEl.innerHTML = error || "Error adding to cart";
      messageEl.classList.remove("success");
      messageEl.classList.add("error");
    }
    console.error("Fetch error:", error);
  }
  return;
}

export { increment, decrement, submit };
