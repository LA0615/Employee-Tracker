INSERT INTO departments (name)
VALUES ('Sales'),
    ('IT'),
    ('Finance'),
    ('Marketing'),
    ('HR');
    

INSERT INTO roles (title, salary, department_id)
VALUES ('Sales Representative', 60000, 1),
    ('Programmer', 80000, 2),
    ('Accountant', 65000, 3),
    ('Marketing Specialist', 70000, 4),
    ('HR Manager', 85000, 5);
    

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('Jane', 'Doe', 1, NULL),
    ('John', 'Smith', 3, 1),
    ('Sunny', 'Star', 2, 3),
    ('Mike', 'Jones', 4, 2),
    ('Bob', 'Smith', 5, 4);3
    