#!/usr/bin/env node

const { exec } = require('child_process');

async function run() {
  const branches = parseBranches(await safe('git branch -a'));

  for (let index in branches) {
    if (!index) {
      continue;
    }
    const branch = branches[index];
    const previousBranch = branches[index - 1];

    if (!branch || !previousBranch || previousBranch === 'master') {
      continue;
    }

    await safe(`git checkout ${branch}`);
    const changedFolder = await findChangedFolder(branch, previousBranch);
    if (!changedFolder) {
      console.error(`Unable to determine project folder for branch ${branch}`);
      continue;
    }

    try {
      await safe(
        `cd ${changedFolder} && zip -vr /tmp/\`basename ${branch.replace(
          'remotes/origin/',
          ''
        )}\`.zip . -x "**/node_modules/*" "node_modules/*" "**/.git/*" "**/.next/*" ".DS_Store"`
      );
    } catch (err) {
      console.error(`Failed to zip branch ${branch}:`, err.message);
    }
  }
}
run();

async function findChangedFolder(branch, previousBranch) {
  const diff = await safe(`git diff ${previousBranch}`);
  try {
    const [primary, secondary] = diff.match(/a\/(.*?)\//);
    return secondary;
  } catch (err) {
    console.error(
      'Error finding project folder between',
      previousBranch,
      'and',
      branch
    );
  }
}

function parseBranches(str) {
  return str.split('\n').map((b) => {
    return b.includes('HEAD') || b.includes('*') ? null : b.replace(/\s/gi, '');
  });
}

async function safe(cmd) {
  const stdout = await new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        maxBuffer: 1024 * 1024 * 10,
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error('err running command:', cmd);
          console.error(err);
          return reject(err);
        }
        if (stderr) {
          // console.error('Stderr running command:', cmd);
          // console.error(stderr);
        }
        resolve(stdout);
      }
    );
  });
  return stdout;
}
