var express = require('express');
var router = express.Router();
var pool = require('./pool.js')
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');


const multer = require("multer");

// Configure multer to store uploaded files in the "uploads" directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");  // Ensure the "uploads" folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Use a unique filename
  }
});

const upload = multer({ storage: storage });

router.get('/', function (req, res) {
  res.render('layout', {
    title: "Index Page",
    page: 'index'
  })
});


router.get('/service', function (req, res) {
  pool.query('SELECT * FROM service', (error, results) => {
    if (error)
      return res.status(500).send('Service page error');

    res.render('layout', {
      title: "Service",
      page: 'service',
      service: results
    })
  });
});


router.get('/service/:id', function (req, res) {//
  const id = req.params.id
  pool.query(`SELECT * FROM service where serviceid = ?`, [id], (error, results) => {
    if (error)
      return res.status(500).send('Service/id page error');

    const data = results[0]

    res.render('layout', {
      title: data.title,
      page: 'service_detail',
      data
    })

  });
});


router.get('/training', function (req, res) {
  pool.query('SELECT * FROM training', (error, results) => {
    if (error)
      return res.status(500).send('Training page error');
  

    res.render('layout', {
      title: "Training",
      page: 'training',
      training: results
    })
  });
});

// Route to fetch details of a specific training program by ID
router.get('/training/:id', function (req, res) {
  const id = req.params.id;

  pool.query(`SELECT * FROM training where trainingid = ?`, [id], (error, results) => {
    if (error)
      return res.status(500).send('Training/id page error');

    if (results.length === 0) {
      return res.status(404).send('Training Program Not Found');
    }

    const data = results[0];

    res.render('layout', {
      title: data.title,
      page: 'training_detail',
      training: data
    })
  });
});

router.get('/teams', (req, res) => {
  res.render('layout', {
    title: 'Our Teams',
    page: 'teams',
  })
})

router.get('/about', function (req, res) {
  pool.query('SELECT * FROM about', (error, results) => {
    if (error) {
      console.error('Error fetching About Us data:', error);
      return res.status(500).send('Server Error');
    }

    if (results.length === 0) {
      return res.status(404).send('About Us data not found');
    }

    const aboutData = results[0];

    res.render('layout', {
      title: "About us",
      page: 'about',
      aboutData
    })
  });
});

router.get('/join_us', (req, res) => {
  res.render('layout', {
    title: "Join us",
    page: 'joinus',
    req
  })
})

router.post("/submit-join-us", upload.single('resume'), (req, res) => {
  const { name, email, position, application_data } = req.body;
  const resumeFile = req.file;

  const id = uuidv4();

  if (!resumeFile)
    return res.redirect('/index/join_us/?message_text=Please upload file&message_type=danger')

  const resumeData = fs.readFileSync(resumeFile.path);

  const query = "INSERT INTO applications (application_id, full_name, email, position, resume, application_data) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(query, [id, name, email, position, resumeData, application_data], (err, result) => {
    if (err)
      return res.redirect('/index/join_us/?message_text=Something went wrong&message_type=danger')

    return res.redirect('/index/join_us/?message_text=We will contact you shortly&message_type=success')
  });
});

router.get('/view_resume/:id', (req, res) => {
  const { id } = req.params;

  const query = 'select resume from applications where id = ?';
  pool.query(query, [id], (error, results) => {
    if (error || results.length === 0)
      return res.status(404).json({ error: "Resume not found" });

    const resumeData = results[0].resume;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="resume_${id}.pdf"`);

    res.send(resumeData);
  })
})

router.get('/contact_us', (req, res) => {
  // return res.render('contactus', { req });
  res.render('layout', {
    title: "Contact us",
    page: 'contactus',
    req
  })
})

router.post('/submit-contact-form', (req, res) => {
  const { full_name, email_address, message } = req.body;

  const query = 'INSERT INTO contact_form (full_name, email_address, message) VALUES (?, ?, ?)';

  pool.query(query, [full_name, email_address, message], (error, results) => {
    if (error)
      return res.send('failed contact us')

    return res.redirect(`/index/contact_us/?message_text=Thank you, ${full_name}, for contacting us! We appreciate your message and will respond to your inquiry shortly.&message_type=success`)
  })
})

module.exports = router;