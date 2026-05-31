#!/usr/bin/env node
// One-shot helper: apply withOutboxModule plugin logic to the existing
// ios/linkstock.xcodeproj/project.pbxproj without going through expo prebuild.
const fs = require('fs');
const path = require('path');
const xcode = require('xcode');

const PROJECT_PATH = path.resolve(
  __dirname,
  '..',
  'ios',
  'linkstock.xcodeproj',
  'project.pbxproj'
);

const APP_TARGET = 'linkstock';
const EXT_TARGET = 'linkstockShareExtension';
const GROUP_NAME = 'Outbox';
const SOURCES = [
  { name: 'Outbox.swift', type: 'sourcecode.swift' },
  { name: 'Outbox.m', type: 'sourcecode.c.objc' },
];

function findTargetUuid(proj, productName) {
  const targets = proj.pbxNativeTargetSection();
  for (const uuid of Object.keys(targets)) {
    const t = targets[uuid];
    if (typeof t !== 'object' || !t.name) continue;
    const name = t.name.replace(/^"|"$/g, '');
    if (name === productName) return uuid;
  }
  return null;
}

function ensureGroup(proj, groupName) {
  const groups = proj.hash.project.objects.PBXGroup || {};
  for (const key of Object.keys(groups)) {
    if (key.endsWith('_comment')) continue;
    const g = groups[key];
    if (g && (g.name === groupName || g.name === `"${groupName}"`)) return key;
  }
  const newGroupKey = proj.pbxCreateGroup(groupName, groupName);
  const mainGroup = proj.getFirstProject().firstProject.mainGroup;
  proj.addToPbxGroup(newGroupKey, mainGroup);
  return newGroupKey;
}

function fileAlreadyInSources(proj, fileName, targetUuid) {
  const sources = proj.pbxSourcesBuildPhaseObj(targetUuid);
  if (!sources || !sources.files) return false;
  return sources.files.some(f => f.comment && f.comment.includes(fileName));
}

function addSourceToTargets(proj, fileName, fileType, groupKey, targetUuids) {
  const [primary, ...rest] = targetUuids;
  let file;
  const existing = proj.hasFile(fileName);
  if (existing) {
    file = existing;
    file.target = primary;
    if (!file.uuid) file.uuid = proj.generateUuid();
    if (!fileAlreadyInSources(proj, fileName, primary)) {
      file.uuid = proj.generateUuid();
      proj.addToPbxBuildFileSection(file);
      proj.addToPbxSourcesBuildPhase(file);
    }
  } else {
    file = proj.addSourceFile(fileName, { target: primary, lastKnownFileType: fileType }, groupKey);
    if (!file) {
      console.warn(`addSourceFile returned null for ${fileName}`);
      return;
    }
  }

  for (const targetUuid of rest) {
    if (fileAlreadyInSources(proj, fileName, targetUuid)) continue;
    const cloned = Object.assign({}, file, {
      uuid: proj.generateUuid(),
      target: targetUuid,
    });
    proj.addToPbxBuildFileSection(cloned);
    proj.addToPbxSourcesBuildPhase(cloned);
  }
}

function main() {
  const proj = xcode.project(PROJECT_PATH);
  proj.parseSync();

  const appTarget = findTargetUuid(proj, APP_TARGET);
  const extTarget = findTargetUuid(proj, EXT_TARGET);
  if (!appTarget || !extTarget) {
    console.error(`Could not locate both targets (app=${appTarget}, ext=${extTarget})`);
    process.exit(1);
  }
  const groupKey = ensureGroup(proj, GROUP_NAME);
  for (const src of SOURCES) {
    addSourceToTargets(proj, src.name, src.type, groupKey, [appTarget, extTarget]);
  }
  fs.writeFileSync(PROJECT_PATH, proj.writeSync());
  console.log('Outbox sources registered in both targets.');
}

main();
