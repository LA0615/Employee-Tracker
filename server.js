const mysql = require("mysql2");
require("dotenv").config();
const inquirer = require("inquirer");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

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

async function startApp() {
  while (true) {
    const answers = await inquirer.prompt([
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
    ]);

    switch (answers.option) {
      case "View all departments":
        await queryDB("SELECT * FROM departments");
        break;
      case "Add a department":
        const data = await inquirer.prompt([
          {
            type: "input",
            name: "departmentName",
            message: "What is the name of the department?",
          },
        ]);
        await queryDB("INSERT INTO departments (name) VALUES (?)", [data.departmentName]);
        break;
      case "Add a role":
        const departmentChoices = await queryDB("SELECT id, name FROM departments");
        const roleData = await inquirer.prompt([
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
        ]);
        await queryDB("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", [
          roleData.roleTitle,
          roleData.roleSalary,
          roleData.roleDepartment,
        ]);
        break;
      case "View all roles":
        await queryDB("SELECT * FROM roles");
        break;
      case "Add an employee":
        const roleChoices = await queryDB("SELECT id, title FROM roles");
        const managerChoices = await queryDB("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees");
        const employeeData = await inquirer.prompt([
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
        ]);
        const employeeSql = "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
        const employeeParams = [
          employeeData.employeeFirstName,
          employeeData.employeeLastName,
          employeeData.employeeRoleId,
          employeeData.employeeManagerId,
        ];
        await queryDB(employeeSql, employeeParams);
        break;
      case "View all employees":
        const filterAnswers = await inquirer.prompt([
          {
            type: "list",
            name: "filterOption",
            message: "How would you like to filter employees?",
            choices: ["View all employees", "Filter by manager"],
          },
        ]);

        switch (filterAnswers.filterOption) {
          case "View all employees":
            await queryDB("SELECT * FROM employees");
            break;
          case "Filter by manager":
            const managerChoices = await queryDB("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees");
            const managerData = await inquirer.prompt([
              {
                type: "list",
                name: "managerFilter",
                message: "Choose the manager:",
                choices: managerChoices.map((manager) => ({
                  name: manager.name,
                  value: manager.name,
                })),
              },
            ]);
            await queryDB("SELECT * FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?", [managerData.managerFilter]);
            break;
        }
        break;
      case "Update an employee role":
        const employeeChoices = await queryDB("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees");
        const updatedEmployeeData = await inquirer.prompt([
          {
            type: "list",
            name: "employeeToUpdate",
            message: "Choose an employee you want to update:",
            choices: employeeChoices.map((employee) => ({
              name: employee.name,
              value: employee.id,
            })),
          },
          {
            type: "input",
            name: "newRole",
            message: "What is the new role for this employee?",
          },
        ]);

        const roleID = (await queryDB("SELECT id FROM roles WHERE title = ?", [updatedEmployeeData.newRole]))[0].id;

        const updateSql = "UPDATE employees SET role_id = ? WHERE id = ?";
        const updateParams = [roleID, updatedEmployeeData.employeeToUpdate];

        await queryDB(updateSql, updateParams);
        console.log("Employee role updated successfully!");
        break;
      case "Exit":
        process.exit(0);
        break;
      default:
        console.log("Invalid option. Please try again.");
        break;
    }
  }
}

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
  startApp();
});
