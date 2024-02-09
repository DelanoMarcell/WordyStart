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
let inspirationSchema = new mongoose.Schema({
    theme: {
        type: String,
        required: true
    },
    quote : {
        type: String,
        required: true,
    },
    question:{
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

//Creating a collection(if it doesnt already exist) that will use the schema defined above for the documents inside the collection 
let inspiration = mongoose.model("inspiration",inspirationSchema);

//get todays date

async function getDate(){
const todaysDate = new Date();

const year = todaysDate.getFullYear();
const month = String(todaysDate.getMonth()+1)
const day = String(todaysDate.getDate())

const newDate = `${year}-${month}-${day}`;

// console.log(newDate);
return newDate;
}




   
  

async function generateContent(){
    
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    // Include the theme in the prompt
    const prompt1 = `Generate a single random theme of the day. This theme will be used to generate an inspirational quote and a question relating to the theme. ONLY RETURN THE WORD. `;
    
    const result1 = await model.generateContent(prompt1);
    const response1 = await result1.response;
    const theme = response1.text();

    const prompt2 = `Generate a inspirational quote relating to the word ${theme}. Only return the quote. The word ${theme} doesnt have to appear in the quote. But the quote should relate to the ${theme} `;
    const result2 = await model.generateContent(prompt2);
    const response2 = await result2.response;
    const quote = response2.text();


    const prompt3 = `Generate an inspirational question relating to the word ${theme}. Only return the question. The word ${theme} doesnt have to appear in the question. But the question should relate to the ${theme} `;
    const result3 = await model.generateContent(prompt3);
    const response3 = await result3.response;
    const question = response3.text();

    const date = await getDate();
    console.log("date : "+ date.toString())

    inspiration.countDocuments({ date: date }).then(count => {
        if (count > 0) {
            console.log("Document exists for the provided date.");
        } else {
            console.log("No document found for the provided date.");
           //Created document for date
            let insp = inspiration.create({
        theme: theme,
        quote: quote,
        question: question,
        date: date
    }).then(succ=>{
        console.log("Document added!")
    }).catch(err=>{
        console.log("Error adding document" + err)
    })
        }
    }).catch(err => {
        console.error("Error:", err); // Handle the error appropriately
    });

    

    


   

   // console.log({text1, text2, text3})
    //return {theme, quote, question};

    
}


generateContent();



app.get("/", (req,res)=>{

   
   



    res.sendFile(__dirname+"/views/index.html");


})

app.get("/word", (req,res)=>{
    generateContent();
    res.sendFile(__dirname+"/views/Word.html");
});




app.get("/results", async (req,res)=>{

    const date = await getDate(); 

    
    inspiration.findOne({date: date}).then(succ=>{
        console.log("found from result api "+ succ.quote )
        res.send({
            quote: succ.quote,
            theme : succ.theme,
            question: succ.question
        })
    }).catch(err=>{
        console.log(err)
        res.send({
            quote: "error",
            theme : "error",
            question: "error"
        })
    })


    


});

app.get("/question", (req,res)=>{

   generateContent();

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