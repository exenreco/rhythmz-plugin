# How to run (recommended)

1. From rhythmz/blocks/ root:

    - Install deps for all workspaces:
        cd rhythmz/blocks
        npm install

2. Build every block to rhythmz/build/: npm run build:workspaces

3. For development (watch mode) you can run: npm run start:workspaces

# Notes:
    You can also run npm run build --workspace=three-d-block to only build a single workspace (per npm docs: --workspace or --workspaces).

    If you prefer Yarn, replace the workspace runner with yarn workspaces foreach -p run build.