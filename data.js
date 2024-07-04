const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');
const nodemailer = require('nodemailer');
//setting up express app

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all domains
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to handle URL-encoded data

// Route to handle POST request
app.post('/send-email', async (req, res) => {
  const { name, email, comment } = req.body;

  // Create a transporter for Nodemailer
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
  user: 'email',
  pass: 'app password'
}
  });

  // Setting up email data
  let mailOptions = {
      from: 'source email',
      to: 'dest email', // Destination email
      subject: 'Bellissa Events || New Comment Submitted',
      html: `<p>Comment: ${comment}<br>Regards,<br>${name}<br>${email}</p>`
};

  // Sending the email
  try {
      await transporter.sendMail(mailOptions);
      res.send('Comment sent via email successfully!');
  } catch (error) {
      console.error('Failed to send email:', error);
      res.status(500).send('Failed to send comment as email');
  }
});

// Connection URI
const uri = 'mongodb://localhost:27017';

// Database Name
const dbName = 'login_page';
let usersCollection;
let contactsCollection;




// // Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
     usersCollection = db.collection('users');
     contactsCollection = db.collection('contactus');

       // Route to fetch contact information
    app.get('/admin/contacts', (req, res) => {
      // Fetch all contact documents from the collection
      contactsCollection.find({}).toArray()
        .then(contacts => {
          res.json(contacts); // Send the contacts as JSON response
        })
        .catch(error => {
          console.error('Error fetching contacts:', error);
          res.status(500).send('Error fetching contacts');
        });
    });

    // Route to serve admin.html page
    app.get('/admin', (req, res) => {
      res.sendFile(path.join(__dirname, 'admin.html'));
    });
        

app.post('/contact', (req, res) => {
  const { firstName, lastName, phoneNumber, email, address, date, eventType, serviceType, city, message } = req.body;

  // Insert the new contact
  contactsCollection.insertOne({ firstName, lastName, phoneNumber, email, address, date, eventType, serviceType, city, message })
    .then(result => {
      console.log('New contact added successfully');
  
      res.redirect('/home.html'); 
    })
    .catch(error => {
      console.error('Error inserting new contact:', error);
      res.status(500).send('Submission failed. Please try again later.');
    });
});
})
.catch(error => {
console.error('Error connecting to MongoDB:', error);
});

//     // Route for form submission
    app.post('/submit', (req, res) => {
      const { username, email, password } = req.body;

      // Insert the new user
      usersCollection.insertOne({ username, email, password })
        .then(result => {
          console.log('New user added successfully');
          res.redirect('/login.html'); // Redirect to the login pages
        })
        .catch(error => {
          console.error('Error inserting new user:', error);
          res.status(500).send('Registration failed. Please try again later.');
        });
    });

 
//   // Route for login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@gmail.com' && password === '123') {
    console.log('Admin login successful');
    res.redirect('/admin.html'); // Redirect to the admin page
    return;
  }


  // Check if the user exists in the database
  usersCollection.findOne({ email, password })
    .then(user => {
      if (user) {
        console.log('Login successful');
        res.redirect('/home.html'); // Redirect to the home page
      } else {
        console.log('Invalid email or password');
        res.status(401).send('Invalid email or password');
      }
    })
    .catch(error => {
      console.error('Error finding user:', error);
      res.status(500).send('Login failed. Please try again later.');
    });
});





app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});








