# git-branch-zip

Checks out each branch in a git repo, finds the folder with the most changes from the last branch created, and zips it. 

Zips are placed in the `/tmp` folder.

### Installation

```
git clone git@github.com:StephenGrider/git-branch-zip.git
cd git-branch-zip
npm link
```

### Running

```
git-branch-zip
```

Errors will be printed anytime a most-changed-folder cannot be determined.
