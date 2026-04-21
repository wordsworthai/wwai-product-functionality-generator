export function showPopup(message, type = "success", centered = false) {
    const popup = document.createElement("div");
    popup.textContent = message;

    popup.style.cssText = `
        position: fixed;
        ${centered ? "top: 50%; left: 50%; transform: translate(-50%, -50%);" : "bottom: 20px; right: 20px;"}
        background: ${
        type === "error"
            ? "#D9534F"
            : type === "warning"
            ? "rgb(87, 102, 92)"
            : "#333"
        };
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.5s ease-in-out;
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => popup.remove(), 500); // sync with transition
    }, 2000);
}
  