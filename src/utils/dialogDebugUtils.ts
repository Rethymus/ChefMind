/*
 * ChefMind - Dialog Debug Utilities
 *
 * This utility provides debugging tools to identify and fix white background
 * issues in Element Plus dialogs during dark mode.
 */

/**
 * Debug tool to identify white background elements in dialogs
 * Call this function when dialog is open to highlight problematic elements
 */
export const debugDialogWhiteBackgrounds = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Dialog debug tools are only available in development mode');
    return;
  }

  console.log('🔍 Starting dialog white background debug...');

  // Find all open dialogs
  const dialogs = document.querySelectorAll('.el-dialog');

  if (dialogs.length === 0) {
    console.warn('No open dialogs found');
    return;
  }

  dialogs.forEach((dialog, index) => {
    console.log(`📋 Dialog ${index + 1}:`, dialog);

    // Check dialog body for white backgrounds
    const dialogBody = dialog.querySelector('.el-dialog__body');
    if (dialogBody) {
      const whiteElements = findWhiteBackgroundElements(dialogBody);

      if (whiteElements.length > 0) {
        console.error(`❌ Found ${whiteElements.length} elements with white backgrounds in dialog body:`);
        whiteElements.forEach((el, i) => {
          console.error(`   ${i + 1}.`, el, {
            classList: el.className,
            background: getComputedStyle(el).backgroundColor,
            inlineStyle: el.getAttribute('style')
          });
        });
      } else {
        console.log('✅ No white background elements found in dialog body');
      }
    }
  });
};

/**
 * Find elements with white backgrounds within a container
 */
const findWhiteBackgroundElements = (container: Element): Element[] => {
  const whiteElements: Element[] = [];
  const allElements = container.querySelectorAll('*');

  allElements.forEach(el => {
    const computedStyle = getComputedStyle(el);
    const backgroundColor = computedStyle.backgroundColor;

    // Check for white or near-white backgrounds
    if (backgroundColor && (
      backgroundColor === 'rgb(255, 255, 255)' ||
      backgroundColor === '#ffffff' ||
      backgroundColor === 'white' ||
      backgroundColor === 'rgba(255, 255, 255, 1)' ||
      (backgroundColor.startsWith('rgb(255,') && backgroundColor.includes('255)')) ||
      (backgroundColor.startsWith('rgba(255,') && backgroundColor.includes('255)'))
    )) {
      whiteElements.push(el);
    }
  });

  return whiteElements;
};

/**
 * Apply visual debugging styles to highlight white backgrounds
 */
export const enableDialogVisualDebug = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Dialog debug tools are only available in development mode');
    return;
  }

  console.log('🎨 Enabling visual debug mode for dialogs...');

  // Add debug styles
  const debugStyles = document.createElement('style');
  debugStyles.id = 'dialog-debug-styles';
  debugStyles.textContent = `
    .el-dialog__body * {
      outline: 1px solid red !important;
      outline-offset: -1px !important;
    }

    .el-dialog__body [style*="background-color: white"],
    .el-dialog__body [style*="background-color: #fff"],
    .el-dialog__body [style*="background: white"],
    .el-dialog__body [style*="background: #fff"] {
      background-color: #ff6b6b !important;
      animation: pulse-white-bg 2s infinite;
    }

    @keyframes pulse-white-bg {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .debug-info-panel {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
    }
  `;

  // Remove existing debug styles
  const existingStyles = document.getElementById('dialog-debug-styles');
  if (existingStyles) {
    existingStyles.remove();
  }

  document.head.appendChild(debugStyles);

  // Add debug info panel
  const infoPanel = document.createElement('div');
  infoPanel.className = 'debug-info-panel';
  infoPanel.innerHTML = `
    <strong>🔍 Dialog Debug Mode</strong><br>
    Red outlines show all elements<br>
    Red flashing shows white backgrounds<br>
    <button onclick="disableDialogVisualDebug()" style="margin-top: 5px; padding: 2px 8px;">Disable</button>
  `;

  document.body.appendChild(infoPanel);

  console.log('✅ Visual debug mode enabled. White backgrounds will flash red.');
};

/**
 * Disable visual debugging
 */
export const disableDialogVisualDebug = () => {
  const debugStyles = document.getElementById('dialog-debug-styles');
  if (debugStyles) {
    debugStyles.remove();
  }

  const infoPanel = document.querySelector('.debug-info-panel');
  if (infoPanel) {
    infoPanel.remove();
  }

  console.log('🚫 Visual debug mode disabled');
};

/**
 * Force dark mode on all dialog elements
 */
export const forceDialogDarkMode = () => {
  console.log('🌙 Forcing dark mode on all dialogs...');

  const dialogs = document.querySelectorAll('.el-dialog');

  dialogs.forEach(dialog => {
    // Force dark mode classes
    dialog.classList.add('dark-mode-forced');

    // Apply dark mode styles
    const style = document.createElement('style');
    style.textContent = `
      .dark-mode-forced {
        background-color: #2c2c2c !important;
        color: #ecf0f1 !important;
      }

      .dark-mode-forced .el-dialog__header,
      .dark-mode-forced .el-dialog__body,
      .dark-mode-forced .el-dialog__footer {
        background-color: #2c2c2c !important;
        color: #ecf0f1 !important;
      }

      .dark-mode-forced * {
        background-color: transparent !important;
        color: #ecf0f1 !important;
      }
    `;

    if (!document.getElementById('force-dark-mode-styles')) {
      style.id = 'force-dark-mode-styles';
      document.head.appendChild(style);
    }
  });

  console.log('✅ Dark mode forced on dialogs');
};

/**
 * Monitor dialogs for white background issues
 */
export const monitorDialogWhiteBackgrounds = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Dialog debug tools are only available in development mode');
    return;
  }

  console.log('👀 Starting dialog white background monitor...');

  // Watch for dialog openings
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          // Check if this is a dialog or contains a dialog
          if (node.classList.contains('el-dialog') || node.querySelector('.el-dialog')) {
            console.log('📋 New dialog detected');

            // Wait a bit for dialog to fully render
            setTimeout(() => {
              const whiteElements = findWhiteBackgroundElements(document.body);
              const dialogWhiteElements = whiteElements.filter(el =>
                el.closest('.el-dialog')
              );

              if (dialogWhiteElements.length > 0) {
                console.warn(`⚠️ Found ${dialogWhiteElements.length} white background elements in dialogs`);
                dialogWhiteElements.forEach((el, i) => {
                  console.warn(`   ${i + 1}.`, el);
                });
              } else {
                console.log('✅ No white background issues detected in new dialog');
              }
            }, 100);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ Dialog monitor started. Open dialogs to see white background reports.');

  return observer;
};

// Make functions available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).dialogDebug = {
    debugWhiteBackgrounds: debugDialogWhiteBackgrounds,
    enableVisualDebug: enableDialogVisualDebug,
    disableVisualDebug: disableDialogVisualDebug,
    forceDarkMode: forceDialogDarkMode,
    monitor: monitorDialogWhiteBackgrounds
  };

  console.log('🔧 Dialog debug tools available at window.dialogDebug');
  console.log('   - debugWhiteBackgrounds()');
  console.log('   - enableVisualDebug()');
  console.log('   - disableVisualDebug()');
  console.log('   - forceDarkMode()');
  console.log('   - monitor()');
}