const { withXcodeProject } = require('@expo/config-plugins');

const APP_TARGET = 'linkstock';
const EXT_TARGET = 'linkstockShareExtension';
const GROUP_NAME = 'Outbox';
const SOURCES = [
  { name: 'Outbox.swift', type: 'sourcecode.swift' },
  { name: 'Outbox.m', type: 'sourcecode.c.objc' },
];

function findTargetUuid(xcode, productName) {
  const targets = xcode.pbxNativeTargetSection();
  for (const uuid of Object.keys(targets)) {
    const t = targets[uuid];
    if (typeof t !== 'object' || !t.name) continue;
    const name = t.name.replace(/^"|"$/g, '');
    if (name === productName) return uuid;
  }
  return null;
}

function ensureGroup(xcode, groupName) {
  const groups = xcode.hash.project.objects.PBXGroup || {};
  for (const key of Object.keys(groups)) {
    if (key.endsWith('_comment')) continue;
    const g = groups[key];
    if (g && (g.name === groupName || g.name === `"${groupName}"`)) {
      return key;
    }
  }
  const newGroupKey = xcode.pbxCreateGroup(groupName, groupName);
  const mainGroup = xcode.getFirstProject().firstProject.mainGroup;
  xcode.addToPbxGroup(newGroupKey, mainGroup);
  return newGroupKey;
}

function fileAlreadyInSources(xcode, fileName, targetUuid) {
  const sources = xcode.pbxSourcesBuildPhaseObj(targetUuid);
  if (!sources || !sources.files) return false;
  return sources.files.some(f => f.comment && f.comment.includes(fileName));
}

function addSourceToTargets(xcode, fileName, fileType, groupKey, targetUuids) {
  const [primaryTarget, ...rest] = targetUuids;

  let file;
  const alreadyInProject = !!xcode.hasFile(fileName);
  if (alreadyInProject) {
    file = xcode.hasFile(fileName);
    file.target = primaryTarget;
    file.uuid = file.uuid || xcode.generateUuid();
  } else {
    file = xcode.addSourceFile(fileName, { target: primaryTarget, lastKnownFileType: fileType }, groupKey);
    if (!file) return;
  }

  if (alreadyInProject && !fileAlreadyInSources(xcode, fileName, primaryTarget)) {
    file.uuid = xcode.generateUuid();
    xcode.addToPbxBuildFileSection(file);
    xcode.addToPbxSourcesBuildPhase(file);
  }

  for (const targetUuid of rest) {
    if (fileAlreadyInSources(xcode, fileName, targetUuid)) continue;
    const cloned = Object.assign({}, file, {
      uuid: xcode.generateUuid(),
      target: targetUuid,
    });
    xcode.addToPbxBuildFileSection(cloned);
    xcode.addToPbxSourcesBuildPhase(cloned);
  }
}

module.exports = function withOutboxModule(config) {
  return withXcodeProject(config, (cfg) => {
    const xcode = cfg.modResults;
    const appTarget = findTargetUuid(xcode, APP_TARGET);
    const extTarget = findTargetUuid(xcode, EXT_TARGET);
    if (!appTarget || !extTarget) {
      console.warn(`[withOutboxModule] could not locate both targets (app=${appTarget}, ext=${extTarget})`);
      return cfg;
    }
    const groupKey = ensureGroup(xcode, GROUP_NAME);
    for (const src of SOURCES) {
      addSourceToTargets(xcode, src.name, src.type, groupKey, [appTarget, extTarget]);
    }
    console.log('[withOutboxModule] Outbox sources registered in both targets');
    return cfg;
  });
};
