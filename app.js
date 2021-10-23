const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'fkifiknow',
    database: 'emp_tracker'
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    promptUser();
});

const promptUser = () => {
    inquirer.prompt ([
        {
        type: 'list',
        name: 'choice', 
        message: 'What would you like to do?',
        choices: [
            'View all departments', 
            'View all roles', 
            'View all employees', 
            'Add a department', 
            'Add a role', 
            'Add an employee', 
            'Update an employee role'
            ]
        }
    ])
    .then((answers) => {
        if (answers.choice === 'View all departments') {
            viewDepartments();
        }
        if (answers.choice === 'View all roles') {
            viewRoles();
        }
        if (answers.choice === 'View all employees') {
            viewEmployees();
        }
    })
};

viewDepartments = () => {
    console.log('all departments:');
    const sql = `SELECT department.name AS department_name,
                department.id AS department_id
                FROM department`;
    
    db.promise().query(sql)
    .then( ([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

viewRoles = () => {
    console.log('all roles:');
    const sql = `SELECT
                role.id AS role_id,
                role.title AS job_title,
                role.salary,
                department.name AS department_name
                FROM role
                LEFT JOIN department
                ON role.department_id = department.id`;
    
    db.promise().query(sql)
    .then( ([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

viewEmployees = () => {
    console.log('all employees:');
    const sql = `SELECT emp.id AS emp_id,
                emp.first_name,
                emp.last_name,
                role.title,
                department.name AS department_name,
                role.salary,
                CONCAT (mgr.first_name, ' ', mgr.last_name) AS manager_name
                FROM employee emp
                LEFT JOIN role ON emp.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee mgr ON emp.manager_id = mgr.id
                `;
    
    db.promise().query(sql)
    .then( ([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};