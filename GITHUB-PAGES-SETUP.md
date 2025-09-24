# 🌐 GitHub Pages Deployment Setup

This document explains how the SAANSE project is configured for automatic deployment to GitHub Pages when code is pushed to the `dev` branch.

## 📋 Overview

The GitHub Pages deployment is handled by the `.github/workflows/github-pages.yml` workflow file, which:

1. **Triggers** on pushes to the `dev` branch
2. **Builds** the frontend React application using Vite
3. **Deploys** the static files to GitHub Pages
4. **Verifies** the deployment is working correctly

## 🚀 How It Works

### Workflow Triggers

- **Push to `dev` branch**: Automatically deploys to GitHub Pages
- **Manual dispatch**: Can be triggered manually from the GitHub Actions tab

### Build Process

1. **Checkout Code**: Downloads the latest code from the `dev` branch
2. **Setup Node.js**: Installs Node.js 18 and npm dependencies
3. **TypeScript Check**: Validates TypeScript code
4. **Build Frontend**: Runs `npm run build:client` to build the React app
5. **Prepare Files**: Copies built files from `dist/public` to the deployment directory
6. **Deploy**: Uploads and deploys to GitHub Pages

### Environment Variables

The workflow uses these environment variables:

- `NODE_ENV=production`: Sets production mode
- `VITE_API_URL`: API endpoint URL (can be set in repository secrets)
- `VITE_APP_NAME`: Application name (SAANSE)
- `VITE_APP_VERSION`: Git commit SHA

## 🔧 Configuration

### Repository Settings

To enable GitHub Pages:

1. Go to **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. The workflow will automatically deploy to `https://<username>.github.io/<repository-name>`

### Required Secrets

Add these secrets in **Settings** → **Secrets and variables** → **Actions**:

- `VITE_API_URL` (optional): Your API endpoint URL
- `SLACK_WEBHOOK_URL` (optional): For deployment notifications

## 📁 File Structure

```
.github/workflows/
├── github-pages.yml     # GitHub Pages deployment workflow
├── cicd.yml            # Full CI/CD pipeline
└── docker-build.yml    # Docker build workflow

dist/
└── public/             # Built frontend files (generated)
    ├── index.html
    ├── assets/
    └── ...
```

## 🛠️ Build Scripts

The following npm scripts are used:

- `npm run build:client`: Builds only the frontend (used by GitHub Pages)
- `npm run build`: Builds both frontend and backend (used by Docker)
- `npm run check`: TypeScript type checking

## 🔍 Monitoring

### Deployment Status

- Check the **Actions** tab to see deployment status
- Green checkmark = successful deployment
- Red X = deployment failed

### Verification

The workflow includes automatic verification:

1. **Health Check**: Tests if the deployed site is accessible
2. **Deployment Summary**: Shows deployment details in the Actions summary
3. **Notifications**: Optional Slack notifications for success/failure

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**: Check TypeScript errors in the Actions logs
2. **Deployment Fails**: Verify GitHub Pages is enabled in repository settings
3. **Site Not Loading**: Check if the build artifacts are in the correct location

### Debug Steps

1. Check the Actions logs for detailed error messages
2. Verify the `dist/public` directory contains the built files
3. Ensure all required secrets are configured
4. Check the GitHub Pages settings in repository settings

## 📝 Customization

### Adding Environment Variables

To add new environment variables:

1. Add them to the workflow file in the `Build Frontend` step
2. Set them in repository secrets if they contain sensitive data
3. Use the `VITE_` prefix for client-side variables

### Changing Deployment Branch

To deploy from a different branch:

1. Update the `branches: [dev]` line in the workflow trigger
2. Change the branch name to your desired branch

### Adding Notifications

To add more notification channels:

1. Add new notification steps in the `notify` job
2. Configure the required secrets
3. Update the notification logic as needed

## 🔗 Related Files

- `.github/workflows/github-pages.yml`: Main deployment workflow
- `vite.config.ts`: Vite configuration for building
- `package.json`: Build scripts and dependencies
- `client/`: React frontend source code

## 📞 Support

If you encounter issues with the GitHub Pages deployment:

1. Check the Actions logs for detailed error messages
2. Verify all configuration settings
3. Ensure the repository has the necessary permissions
4. Contact the development team for assistance

---

**Note**: This deployment is specifically for the frontend React application. The backend API requires a separate deployment process using Docker or a server environment.
