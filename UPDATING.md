# How to update the project from the command line

First you need to add upstream remote if you haven't already:

```bash
git remote add upstream git@github.com:misskey-dev/misskey.git
```

Then you can fetch the latest changes from upstream:

```bash
git fetch upstream
```

If somehow you are no on local master branch, you can switch to it:

```bash
git checkout master
```

Then you can merge the latest changes from upstream into your local branch:

```bash
git merge upstream/master
```

If there is a merge conflict, you need to resolve it manually. After resolving the conflict, you can commit the changes:

```bash
git add .
git commit -m "Merge upstream changes"
```
## Common issues
 - Import Conflicts: If the conflicts are just in imports, you can copy our imports, accept incoming changes and then add our imports back.
