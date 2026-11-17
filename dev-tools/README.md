# ALSACAEM EDS Development Toolkit (macOS)

These files are **helpers for your existing Git clone**, not a new AEM project. They do not modify `fstab.yaml`, Code Sync, or your AEM Cloud sandbox.

## Install

1. Unzip the toolkit **into the root of your existing local `ALSACAEM` Git repository**. You should see `ALSACAEM/EDS Toolkit.command` and `ALSACAEM/dev-tools/` alongside `blocks/`, `scripts/`, `package.json`, and `.git/`.
2. Open Terminal, navigate to the repository, and run:

   ```bash
   chmod +x "EDS Toolkit.command" dev-tools/*.sh
   ./"EDS Toolkit.command"
   ```

   You can also double-click `EDS Toolkit.command` in Finder on Macs where execution is allowed. If macOS or corporate controls block downloaded scripts, use Terminal and follow your organization's security procedures instead of bypassing them.

3. In the menu, run **7) One-time setup** if this machine hasn't installed Node dependencies and Adobe AEM CLI.
4. Run **1) Start local EDS (aem up)**. Visit `http://localhost:3000/`. Stop with `Ctrl+C`.
5. Run **3) Build XWalk config + run lint** after editing `models/*` or adding a Universal Editor block.
6. Run **4) Commit and optionally push code** when your changes are ready. It shows exactly what will be staged and asks before committing and pushing. If pushing to main is restricted, use a feature branch and PR instead.
7. Run **5) Check EDS deployment URLs** to confirm your JavaScript and Geo Hero assets are served on `.aem.page`.

## Root layout

```text
ALSACAEM/
├── EDS Toolkit.command          # Double-click/run this menu
├── dev-tools/
│   ├── config.sh                # Public EDS project identifiers
│   ├── setup.sh                 # npm install/ci, AEM CLI
│   ├── start-eds.sh             # aem up
│   ├── git-status.sh            # review changes
│   ├── build-check.sh           # npm run build:json + npm run lint
│   ├── git-commit-push.sh       # interactive stage/commit/push
│   ├── verify-sync.sh           # HTTP status checks
│   └── pull-latest.sh           # git pull --ff-only
├── blocks/
├── models/
├── scripts/
├── package.json
└── .git/
```

## Command-line shortcuts

From the repository root you can run an individual script without the menu:

```bash
bash dev-tools/start-eds.sh
bash dev-tools/git-status.sh
bash dev-tools/build-check.sh
bash dev-tools/git-commit-push.sh
bash dev-tools/verify-sync.sh
bash dev-tools/pull-latest.sh
```

## For your Geo Hero block

- Put `blocks/geo-hero/*` in the existing `blocks/geo-hero/` folder.
- Put `register-geo-hero.py` in the existing `scripts/` folder.
- Select menu **8** once to register Geo Hero with Universal Editor (if that registration script is present), then menu **3** to rebuild model JSON and lint.
- Use menu **4** to commit/push code and menu **5** to check EDS file delivery.
- **Content publishing is separate from code syncing.** A working `aem up` or EDS JS URL does **not** fix the EDS User Admin 403 or grant the AEM technical account permission to publish. That issue must be resolved separately.
- This toolkit runs the **EDS local development server**, not the local Java-based AEM Cloud Author SDK. Java 21 is not required for `aem up`.

## Notes on Git safety

- The commit helper always shows the staged files and explicitly asks for approval before commit/push.
- `git add -A` can stage local files, so review the file list. Do not commit credentials, private files, or client data.
- The script highlights filenames that look like credentials, but it cannot detect every secret.
- The pull helper refuses to run with uncommitted changes and uses fast-forward only; it never force-resets your branch.
- By default the deployment-check script uses your current branch, the `matthub43` EDS owner, and `alsacaem` site. Update `dev-tools/config.sh` if you move to a company repository. For non-GitHub/BYOG deployments, verify project naming and Code Sync registration before relying on the generated URL.
- This toolkit **does not** run `git push --force`, delete branches, or automatically install global software without asking.

## Official references

- https://www.aem.live/developer/ue-tutorial
- https://www.aem.live/developer/cli-reference
