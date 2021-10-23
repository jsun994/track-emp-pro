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
    console.log('database connected.');
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
            'Update an employee role',
            'Quit'
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
        if (answers.choice === 'Add a department') {
            addDepartment();
        }
        if (answers.choice === 'Add a role') {
            addRole();
        }
        if (answers.choice === 'Add an employee') {
            AddEmp();
        }
        if (answers.choice === 'Update an employee role') {
            UpEmpRole();
        }
        if (answers.choice === 'Quit') {
            process.exit();
        }
    });
};

viewDepartments = () => {
    console.log('all departments:');
    const sql = `SELECT
                department.name AS department_name,
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
                role.title AS job_title,
                role.id AS role_id,
                role.salary,
                department.name AS department_name
                FROM role
                LEFT JOIN department
                ON role.department_id = department.id
                `;
    
    db.promise().query(sql)
    .then( ([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

viewEmployees = () => {
    console.log('all employees:');
    const sql = `SELECT
                emp.id AS emp_id,
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

addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Please enter a department:'
        }
    ]).then(data => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        db.query(sql, data.department);
        viewDepartments();
    });
};

addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Please enter a role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Please enter a salary:'
        },
        {
            type: 'input',
            name: 'dep_id',
            message: 'Please enter a department id:'
        }
    ]).then(data => {
        const parameters = [data.title, data.salary, data.dep_id];
        const sql = `INSERT INTO role
                    (title, salary, department_id)
                    VALUES (?, ?, ?)`;
        db.query(sql, parameters);
        viewRoles();
    });
};

AddEmp = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first',
            message: 'Please enter a first name:'
        },
        {
            type: 'input',
            name: 'last',
            message: 'Please enter a last name:'
        },
        {
            type: 'input',
            name: 'role',
            message: 'Please enter a role id:'
        },
        {
            type: 'input',
            name: 'manager',
            message: 'Please enter a manager id:'
        }
    ]).then(data => {
        const parameters = [data.first, data.last, data.role, data.manager];
        const sql = `INSERT INTO employee
                    (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;
        db.query(sql, parameters);
        viewEmployees();
    });
};

UpEmpRole = () => {

}