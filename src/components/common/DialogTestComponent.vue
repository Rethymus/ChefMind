<template>
  <div class="dialog-test">
    <el-button @click="showTestDialog = true" type="primary">
      Test Dark Mode Dialog
    </el-button>

    <el-dialog
      v-model="showTestDialog"
      title="Dark Mode Test Dialog"
      width="600px"
      class="test-dialog"
    >
      <div class="dialog-content">
        <h3>Dialog Content Test</h3>
        <p>This dialog should display properly in dark mode without white backgrounds.</p>

        <!-- Test various components -->
        <el-form :model="testForm" label-width="120px">
          <el-form-item label="Text Input">
            <el-input v-model="testForm.text" placeholder="Enter text..." />
          </el-form-item>

          <el-form-item label="Select">
            <el-select v-model="testForm.select" placeholder="Choose option">
              <el-option label="Option 1" value="1" />
              <el-option label="Option 2" value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="Checkbox Group">
            <el-checkbox-group v-model="testForm.checkboxes">
              <el-checkbox label="Option A" />
              <el-checkbox label="Option B" />
              <el-checkbox label="Option C" />
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="Radio Group">
            <el-radio-group v-model="testForm.radio">
              <el-radio label="Choice 1" />
              <el-radio label="Choice 2" />
            </el-radio-group>
          </el-form-item>
        </el-form>

        <!-- Test cards -->
        <el-card class="test-card" style="margin-top: 20px;">
          <template #header>
            <span>Test Card</span>
          </template>
          <p>This card should also respect dark mode.</p>
          <el-button type="success">Success Button</el-button>
          <el-button type="warning">Warning Button</el-button>
          <el-button type="danger">Danger Button</el-button>
        </el-card>

        <!-- Test table -->
        <el-table :data="testData" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="name" label="Name" />
          <el-table-column prop="value" label="Value" />
        </el-table>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="runDebugTools">Debug White Backgrounds</el-button>
          <el-button @click="showTestDialog = false">Cancel</el-button>
          <el-button type="primary" @click="showTestDialog = false">OK</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Import debug utilities
const debugTools = import('@/utils/dialogDebugUtils')

const showTestDialog = ref(false)

const testForm = reactive({
  text: '',
  select: '',
  checkboxes: [],
  radio: 'Choice 1'
})

const testData = [
  { name: 'Test Item 1', value: 'Value 1' },
  { name: 'Test Item 2', value: 'Value 2' },
  { name: 'Test Item 3', value: 'Value 3' }
]

const runDebugTools = async () => {
  try {
    const { debugDialogWhiteBackgrounds, enableDialogVisualDebug } = await debugTools

    console.log('🔍 Running dialog debug tools...')

    // Check for white backgrounds
    debugDialogWhiteBackgrounds()

    // Enable visual debugging
    enableDialogVisualDebug()

    alert('Debug tools activated! Check the console for details.\nRed outlines show all elements.\nRed flashing shows white backgrounds.')
  } catch (error) {
    console.error('Failed to load debug tools:', error)
    alert('Debug tools not available. Make sure you\'re in development mode.')
  }
}
</script>

<style scoped>
.dialog-test {
  padding: 20px;
}

.test-dialog {
  /* Light mode styles (default) */
  :deep(.el-dialog) {
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
    border: 1px solid var(--el-border-color);
  }

  /* Dark mode styles with enhanced specificity */
  [data-theme="dark"] & {
    :deep(.el-dialog) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
      border-color: var(--border-color) !important;
    }

    :deep(.el-dialog__header) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
      border-bottom-color: var(--border-color) !important;
    }

    :deep(.el-dialog__body) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;

      /* Override any nested white backgrounds */
      * {
        background-color: transparent !important;
      }

      /* Specific component fixes */
      .el-form,
      .el-form-item,
      .el-card,
      .el-table {
        background-color: transparent !important;
      }
    }

    :deep(.el-dialog__footer) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
      border-top-color: var(--border-color) !important;
    }

    :deep(.el-dialog__title) {
      color: var(--text-color) !important;
    }

    /* Form elements */
    :deep(.el-input__inner),
    :deep(.el-select__inner) {
      background-color: var(--bg-color-light) !important;
      border-color: var(--border-color) !important;
      color: var(--text-color) !important;
    }

    /* Buttons */
    :deep(.el-button) {
      background-color: var(--bg-color-light) !important;
      border-color: var(--border-color) !important;
      color: var(--text-color) !important;

      &.el-button--primary {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
        color: white !important;
      }

      &.el-button--success {
        background-color: var(--success-color) !important;
        border-color: var(--success-color) !important;
        color: white !important;
      }

      &.el-button--warning {
        background-color: var(--warning-color) !important;
        border-color: var(--warning-color) !important;
        color: white !important;
      }

      &.el-button--danger {
        background-color: var(--danger-color) !important;
        border-color: var(--danger-color) !important;
        color: white !important;
      }

      &:hover:not(.el-button--primary):not(.el-button--success):not(.el-button--warning):not(.el-button--danger) {
        background-color: var(--hover-color) !important;
        border-color: var(--primary-color) !important;
      }
    }

    /* Card styling */
    :deep(.el-card) {
      background-color: var(--bg-color-light) !important;
      border-color: var(--border-color) !important;
      color: var(--text-color) !important;

      .el-card__header {
        background-color: var(--bg-color-light) !important;
        border-bottom-color: var(--border-color) !important;
        color: var(--text-color) !important;
      }

      .el-card__body {
        background-color: var(--bg-color-light) !important;
        color: var(--text-color) !important;
      }
    }

    /* Table styling */
    :deep(.el-table) {
      background-color: var(--bg-color-light) !important;
      color: var(--text-color) !important;

      .el-table__header {
        background-color: var(--bg-color-light) !important;
      }

      .el-table__body {
        background-color: var(--bg-color-light) !important;
      }

      th.el-table__cell {
        background-color: var(--bg-color-light) !important;
        color: var(--text-color) !important;
        border-bottom-color: var(--border-color) !important;
      }

      td.el-table__cell {
        background-color: var(--bg-color-light) !important;
        color: var(--text-color) !important;
        border-bottom-color: var(--border-color) !important;
      }
    }

    /* Form items */
    :deep(.el-form-item__label) {
      color: var(--text-color) !important;
    }

    :deep(.el-checkbox),
    :deep(.el-radio) {
      color: var(--text-color) !important;

      .el-checkbox__label,
      .el-radio__label {
        color: var(--text-color) !important;
      }
    }

    /* Fix for any remaining white backgrounds */
    :deep([style*="background-color: white"]),
    :deep([style*="background-color: #fff"]) {
      background-color: var(--card-bg) !important;
    }
  }
}

.dialog-content {
  padding: 10px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>