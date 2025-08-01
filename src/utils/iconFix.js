// 图标修复工具
// 当CDN加载失败时，提供备用图标解决方案

// 检查Font Awesome是否正确加载
export function checkFontAwesome() {
  // 检测是否已加载Font Awesome
  const isFontAwesomeLoaded = () => {
    const span = document.createElement('span');
    span.className = 'fas fa-check';
    span.style.display = 'none';
    document.body.appendChild(span);
    
    const result = window.getComputedStyle(span).fontFamily.includes('Font Awesome');
    document.body.removeChild(span);
    return result;
  };

  // 如果未加载，尝试重新加载
  if (!isFontAwesomeLoaded()) {
    console.warn('Font Awesome未正确加载，尝试重新加载...');
    loadFontAwesome();
  }
}

// 加载Font Awesome
function loadFontAwesome() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
  link.integrity = 'sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==';
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  
  // 添加备用CDN
  link.onerror = () => {
    console.warn('主CDN加载失败，尝试备用CDN...');
    const backupLink = document.createElement('link');
    backupLink.rel = 'stylesheet';
    backupLink.href = 'https://use.fontawesome.com/releases/v6.0.0/css/all.css';
    document.head.appendChild(backupLink);
  };
  
  document.head.appendChild(link);
}

// 提供CSS图标备用方案
export function setupIconFallbacks() {
  // 创建一个样式表，为常用图标提供CSS备用方案
  const style = document.createElement('style');
  style.textContent = `
    /* 图标备用样式 */
    .icon-fallback {
      display: inline-block;
      width: 1em;
      height: 1em;
      text-align: center;
      line-height: 1;
    }
    
    /* 麦克风图标 */
    .fa-microphone::before {
      content: '🎤';
    }
    
    /* 麦克风禁用图标 */
    .fa-microphone-slash::before {
      content: '🔇';
    }
    
    /* 复选框图标 */
    .fa-check::before {
      content: '✓';
    }
    
    /* 关闭图标 */
    .fa-times::before {
      content: '✕';
    }
    
    /* 复选框圆圈图标 */
    .fa-check-circle::before {
      content: '✓';
    }
  `;
  
  document.head.appendChild(style);
}