
## About the Application

Wordystart is a simple application that uses the Gemini API from google to provide the user with a word of the day. 

The user subscribes through a form and receives an email with the word of the day, everyday at 6am SAST.

The application is built using Node and Express and the email is sent using the nodemailer package. User names and email addresses are stored in a MongoDB database. 

Boostrap is used for styling the forms and the navbar.


Overall a simple application that demonstrates the use of the Gemini API and nodemailer package. 

# Installation
```

To install the app, clone the repository and run the following command in the terminal. Ensure that you have node and npm installed on your machine. 


Command: "npm install"

```

## Usage

```
"npm start" will start the server on port 3000. You can access the application by going to "localhost:3000" in your browser. 
```

## API KEYS
```
You will need to get a Gemini API key and a MongoDB URI to use the application. The only API key I provide is the GOOGLE APP PASSWORD for sending emails. 
```


