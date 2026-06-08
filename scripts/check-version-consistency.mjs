#!/usr/bin/env node

import fs from 'node:fs'

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function readCargoVersion(path) {
  const content = fs.readFileSync(path, 'utf8')
  const match = content.match(/^version = "([^"]+)"/m)
  if (!match) {
    throw new Error(`Unable to find package version in ${path}`)
  }
  return match[1]
}

function readCargoLockPackageVersion(path, packageName) {
  const content = fs.readFileSync(path, 'utf8')
  const packageBlock = content
    .split('\n[[package]]\n')
    .find(block => block.includes(`name = "${packageName}"`))

  if (!packageBlock) {
    throw new Error(`Unable to find ${packageName} package block in ${path}`)
  }

  const match = packageBlock.match(/^version = "([^"]+)"/m)
  if (!match) {
    throw new Error(`Unable to find ${packageName} version in ${path}`)
  }
  return match[1]
}

const packageJson = readJson('package.json')
const packageLock = readJson('package-lock.json')
const tauriConfig = readJson('src-tauri/tauri.conf.json')

const expected = packageJson.version
const versions = {
  'package.json': packageJson.version,
  'package-lock.json': packageLock.version,
  'package-lock root package': packageLock.packages?.['']?.version,
  'src-tauri/tauri.conf.json': tauriConfig.version,
  'src-tauri/Cargo.toml': readCargoVersion('src-tauri/Cargo.toml'),
  'src-tauri/Cargo.lock': readCargoLockPackageVersion('src-tauri/Cargo.lock', 'chefmind'),
}

const mismatches = Object.entries(versions).filter(([, version]) => version !== expected)

if (mismatches.length > 0) {
  console.error(`Version mismatch. Expected ${expected}.`)
  for (const [source, version] of mismatches) {
    console.error(`- ${source}: ${version}`)
  }
  process.exit(1)
}

console.log(`All release version sources match ${expected}.`)
