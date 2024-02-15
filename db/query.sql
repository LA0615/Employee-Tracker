 SELECT * from  departments;

 SELECT * from  roles;

 SELECT * from employees;
SELECT employees.*, roles.title AS role_title, departments.name AS department_name
FROM employees
JOIN roles ON employees.role_id = roles.id
JOIN departments ON roles.department_id = departments.id;

-- Add a new department
INSERT INTO departments (name) VALUES (?);

-- Add a new role
INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?);

-- Add a new employee
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);

-- Update an employee's role
UPDATE employees SET role_id = ? WHERE id = ?;

-- Delete a department Extra Credit
--DELETE FROM departments WHERE id = ?;

-- Delete an employee role  Extra Credit 
--DELETE FROM roles WHERE id = ?;