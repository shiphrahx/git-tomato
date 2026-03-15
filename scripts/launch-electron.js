#!/usr/bin/env node
/**
 * Launches Electron with ELECTRON_RUN_AS_NODE unset.
 * Claude Code (and other Electron-based editors) set this env var,
 * which causes Electron to run in Node-only mode without its APIs.
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');

const electronPath = require('electron');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const args = ['.', ...process.argv.slice(2)];
env.ELECTRON_DEV = '1';

const child = spawn(electronPath, args, {
  stdio: 'inherit',
  env,
  cwd: path.join(__dirname, '..'),
});

child.on('close', (code) => process.exit(code ?? 0));
