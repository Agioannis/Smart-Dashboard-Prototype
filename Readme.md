# Smart Dashboard

Smart Dashboard is a modern and intuitive dashboard application designed to provide users with a centralized platform for managing and visualizing data efficiently. This project aims to simplify data monitoring and decision-making processes with a user-friendly interface and robust functionality.

## Features

- **Customizable Widgets**: Tailor the dashboard to your needs with drag-and-drop widgets.
- **Real-Time Data Updates**: Stay up-to-date with live data feeds.
- **Data Visualization**: Interactive charts, graphs, and tables for better insights.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Integration Support**: Connect with popular APIs and data sources.
- **AI Integration**: Leverage AI-powered insights and recommendations to make data-driven decisions.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/smart-dashboard.git
    ```
2. Navigate to the project directory:
    ```bash
    cd smart-dashboard
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the application:
    ```bash
    npm start
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Customize your dashboard by adding or removing widgets.
3. Connect your data sources and start visualizing your data.
4. Utilize AI features for predictive analytics and automated insights.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add feature"
    ```
4. Push to your branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, please contact [aggioannis@gmail.com](mailto:aggioannisl@gmail.com).

---
Thank you for using Smart Dashboard!

# Deployment

Client (GitHub Pages)
- Ensure `client/package.json` contains `"homepage": "."` (already present).
- Workflow `.github/workflows/deploy-client.yml` builds `client` and publishes `client/build` to the `gh-pages` branch on pushes to `main`.
- After a successful run, enable Pages in GitHub > Settings > Pages:
  - Source: `gh-pages` branch / root
  - Site URL: `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>`

Server (Render)
- Create a new Web Service in Render and connect the GitHub repo.
- Settings:
  - Root directory: `/server`
  - Build command: `npm install`
  - Start command: `node app.js` (or `npm start` if defined)
- Add environment variables (MONGODB_URI, API keys, NODE_ENV=production).
- Render will provide a public URL like `https://<your-service>.onrender.com`.

Client → Server
- Set `REACT_APP_API_URL=https://<your-service>.onrender.com` in your client environment (used at build time), commit, and push to trigger a new Pages deploy.

Quick PowerShell commands (from repo root)
- git add .github/workflows/deploy-client.yml README_DEPLOY.md
- git commit -m "ci: add gh-pages deploy workflow and deployment README"
- git push origin main

If you want, I can also:
- Append the variables import to `client/src/index.js` and the App.css overrides for dark mode now. Which should I do next?