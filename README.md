# 🚀 Ilias Ultimate

[![NodeJS with Webpack](https://github.com/robert-kratz/ilias-uni-mannheim-wrapper/actions/workflows/webpack.yml/badge.svg)](https://github.com/robert-kratz/ilias-uni-mannheim-wrapper/actions/workflows/webpack.yml)
[![ESLint](https://github.com/robert-kratz/ilias-uni-mannheim-wrapper/actions/workflows/eslint.yml/badge.svg)](https://github.com/robert-kratz/ilias-uni-mannheim-wrapper/actions/workflows/eslint.yml)

By [Robert Julian Kratz](https://rjks.us).

## Disclaimer

🚨 **This program is not affiliated with the University of Mannheim or its IT department. The developer is a student at the University of Mannheim who independently created this application.** 🚨

## Table of Contents

- [Description](#description)
- [Bugs and Issues](#bugs-and-issues)
- [Run locally](#run-locally)
- [Author and Contributors](#author-and-contributors)

- [Database Schema](/docs/database-schema.md)

## Description

This is a wrapper for the University of Mannheim's Ilias learning platform. The goal of the application is to make it easier and faster for students to organize files from their courses.

- **Functionality**:

  - The app acts as a wrapper, simplifying access to course files.
  - Through authentication in the app, files can be retrieved, organized, and stored.
  - This reduces the number of links and steps between the user and the desired file.

- **Storage of login credentials (optional)**:
  - The university ID and password can be securely stored in the device's operating system storage:
    - macOS: Keychain
    - Windows: (Windows storage solution)
    - Linux: (Linux storage solution)
  - This allows users to skip manual password entry. The credentials remain stored on the user's device.

## Requirements

- **Node.js**: The application is built with Node.js and requires it to run.
- **Ilias Account**: The application requires a valid Ilias account to access the learning platform.
- **Chrome**: The application uses the Chromium browser to display the Ilias platform.

## Bugs and Issues

This project is still in development. If you encounter any bugs or issues, please report them in the [Issues](https://github.com/robert-kratz/ilias-uni-mannheim-wrapper/issues) section of this repository.

Please provide as much information as possible, including the steps to reproduce the issue, your operating system, and the version of the application you are using.

## Run locally

Fir you want to run the application locally, you can clone the repository and run the following commands:

### Run the application

```bash
git clone https://github.com/robert-kratz/ilias-uni-mannheim-wrapper.git
```

You can then navigate to the project directory and run the following commands:

```bash
cd ilias-uni-mannheim-wrapper
```

Install the dependencies and start the application:

```bash
npm install
```

```bash
npm run start
```

### Build the application

To build the application, run the following command:

```bash
npm run package
```

Now you can choose the platform you want to build the application for.

```bash
npm run package make:mac # MacOS
npm run package make:win # Windows
npm run package make:linux # Linux
```

## Author and Contributors:

- **Author**: [Robert Julian Kratz](mailto:robert.kratz@rjks.us)
