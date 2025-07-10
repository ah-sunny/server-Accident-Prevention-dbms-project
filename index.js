const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
// const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

const PORT = process.env.DB_PORT || 4000;

// const DB = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'AccidentDB'

// });

const DB = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});




// Connect to MySQL
DB.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL Database");
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
////////////////////////////////////
// Hardcoded route order (control your route here)
const routeOrder = [
    'Savar',
    'RadioColony',
    'DairyGateJU',
    'PrantikJU',
    'Bismail',
    'Nabinagor',
    'Niribili',
    'Gono-U-Turn',
    'NITER',
];
// ✅ Convert danger percentage to danger level
function getDangerLevel(percentage) {
    if (percentage >= 75) return 'High';
    if (percentage >= 40) return 'Medium';
    return 'Low';
}
// Add status based on level
function getStatus(level) {
    if (level === 'High') return 'Danger! Drive Carefully.';
    if (level === 'Medium') return 'Caution advised.';
    return 'This place is safe.';
}


// 🚀 Route to return per-location summary
// API route
app.get('/high-risk-areaRoute', (req, res) => {
    const query = `
    SELECT location,
    accidentID,
     COUNT(*) AS totalAccidents,
      SUM(deathNumber) AS totalDeaths
    FROM accidentDetails
    GROUP BY location
  `;

    DB.query(query, (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        // console.log("query result: ",results);
        const locationMap = {};
        results.forEach(row => {
            const totalAccidents = Number(row.totalAccidents) || 0;
            const totalDeaths = Number(row.totalDeaths) || 0;

            //Percentage Calculation
            const percentage = (totalAccidents / totalDeaths) * 100;

            // console.log("Danger Percentage:", percentage.toFixed(2) + "%");

            const level = getDangerLevel(percentage);
            locationMap[row.location] = {
                location: row.location,
                accidentID: row.accidentID,
                dangerPercentage: Math.round(percentage),
                dangerLevel: level,
                status: getStatus(level)
            };
        });

        //  console.log("locationMap : ", locationMap)

        // Final response with all places included
        const finalData = routeOrder.map(location => {
            return locationMap[location] || {
                location,
                accidentID: 0,
                dangerPercentage: 0,
                dangerLevel: 'Low',
                status: getStatus('Low')
            };
        });

        res.json(finalData);
    });
});




// API Route to Get All acc-details
// app.get("/get_dangerZone", (req, res) => {
//     const sql = "SELECT * FROM dangerousPlace";

//     DB.query(sql, (err, results) => {
//         if (err) {
//             console.error("Error fetching data:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }
//         return res.status(200).json(results);
//     });
// });

//accident details api


app.get("/allAccident", (req, res) => {
    const sql = "SELECT * FROM accidentDetails";

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
            return res.status(404).json({ message: `No accident records found for location: ${location}`  });
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
        (location, date, image, time, deathNumber, vehicleTypes, repairCost, damageParts, description, username, userID, useremail,status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
        req.body.useremail,
        req.body.status
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

        return res.status(200).json(results[0]);  // Return the list of records for that email
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
    // console.log(values);
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

//delete request accident Data
app.delete("/delete_requestAccidentData", (req, res) => {
    const requestAccidentID = req.query.requestAccidentID;
    // console.log(userID);

    // Validate input parameters
    if (!requestAccidentID) {
        return res.status(400).json({ message: "requestAccidentID are required" });
    }

    const sql = "DELETE FROM accidentRequests WHERE requestAccidentID = ?";

    DB.query(sql, [requestAccidentID], (err, result) => {
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



//update req user accident details
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

app.put("/update_request_accident", (req, res) => {
  const {
    requestAccidentID, // must be sent in body to identify which row to update
    damageParts,
    date,
    deathNumber,
    description,
    image,
    location,
    repairCost,
    time,
    useremail,
    username,
    vehicleTypes
  } = req.body;

  if (!requestAccidentID) {
    return res.status(400).json({ message: "requestAccidentID is required for updating." });
  }

  const sql = `
    UPDATE accidentRequests SET 
      damageParts = ?, 
      date = ?, 
      deathNumber = ?, 
      description = ?, 
      image = ?, 
      location = ?, 
      repairCost = ?, 
      time = ?, 
      useremail = ?, 
      username = ?, 
      vehicleTypes = ?
    WHERE requestAccidentID = ?
  `;

  const values = [
    damageParts,
    date,
    deathNumber,
    description,
    image,
    location,
    repairCost,
    time,
    useremail,
    username,
    vehicleTypes,
    requestAccidentID
  ];

  DB.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating record:", err);
      return res.status(500).json({ message: "Database update error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found with the given requestAccidentID" });
    }

    return res.status(200).json({ message: "Accident request updated successfully" });
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











