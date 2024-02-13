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
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        reject(err);
      } else {
        console.table(results);
        resolve(results);
      }
    });
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

        case "Add a role":
          // Fetch the list of departments from the database
          queryDB("SELECT id, name FROM departments")
            .then((departmentChoices) => {
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
                    type: "list",
                    name: "roleDepartment",
                    message: "Please choose a department for this role:",
                    choices: departmentChoices.map((department) => ({
                      name: department.name,
                      value: department.id,
                    })),
                  },
                ])
                .then((data) => {
                  queryDB(
                    "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)",
                    [data.roleTitle, data.roleSalary, data.roleDepartment]
                  );
                });
            })
            .catch((error) => {
              console.error("Error during role creation:", error);
            });
break;
        case "View all roles":
          queryDB("SELECT * FROM roles");
          break;

        case "Add an employee":
          // Fetch the list of roles from the database
          queryDB("SELECT id, title FROM roles").then((roleChoices) => {
            // Fetch the list of managers from the database
            queryDB(
              "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees"
            ).then((managerChoices) => {
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
                    type: "list",
                    name: "employeeRoleId",
                    message: "Choose the employee's role:",
                    choices: roleChoices.map((role) => ({
                      name: role.title,
                      value: role.id,
                    })),
                  },
                  {
                    type: "list",
                    name: "employeeManagerId",
                    message: "Please choose the employee's manager:",
                    choices: managerChoices.map((manager) => ({
                      name: manager.name,
                      value: manager.id,
                    })),
                  },
                ])
                .then((data) => {
                  const sql =
                    "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                  const params = [
                    data.employeeFirstName,
                    data.employeeLastName,
                    data.employeeRoleId,
                    data.employeeManagerId,
                  ];

                  queryDB(sql, params);
                })
                .catch((error) => {
                  console.error("Error during employee creation:", error);
                });
            });
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
                case "View all employees":
                  queryDB("SELECT * FROM employees");
                  break;
                case "Filter by manager":
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
              }
            });
          break;
      }
    });
}

// Connect to the database and start the application
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
  // Call the startApp function to start the application
  startApp();
});
