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
app.get("/get_req_accidentsID", (req, res) => {
    const requestAccidentID = req.query.requestAccidentID;
    if (!requestAccidentID) {
        return res.status(400).json({ message: "requestAccidentID is required" });
    }

    // Use parameterized query to avoid SQL injection
    const sql = "SELECT * FROM accidentRequests WHERE requestAccidentID = ?";
    DB.query(sql, [requestAccidentID], (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        // If no records found, return a message
        if (results.length === 0) {
            return res.status(404).json({ message: "No accident details found for this requestAccidentID" });
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







//admin api routes

app.get("/get_alluser", (req, res) => {
    const sql = "SELECT * FROM userInfo";

    DB.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(results);
    });
});
app.delete("/delete_user", (req, res) => {
    const userID = req.query.userID;
    // console.log(userID);

    // Validate input parameters
    if (!userID) {
        return res.status(400).json({ message: "userID are required" });
    }

    const sql = "DELETE FROM userInfo WHERE userID = ?";

    DB.query(sql, [userID], (err, result) => {
        if (err) {
            console.error("Error deleting data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No matching user found to delete" });
        }

        return res.status(200).json({ success: "user deleted successfully" });
    });
});
//update
app.put("/update_user/:userID", (req, res) => {
    const sql = `UPDATE userInfo SET role = ?, status = ? WHERE userID = ?`;
    const values = [req.body.role, req.body.status, req.params.userID]; // Include userID as part of the values
console.log(values);
    DB.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating user:", err);
            return res.status(500).json({ message: "Error inside server", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ success: "User updated successfully", updatedId: req.params.userID });
    });
});


//req Accident
app.get("/get_allReqAccident", (req, res) => {
    const sql = "SELECT * FROM accidentRequests";

    DB.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(results);
    });
});

app.post("/addReq_To_mainAccidentDetails", (req, res) => {
    const sql = `
        INSERT INTO accidentDetails 
        (location, date, image, time, deathNumber, vehicleTypes, repairCost, damageParts, description,requestAccidentID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

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
        req.body.requestAccidentID || null,
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

//update status
app.put("/update_reqStatus/:requestAccidentID", (req, res) => {
    const sql = `UPDATE accidentRequests SET status = ? WHERE requestAccidentID = ?`;
    const values = [req.body.status, req.params.requestAccidentID]; // Include userID as part of the values
console.log(values);
    DB.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating status:", err);
            return res.status(500).json({ message: "Error inside server", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "data not found" });
        }
        return res.status(200).json({ success: "status updated successfully", updatedId: req.params.requestAccidentID });
    });
});

app.get("/get_data", (req, res) => {
    const sql = "SELECT * FROM accidentDetails";

    DB.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(results);
    });
});

app.delete("/delete_dangerData", (req, res) => {
    const accidentID = req.query.accidentID;
    // console.log(userID);

    // Validate input parameters
    if (!accidentID) {
        return res.status(400).json({ message: "accidentID are required" });
    }

    const sql = "DELETE FROM accidentDetails WHERE accidentID = ?";

    DB.query(sql, [accidentID], (err, result) => {
        if (err) {
            console.error("Error deleting data:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No matching user found to delete" });
        }

        return res.status(200).json({ success: "danger data deleted successfully" });
    });
});
app.post("/add_mainAccidentDetails", (req, res) => {
    const sql = `
        INSERT INTO accidentDetails 
        (location, date, image, time, deathNumber, vehicleTypes, repairCost, damageParts, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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