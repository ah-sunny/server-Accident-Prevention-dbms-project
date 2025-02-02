const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');


const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const DB = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'AccidentDB'

});


// Connect to MySQL
DB.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

// // API Route to Add User
// app.post("/add_user", (req, res) => {
//     const sql =
//         "INSERT INTO userInfo ( `name`, `email`, `password`, `role` , `status` ) VALUES (?, ?, ?, ?,?)";
//     const values = [req.body.name, req.body.email, req.body.password, req.body.role, req.body.status];
//     console.log(values);
//     // Execute query
//     DB.query(sql, values, (err, result) => {
//         if (err) {
//             console.error("Error inserting data:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }
//         return res.status(201).json({
//             success: "Student added successfully",
//             insertedId: result.insertId, // Return inserted ID
//         });
//     });
// });

app.post("/add_user", (req, res) => {
    const { name, email, password, role, status } = req.body;

    // Check if the user already exists
    const checkUserSql = "SELECT * FROM userInfo WHERE email = ?";
    DB.query(checkUserSql, [email], (err, results) => {
        if (err) {
            console.error("Error checking user:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length > 0) {
            // User already exists
            return res.status(400).json({ message: "User already exists" });
        }

        // Insert new user since email is not found
        const insertUserSql =
            "INSERT INTO userInfo (`name`, `email`, `password`, `role`, `status`) VALUES (?, ?, ?, ?, ?)";
        const values = [name, email, password, role, status];

        DB.query(insertUserSql, values, (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            return res.status(201).json({
                success: "User added successfully",
                insertedId: result.insertId, // Return inserted ID
            });
        });
    });
});


app.get("/get_user", (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const sql = "SELECT * FROM userInfo WHERE email = ?";
    const values = [email];

    // Execute query
    DB.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error retrieving data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            success: "User retrieved successfully",
            user: result[0],  // Send the user data as response
        });
    });
});

// user code


// API Route to Get All acc-details
app.get("/get_dangerZone", (req, res) => {
    const sql = "SELECT * FROM dangerousPlace";

    DB.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(results);
    });
});

//get accident details by location
app.get("/locationBasedAccidentDetails", (req, res) => {
    const location = req.query.location;
    if (!location) {
        return res.status(400).json({ message: "Location is required" });
    }

    // Use parameterized query to avoid SQL injection
    const sql = "SELECT * FROM accidentDetails WHERE location = ?";
    DB.query(sql, [location], (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        // If no records found, return a message
        if (results.length === 0) {
            return res.status(404).json({ message: "No accident details found for this location" });
        }

        return res.status(200).json(results);  // Return the list of records for that location
    });
});


//get accident details by accidentID
app.get("/accidentDetailsByAccidentID", (req, res) => {
    const accidentID = req.query.accidentID;
    // console.log(accidentID);
    if (!accidentID) {
        return res.status(400).json({ message: "accidentID is required" });
    }

    // Use parameterized query to avoid SQL injection
    const sql = "SELECT * FROM accidentDetails WHERE accidentID = ?";
    DB.query(sql, [accidentID], (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        // If no records found, return a message
        if (results.length === 0) {
            return res.status(404).json({ message: "No accident details found for this accidentID" });
        }

        return res.status(200).json(results);
    });
});

//accident request
app.post("/add_request_accident", (req, res) => {
    const sql = `
        INSERT INTO accidentRequests 
        (location, date, image, time, deathNumber, vehicleTypes, repairCost, damageParts, description, username, userID, useremail) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        req.body.location,
        req.body.date,
        req.body.image,
        req.body.time,
        req.body.deathNumber || 0,  // Default to 0 if not provided
        req.body.vehicleTypes,
        req.body.repairCost || 0,   // Default to 0 if not provided
        req.body.damageParts || null, // Default to NULL if not provided
        req.body.description || null, // Default to NULL if not provided
        req.body.username,
        req.body.userID,
        req.body.useremail
    ];

    console.log("Received Data:", values);

    DB.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(201).json({
            success: "Accident record added successfully",
            insertedId: result.insertId // Return inserted ID
        });
    });
});


app.get("/get_req_accidents", (req, res) => {
    const sql = "SELECT * FROM accidentRequests";

    DB.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching accident data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(results);
    });
});

app.get("/get_req_accidents", (req, res) => {
    const useremail = req.query.useremail;
    if (!useremail) {
        return res.status(400).json({ message: "User email is required" });
    }

    // Use parameterized query to avoid SQL injection
    const sql = "SELECT * FROM accidentRequests WHERE useremail = ?";
    DB.query(sql, [useremail], (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        // If no records found, return a message
        if (results.length === 0) {
            return res.status(404).json({ message: "No accident details found for this user email" });
        }

        return res.status(200).json(results);  // Return the list of records for that email
    });
});


app.delete("/deleteAccidentReq", (req, res) => {
    const requestAccidentID = req.query.requestAccidentID;
    console.log(requestAccidentID);

    // Validate input parameters
    if (!requestAccidentID) {
        return res.status(400).json({ message: "User email and requestAccidentID are required" });
    }

    const sql = "DELETE FROM accidentRequests WHERE requestAccidentID = ?";

    DB.query(sql, [requestAccidentID], (err, result) => {
        if (err) {
            console.error("Error deleting data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No matching accident record found to delete" });
        }

        return res.status(200).json({ success: "Accident record deleted successfully" });
    });
});




// DB.query('SELECT * FROM dangerousPlace', (err, result) => {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log(result);
//     }
// });





















// 
app.get('/', (req, res) => {
    res.send('Accident Detection System sever is running');
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});