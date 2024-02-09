# Wordystart Application

## Overview
Wordystart is a simple application that leverages the **Gemini API** from Google to provide users with a daily word. Subscribers receive an email with the word of the day every day at 6am SAST.

The application is built using **Node** and **Express**, and emails are sent using the **nodemailer** package. User names and email addresses are stored in a **MongoDB** database. The forms and the navbar are styled using **Bootstrap**.

Overall, Wordystart is a straightforward application that demonstrates the use of the Gemini API and the nodemailer package.

## Installation
To install the app, ensure that you have Node and npm installed on your machine. Then, clone the repository and run the following command in the terminal:

```bash
npm install
```

## Usage
To start the server on port 3000, use the following command:
```bash
npm start
```

## API Keys
To use the application, you will need to obtain a Gemini API key and a MongoDB URI. The only API key provided is the GOOGLE APP PASSWORD for sending emails.
