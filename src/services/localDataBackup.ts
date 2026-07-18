import { aiConfigService } from '@/services/aiConfig'
import { dataAccess } from '@/services/database/dataAccess'

const DATA_TABLES = ['recipes', 'favorites', 'users', 'search_history'] as const
const LOCAL_DATA_KEYS = new Set([
  'chefmind_favorites_v2',
  'chefmind_shopping_list',
  'chefmind_shopping_categories',
  'chefmind_ingredient_categories',
  'chefmind_cooking_methods',
  'chefmind-theme',
  'chefmind-theme-auto',
  'chefMind_userProfile',
  'savedRecipes',
  'recipe-view-history',
  'currentCookingRecipe',
  'search-history',
  'sessionId',
])
const SESSION_DATA_KEYS = new Set(['viewRecipe', 'searchQuery'])

export interface LocalDataBackup {
  version: 1
  exportedAt: string
  indexedDb: Record<(typeof DATA_TABLES)[number], unknown[]>
  localStorage: Record<string, string>
}

const isSafeLocalDataKey = (key: string) =>
  LOCAL_DATA_KEYS.has(key) ||
  key.startsWith('nutrition_') ||
  key.startsWith('cache_') ||
  key.startsWith('chefmind_')

const browserStorageAvailable = () =>
  typeof window !== 'undefined' && typeof localStorage !== 'undefined'

function readSafeLocalStorage(): Record<string, string> {
  if (!browserStorageAvailable()) return {}

  const values: Record<string, string> = {}
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key || !isSafeLocalDataKey(key)) continue
    const value = localStorage.getItem(key)
    if (value !== null) values[key] = value
  }
  return values
}

function validateBackup(value: unknown): LocalDataBackup {
  if (!value || typeof value !== 'object') throw new Error('备份文件格式无效')
  const backup = value as Partial<LocalDataBackup>
  if (backup.version !== 1 || !backup.indexedDb || !backup.localStorage) {
    throw new Error('不支持的 ChefMind 备份文件')
  }

  const indexedDb = {} as LocalDataBackup['indexedDb']
  for (const table of DATA_TABLES) {
    const records = backup.indexedDb[table]
    if (!Array.isArray(records)) throw new Error(`备份中的 ${table} 数据无效`)
    indexedDb[table] = records
  }

  const localStorageRecords: Record<string, string> = {}
  for (const [key, item] of Object.entries(backup.localStorage)) {
    if (isSafeLocalDataKey(key) && typeof item === 'string') {
      localStorageRecords[key] = item
    }
  }

  return {
    version: 1,
    exportedAt: typeof backup.exportedAt === 'string' ? backup.exportedAt : '',
    indexedDb,
    localStorage: localStorageRecords,
  }
}

export async function requestPersistentBrowserStorage(): Promise<boolean | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return null
  return navigator.storage.persist()
}

export async function createLocalDataBackup(): Promise<LocalDataBackup> {
  const records = await Promise.all(
    DATA_TABLES.map(async table => [table, await dataAccess.find(table, {}, 10_000, 0)] as const)
  )

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    indexedDb: Object.fromEntries(records) as LocalDataBackup['indexedDb'],
    localStorage: readSafeLocalStorage(),
  }
}

export async function importLocalDataBackup(rawBackup: unknown): Promise<void> {
  const backup = validateBackup(rawBackup)
  await dataAccess.replaceAll(backup.indexedDb)

  if (!browserStorageAvailable()) return
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (key && isSafeLocalDataKey(key)) localStorage.removeItem(key)
  }
  for (const [key, value] of Object.entries(backup.localStorage)) {
    localStorage.setItem(key, value)
  }
}

export async function clearChefMindLocalData(): Promise<void> {
  await dataAccess.replaceAll(
    Object.fromEntries(DATA_TABLES.map(table => [table, []])) as Record<string, unknown[]>
  )

  if (browserStorageAvailable()) {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index)
      if (key && isSafeLocalDataKey(key)) localStorage.removeItem(key)
    }
  }
  if (typeof sessionStorage !== 'undefined') {
    for (const key of SESSION_DATA_KEYS) sessionStorage.removeItem(key)
  }
  await aiConfigService.clearAllConfigs()
}

export function downloadLocalDataBackup(backup: LocalDataBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chefmind-backup-${backup.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function readLocalDataBackupFile(file: File): Promise<unknown> {
  return JSON.parse(await file.text())
}
