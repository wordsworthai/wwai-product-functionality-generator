function injectNotificationStyles({
    backgroundColor = '#E8DDFA',
    textColor = '#000000',
    borderColor = 'transparent',
    fontFamily = 'sans-serif'
  } = {}) {
    if (document.getElementById('wwai-notification-styles')) return;
  
    const styles = `
      .wwai-temporary-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${backgroundColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        font-family: ${fontFamily};
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0.95;
        transition: opacity 0.3s ease-in-out;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        max-width: 300px;
      }
  
      .wwai-temporary-notification.fade-out {
        opacity: 0;
      }
    `;
  
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.id = 'wwai-notification-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }
  
  export function showTemporaryNotification(
    message,
    duration = 400,
    options = {}
  ) {
    injectNotificationStyles(options);
  
    const notification = document.createElement('div');
    notification.className = 'wwai-temporary-notification';
    notification.innerText = message;
  
    document.body.appendChild(notification);
  
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, duration);
}  