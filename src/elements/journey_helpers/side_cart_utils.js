import { showPopup } from "./show_popup.js";

function openLittleWordsSideCart() {
  const drawer = document.querySelector("cart-drawer");
  if (drawer && typeof drawer.show === "function") {
    window.isCartRefreshed = true;
    document.documentElement.dispatchEvent(
      new CustomEvent("cart:refresh", { bubbles: true })
    );
    drawer.show();
    return true;
  }
  return false;
}

function openRcoSideCart() {
  if (window.VueMinicart?.$store) {
    window.VueMinicart.$store.dispatch("refreshCart");
    window.VueMinicart.$store.commit("toggleCart", true);
    document.body.classList.add("noscroll");
    return true;
  }
  return false;
}

function openKitschSideCart() {
  window.dispatchEvent(new Event("toggle-cart-drawer"));
  window.dispatchEvent(new Event("update-cart"));
  console.log("✅ Cart drawer refreshed and opened.");
  return true;
}

function openNwkwSideCart(cartData) {
  return fetch("/?sections=cart-drawer,cart-icon-bubble")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch cart sections");
      return res.json();
    })
    .then((sections) => {
      const cartDrawer = document.querySelector("cart-drawer");
      if (!cartDrawer || typeof cartDrawer.renderContents !== "function")
        return false;

      cartDrawer.renderContents({ sections });

      const cartItemsContainer = cartDrawer.querySelector(
        "#CartDrawer-CartItems"
      );
      if (cartItemsContainer && cartItemsContainer.innerHTML.trim()) {
        cartDrawer.classList.remove("is-empty");
      }

      setTimeout(() => {
        if (!cartDrawer.classList.contains("active")) {
          cartDrawer.classList.add("active");
        }
      }, 100);

      publish(PUB_SUB_EVENTS.cartUpdate, {
        source: "product-form",
        productVariantId: `virtual-${Math.random().toString(36).slice(2, 10)}`,
        cartData,
      });

      return true;
    })
    .catch((err) => {
      console.error("WWAI-ERROR [SideCart] Failed to open drawer:", err);
      return false;
    });
}

async function openAndRefreshPuracySideCart() {
  try {
    // Open Side Cart.
    const drawer = document.querySelector('cart-drawer');
    if (!drawer) {
      return false;
    }

    if (drawer && !drawer.open) {
      drawer.open = true;
      drawer.classList.add('active');
    }

    // Refresh Side Cart.
    const cartUrl = window.themeVariables?.routes?.cartUrl || '/cart';
    const isDrawerCart = window.themeVariables?.settings?.cartType === 'drawer';
    
    const [cartData, sectionsHtml] = await Promise.all([
      fetch(`${cartUrl}.js`).then(r => r.json()),
      fetch(`${cartUrl}?sections=mini-cart`).then(r => r.json())
    ]);

    const fullCart = {
      ...cartData,
      sections: sectionsHtml
    };

    document.documentElement.dispatchEvent(new CustomEvent("cart:updated", {
      bubbles: true,
      detail: { cart: fullCart }
    }));

    const shouldOpenDrawer = isDrawerCart && !document.querySelector(".drawer");

    document.documentElement.dispatchEvent(new CustomEvent("cart:refresh", {
      bubbles: true,
      detail: {
        cart: fullCart,
        openMiniCart: shouldOpenDrawer
      }
    }));
    return true;
  } catch (error) {
    console.error("❌ Failed to refresh cart:", error);
    return false;
  }
}

async function openAndRefreshDrmtlgySideCart() {
  // ✅ Dispatch the event to update the cart
  window.dispatchEvent(new CustomEvent('cart-updated'));

  // ✅ Now, trigger the cart to open
  window.dispatchEvent(new CustomEvent('toggle-cart', { detail: { open: true }}));
  
  return true;
}


async function openAndRefreshDoseSideCart() {
  try {
    // Lets call the cart again , so it refreshes the cart.
    window.wwaiCartDrawer = new theme.CartDrawer();
    window.wwaiCartDrawer.drawer.open();
    return true;
  } catch (error) {
    console.error("❌ Failed to open cart drawer:", error);
    return false;
  }
}

async function refreshCartDrawerIdriss() {
  try {
    const response = await fetch(`${routes.cart_url}?section_id=cart-drawer`);
    if (!response.ok) {
      throw new Error(`Unexpected status: ${response.status}`);
    }

    const responseText = await response.text();
    const parser = new DOMParser();
    const sourceDoc = parser.parseFromString(responseText, "text/html");
    const sourceDrawerInner = sourceDoc.querySelector(".js-cart-drawer-inner");
    const targetDrawerInner = document.querySelector(".js-cart-drawer-inner");

    if (targetDrawerInner && sourceDrawerInner) {
      targetDrawerInner.innerHTML = sourceDrawerInner.innerHTML;
    }

    return true;
  } catch (error) {
    console.error("Error refreshing cart drawer:", error);
    return false;
  }
}

//OPEN DRAWER
function openCartDrawerIdriss() {
  const cartDrawer = document.querySelector('cart-drawer');
  if (cartDrawer) {
      cartDrawer.openDrawer();
  }
}


//REFRESH THE CART COUNT
async function updateCartCountIdriss() {
  try {
    const response = await fetch(`${routes.cart_url}.json`);
    if (!response.ok) {
      throw new Error(`Unexpected status: ${response.status}`);
    }

    const cart = await response.json();
    const cartCounts = document.querySelectorAll(".cart-count");
    cartCounts.forEach((element) => {
      element.textContent = cart.item_count;
    });

    const cartBubbles = document.querySelectorAll(".cart-count-bubble");
    cartBubbles.forEach((bubble) => {
      bubble.textContent = cart.item_count;
      if (cart.item_count > 0) {
        bubble.classList.remove("hidden");
      } else {
        bubble.classList.add("hidden");
      }
    });

    return true;
  } catch (error) {
    console.error("Error updating cart count:", error);
    return false;
  }
}

async function sideCartIdrissIntegration() {
  const refreshed = await refreshCartDrawerIdriss();
  openCartDrawerIdriss();
  const countUpdated = await updateCartCountIdriss();
  console.log("✅ Side cart IDRISS integration successful.", refreshed, countUpdated);
  return true;
}


export async function openSideCart(brandName, addToCartResponse, useMock, debugString) {
  if (useMock) {
    const mockPopupMessage = (label) => 
        `🛒 Product added to cart (mock mode) — ${label} redirect enabled.\n\n${debugString || ""}`;
    showPopup(mockPopupMessage("side-cart" + brandName), "success", true);
    return;
  }

  let handled = false;

  switch (brandName) {
    case "littlewords":
      handled = openLittleWordsSideCart();
      break;

    case "rco":
      handled = openRcoSideCart();
      break;

    case "nwkw":
      handled = await openNwkwSideCart(addToCartResponse);
      break;

    case "kitsch":
      handled = await openKitschSideCart();
      break;

    case 'puracy':
      handled = await openAndRefreshPuracySideCart();
      break;

    case 'drmtlgy':
        handled = await openAndRefreshDrmtlgySideCart();
        break;
    
    case 'dose':
      handled = await openAndRefreshDoseSideCart();
      break;

    case 'idriss':
      console.log("✅ Side cart IDRISS integration started.");
      handled = await sideCartIdrissIntegration();
      console.log("✅ Side cart IDRISS integration ended:", handled);
      break;

    // Future brands here

    default:
      console.warn(
        `[SideCart] Unknown or missing brandName: "${brandName}". Redirecting to /cart.`
      );
  }

  if (!handled) {
    // We reply on their inbuild side cart integration. Hence we don't redirect to cart page.
    // The store logic will handle the side cart open.
    if (brandName == "rco") {
      return;
    }
    console.log("✅ Side cart integration failed. Redirecting to cart page.", brandName);
    window.location.href = "/cart";
  }
}
