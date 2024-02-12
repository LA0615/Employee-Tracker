const mysql = require("mysql2");
require("dotenv").config();
const inquirer = require("inquirer");

// Connect to the database using the details from .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Define queryDB function
const queryDB = (sql, params = []) => {
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
    } else {
      console.table(results);
      startApp();
    }
  });
};

// Function to start the app with user input questions for the database
function startApp() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      // Handle user choice
      switch (answers.option) {
        case "View all departments":
          // Call a function to view all departments using the queryDB function
          queryDB("SELECT * FROM departments");
          break;
        case "Add a department":
          inquirer
            .prompt([
              {
                type: "input",
                name: "departmentName",
                message: "What is the name of the department?",
              },
            ])
            .then((data) => {
              queryDB("INSERT INTO departments (name) VALUES (?)", [
                data.departmentName,
              ]);
            });
          break;
        case "View all roles":
          queryDB("SELECT * FROM roles");
          break;
        case "Add a role":
          inquirer
            .prompt([
              {
                type: "input",
                name: "roleTitle",
                message: "What is the title of the role?",
              },
              {
                type: "input",
                name: "roleSalary",
                message: "What is the salary for this role?",
              },
              {
                type: "input",
                name: "roleDepartmentId",
                message: "What is the department ID for this role?",
              },
            ])
            .then((data) => {
              queryDB(
                "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)",
                [data.roleTitle, data.roleSalary, data.roleDepartmentId]
              );
            });
          break;
        case "View all employees":
          inquirer
            .prompt([
              {
                type: "list",
                name: "filterOption",
                message: "How would you like to filter employees?",
                choices: ["View all employees", "Filter by manager"],
              },
            ])
            .then((filterAnswers) => {
              switch (filterAnswers.filterOption) {
                case "View all employees": //allows user to select all employees to view
                  queryDB("SELECT * FROM employees");
                  break;
                case "Filter by manager": //allows user to filter by the manager ID for employee search
                  inquirer
                    .prompt([
                      {
                        type: "input",
                        name: "managerFilter",
                        message: "Enter the manager's ID:",
                      },
                    ])
                    .then((data) => {
                      queryDB("SELECT * FROM employees WHERE manager_id = ?", [
                        data.managerFilter,
                      ]);
                    });
                  break;
                case "Add an employee":
                  inquirer
                    .prompt([
                      {
                        type: "input",
                        name: "employeeFirstName",
                        message: "What is the employee's first name?",
                      },
                      {
                        type: "input",
                        name: "employeeLastName",
                        message: "What is the employee's last name?",
                      },
                      {
                        type: "input",
                        name: "employeeRole",
                        message: "What is the employee's role?",
                      },
                      {
                        type: "input",
                        name: "employeeManagerId",
                        message: "What is the employee's manager id?",
                      },
                    ])
                    .then((data) => {
                      //places the data into the employees table
                      queryDB(
                        "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                        [
                          data.employeeFirstName,
                          data.employeeLastName,
                          data.employeeRole,
                          data.employeeManagerId,
                        ]
                      );
                    });
                  break;
              }
            });
          break;
      }
    });
}

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
  // Call the startApp function to start the application
  startApp();
});
