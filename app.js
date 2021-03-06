//requires
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

//db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'fkifiknow',
    database: 'emp_tracker'
});

//connect
db.connect(err => {
    if (err) throw err;
    console.log('database connected');
    promptUser();
});

//prompt user
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
            "Update an employee's role",
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
            addEmployee();
        }
        if (answers.choice === "Update an employee's role") {
            updateRole();
        }
        if (answers.choice === 'Quit') {
            process.exit();
        }
    });
};

//view all departments
viewDepartments = () => {
    console.log('all departments:');
    const sql = `SELECT
                department.name AS department_name,
                department.id AS department_id
                FROM department
                `;
    //async
    db.promise().query(sql)
    .then( ([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

//view all roles
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
    //async
    db.promise().query(sql)
    .then( ([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

//view all employees
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
    //async
    db.promise().query(sql)
    .then( ([rows]) => {
        console.table(rows);
    })
    .then(promptUser);
};

//add a department
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Please enter a department:',
            validate: aDept => {
                if (aDept) {
                    return true;
                } else {
                    console.log('Please enter a department!');
                    return false;
                }
            }
        }
    ])
    .then(data => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        db.query(sql, data.department);
        viewDepartments();
    });
};

//add a role
addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Please enter a role:',
            validate: aRole => {
                if (aRole) {
                    return true;
                } else {
                    console.log('Please enter a role!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Please enter a salary:',
            validate: aSalary => {
                if (!isNaN(aSalary) && aSalary.trim() != '') {
                    return true;
                } else {
                    console.log('\nPlease enter a number!');
                    return false;
                }
            }
        }
    ])
    .then(data => {
        const parameters = [data.title, data.salary];
        const departmentSQL = `SELECT * FROM department`;
        db.query(departmentSQL, (err, row) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: 'list', 
                    name: 'departChoice',
                    message: 'Please choose a department:',
                    choices: row
                }
            ])
            .then(answer => {
                //find answer's department id
                let deptID;
                for (let i = 0; i < row.length; i++){
                    if (answer.departChoice == row[i].name){
                        deptID = row[i].id;
                    }
                }
                //push
                parameters.push(deptID);
                const sql = `INSERT INTO role
                            (title, salary, department_id)
                            VALUES (?, ?, ?)
                            `;
                db.query(sql, parameters);
            })
            .then(viewRoles);
        });
    });
};

//add an employee
addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first',
            message: 'Please enter a first name:',
            validate: aFirst => {
                if (aFirst) {
                    return true;
                } else {
                    console.log('Please enter a first name!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'last',
            message: 'Please enter a last name:',
            validate: aLast => {
                if (aLast) {
                    return true;
                } else {
                    console.log('Please enter a last name!');
                    return false;
                }
            }
        }
    ]).then(data => {
        const parameters = [data.first, data.last];
        const roleSQL = `SELECT * FROM role`;
        db.query(roleSQL, (err, row) => {
            if (err) throw err;
            //roles map
            const rolesMap = row.map(items => {
                const container = {};
                container.value = items.id;
                container.name = items.title;
                return container;
            });
            inquirer.prompt([
                {
                    type: 'list', 
                    name: 'roleChoice',
                    message: 'Please choose a role:',
                    choices: rolesMap
                }
            ])
            .then(answer => {
                const roleID = answer.roleChoice;
                parameters.push(roleID);
                const mgrSQL = `SELECT * FROM employee`;
                db.query(mgrSQL, (err, row) => {
                    if (err) throw err;
                    //manager map
                    const mgrMap = row.map(items => {
                        const container = {};
                        container.value = items.id;
                        container.name = items.first_name + ' ' + items.last_name;
                        return container;
                    });
                    inquirer.prompt([
                        {
                          type: 'list',
                          name: 'manager',
                          message: 'Please choose a manager:',
                          choices: mgrMap
                        }
                    ])
                    .then(final => {
                        const mgrID = final.manager;
                        parameters.push(mgrID);
                        const sql = `INSERT INTO employee
                                    (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)
                                    `;
                        db.query(sql, parameters);
                    })
                    .then(viewEmployees);
                });
            });
        });
    });
};

//update an employee's role
updateRole = () => {
    const empSQl = `SELECT * FROM employee`;
    db.query(empSQl, (err, row) => {
        if (err) throw err;
        //employee map
        const empMap = row.map(items => {
            const container = {};
            container.value = items.id;
            container.name = items.first_name + ' ' + items.last_name;
            return container;
        });
        inquirer.prompt([
            {
              type: 'list',
              name: 'empName',
              message: 'Please choose an employee to update:',
              choices: empMap
            }
        ])
        .then(answer => {
            const empID = answer.empName;
            const parameters = [empID];
            const roleSQL = `SELECT * FROM role`;
            db.query(roleSQL, (err, row) => {
                if (err) throw err;
                const mapRole = row.map(items => {
                    const container = {};
                    container.value = items.id;
                    container.name = items.title;
                    return container;
                });
                inquirer.prompt([
                    {
                      type: 'list',
                      name: 'nRole',
                      message: 'Please choose a new role:',
                      choices: mapRole
                    }
                ])
                .then(final => {
                    const nRole = final.nRole;
                    parameters.push(nRole);
                    //swap
                    const rID = parameters[1];
                    const eID = parameters[0];
                    const sqlOrder = [rID, eID];
                    const sql = `UPDATE employee
                                SET role_id = ?
                                WHERE id = ?
                                `;
                    db.query(sql, sqlOrder);
                })
                .then(viewEmployees);
            });
        });
    });
};
//choices: array values can be objects containing a name (to display in list), a value (to save in the answers hash).