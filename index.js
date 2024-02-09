const express = require('express');
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
require('dotenv').config();


const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

var cron = require('node-cron');

const app = express();


app.use("/static",express.static(__dirname+ "/public"));

const port = process.env.PORT || 3000;

// Middleware to log every request
app.use((req, res, next) => {
    const UTCDATE = new Date();
    UTCDATE.setHours(UTCDATE.getHours() +2)

    console.log(`[${UTCDATE.toUTCString()}] ${req.method} ${req.url}`);
    next();
});

//Middleware to understand url-encoded form data submitted
app.use(bodyParser.urlencoded({extended: false}));

//Connect to mongoDB database


mongoose.connect(process.env.DATABASE_URL2).then(
    (result)=>{
        console.log("Connected to MongoDB");
    }
).catch((error)=>{
    console.log("Error connecting to MongoDB : "+ error)
})

//Schema that will used for documents inside the the Email collection
let emailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
    }
});

//Creating a collection(if it doesnt already exist) that will use the schema defined above for the documents inside the collection 
let emailCollection = mongoose.model("Email",emailSchema);


const themes = [
    "inspiration",
    "motivation",
    "life",
    "happiness",
    "success",
    "love", 
    "wisdom",
    "friendship",
    "goals",
    "change",
    "resilience",
    "courage",
    "positivity",
    "perseverance",
    "growth",
    "determination",
    "empowerment",
    "belief",
    "optimism",
    "gratitude",
    "transformation",
    "faith",
    "self-discovery",
    "mindfulness",
    "ambition",
    "inner strength",
    "overcoming challenges",
    "encouragement",
    "reflection",
    "kindness",
    "serenity",
    "compassion",
    "harmony",
    "balance",
    "purpose",
    "enlightenment",
    "joyfulness",
    "generosity",
    "resilience", 
    "clarity",
    "altruism",
    "graciousness",
    "serendipity",
    "triumph",
    "synchronicity",
    "fortitude",
    "empathy",
    "belonging",
    "jubilation",
    "reverence"
  ];
  
  console.log("Total themes:", themes.length);
  

async function generateRandomQuote(){
    // Select a random theme
    const theme = themes[Math.floor(Math.random() * themes.length)];
    console.log("Theme : "+ theme)
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    // Include the theme in the prompt
    const prompt = `Generate a single random ${theme} quote. Only return the quote and no other words. The word ${theme} doesnt have to appear in the sentence.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("quote : " + text);
    return text;
}


async function sendEmail({ toEmail, subject, html, fromEmail, fromPass }) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: fromEmail,
        pass: fromPass,
      },
    });
  
    try {
     
      let info = await transporter.sendMail({
        from: `"WordyStart" <${fromEmail}>`,
        to: toEmail, 
        subject: subject, 
        html: html, 
      });
  
      console.log(`Message sent: ${info.messageId}`);
    } catch (error) {
      console.error(error);
      throw error; 
    }
  }


app.get("/", (req,res)=>{
    res.sendFile(__dirname+"/views/index.html");


})

app.get("/subscribe", (req,res)=>{
    res.sendFile(__dirname+"/views/Word.html");

});

app.post("/subscribe", (req,res)=>{

    console.log("name submitted : "+ req.body.name);
    console.log("email submitted : " + req.body.email);

    emailCollection.create({
        name: req.body.name,
        email: req.body.email
    }).then((result)=>{
        console.log(`Successfully created document of ${req.body.name}, it will be stored in the collection : ` + result.collection.name);
        res.sendFile(__dirname+"/views/subsuc.html");
    }).catch((err)=>{
        if(err.code===11000){
            console.log("Failed : "+ err)
            res.sendFile(__dirname+"/views/subfailExists.html");
        }else{
            console.log("Failed : "+ err)
            res.sendFile(__dirname+"/views/subfail.html");
        }
       
    })

    


});

app.get("/unsubscribe", (req,res)=>{

   

    res.sendFile(__dirname+"/views/Question.html")
})

app.post("/unsubscribe", (req,res)=>{

    console.log(req.body.email);

    emailCollection.findOneAndDelete({
        email: req.body.email
    }).then((result)=>{
        console.log(`Successfully deleted document of ${req.body.email} `);
        res.sendFile(__dirname+"/views/unsubsuc.html");
    }).catch((err)=>{
        // if(err.code===11000){
        //     console.log("Failed : "+ err)
        //     res.sendFile(__dirname+"/views/subfailExists.html");
        // }else{
        //     console.log("Failed : "+ err)
        //     res.sendFile(__dirname+"/views/subfail.html");
        // }

      
        console.log("Failed : "+ err)
        res.sendFile(__dirname+"/views/unsubfail.html");
        

       
    })



});

// cron.schedule("*/10 * * * * *", function() {
//     console.log("running a task every 10 second");
// });

// cron.schedule("0 */10 * * * *", async () => { //every 10 minutes
//     console.log("running a task every 10 minutes");
// });


//0 6 * * *





app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


module.exports=app;