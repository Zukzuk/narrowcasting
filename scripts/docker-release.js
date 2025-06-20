#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import data from '../package.json' with { type: 'json' };
import dotenv from 'dotenv';

// __dirname emulation in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../deploy/public.env') });

function main() {
  const { version: APP_VERSION_TAG } = data;
  
  if (!APP_VERSION_TAG) {
    console.error("Error: No version found in package.json. Please specify a version.");
    process.exit(1);
  }
  const APP_PORT = process.env.APP_PORT;
  buildAndPushMultiArch(APP_VERSION_TAG, APP_PORT);
}

function buildAndPushMultiArch(APP_VERSION_TAG, APP_PORT) {
  const versionTag = `zukzuk/narrowcasting:${APP_VERSION_TAG}`;
  const latestTag = `zukzuk/narrowcasting:latest`;

  try {
    // 1) Ensure we have a buildx builder
    try {
      execSync(`docker buildx inspect multi-builder`, { stdio: 'ignore' });
    } catch {
      console.log("Creating Docker Buildx builder 'multi-builder'…");
      execSync(`docker buildx create --name multi-builder --use`, { stdio: 'inherit' });
    }
    execSync(`docker buildx inspect --bootstrap`, { stdio: 'inherit' });

    // 2) Build & push both amd64 and arm64 variants in one command
    const buildCmd = [
      'docker buildx build',
      `--platform linux/amd64,linux/arm64`,
      `-f scripts/Dockerfile.release`,
      `--build-arg APP_VERSION_TAG=${APP_VERSION_TAG}`,
      `--build-arg APP_PORT=${APP_PORT}`,
      `-t ${versionTag}`,
      `-t ${latestTag}`,
      `--push`,
      `.`
    ].join(' ');

    console.log("Running:", buildCmd);
    execSync(buildCmd, { stdio: 'inherit' });

    console.log(`✅ Multi-arch image published as ${versionTag} and ${latestTag}`);
  } catch (err) {
    console.error("Error during multi-arch Docker build/push:", err.message);
    process.exit(1);
  }
}

main();
