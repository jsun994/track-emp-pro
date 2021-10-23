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
    const sql = `SELECT * FROM department`;
    
    db.promise().query(sql)
    .then(([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

viewRoles = () => {
    console.log('all roles:');
    const sql = `SELECT * FROM role`;
    
    db.promise().query(sql)
    .then(([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

viewEmployees = () => {
    console.log('all employees:');
    const sql = `SELECT * FROM employee`;
    
    db.promise().query(sql)
    .then(([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};