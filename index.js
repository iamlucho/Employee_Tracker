//Add external dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");

// create the MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3300,
  user: "root",
  password: "root",
  database: "employees_db",
});

// connect to the MySQL server
connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  // start the application after the connection is established
  start();
});

// start the application
function start() {
  // use inquirer to prompt the user for the desired action
  inquirer
    .prompt({
      name: "action",
      type: "list",
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
    })
    .then((answer) => {
      // based on the user's choice, call the corresponding function
      switch (answer.action) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Exit":
          connection.end();
          break;
        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
}
// function to view all departments
function viewAllDepartments() {
  // write a MySQL query to retrieve all departments
  const query = "SELECT * FROM department";

  // execute the query and print the results to the console using console.table
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    // restart the application
    start();
  });
}
// function to view all roles
function viewAllRoles() {
  // write a MySQL query to retrieve all roles
  const query = `
      SELECT role.id, role.title, department.name AS department, role.salary
      FROM role
      LEFT JOIN department ON role.department_id = department.id
    `;

  // execute the query and print the results to the console using console.table
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    // restart the application
    start();
  });
}
// function to view all employees
function viewAllEmployees() {
  // write a MySQL query to join the employee, role, and department tables and select all employee data
  const query =
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    // restart the application
    start();
  });
}
// function to add a department
function addDepartment() {
  // use inquirer to prompt the user for the new department name
  inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "Enter the name of the new department:",
    })
    .then((answer) => {
      // write a MySQL query to insert the new department into the department table
      const query = "INSERT INTO department SET ?";
      connection.query(query, { name: answer.name }, (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} department inserted!\n`);
        // restart the application
        start();
      });
    });
}

// function to add a role
function addRole() {
  // use inquirer to prompt the user for the new role information
  inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "Enter the title of the new role:",
      },
      {
        name: "salary",
        type: "input",
        message: "Enter the salary for the new role:",
      },
      {
        name: "department",
        type: "input",
        message: "Enter the department ID for the new role:",
      },
    ])
    .then((answer) => {
      // write a MySQL query to insert the new role into the role table
      const query = "INSERT INTO role SET ?";
      connection.query(
        query,
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.department,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`${res.affectedRows} role inserted!\n`);
          // restart the application
          start();
        }
      );
    });
}

// function to add an employee
function addEmployee() {
  // use inquirer to prompt the user for the new employee information
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter the new employee's first name:",
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter the new employee's last name:",
      },
      {
        name: "role",
        type: "input",
        message: "Enter the new employee's role ID:",
      },
      {
        name: "manager",
        type: "input",
        message:
          "Enter the new employee's manager ID (or leave blank if none):",
      },
    ])
    .then((answer) => {
      // write a MySQL query to insert the new employee into the employee table
      const query = "INSERT INTO employee SET ?";
      connection.query(
        query,
        {
          first_name: answer.firstName,
          last_name: answer.lastName,
          role_id: answer.role,
          manager_id: answer.manager || null,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`${res.affectedRows} employee inserted!\n`);
          // restart the application
          start();
        }
      );
    });
}
// function to update an employee's role
function updateEmployeeRole() {
  // first, query the database to get a list of all employees
  const employeeQuery =
    'SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee_name FROM employee';
  connection.query(employeeQuery, (err, employees) => {
    if (err) throw err;
    // format the list of employees for the Inquirer prompt
    const employeeChoices = employees.map((employee) => ({
      name: employee.employee_name,
      value: employee.id,
    }));
    // next, query the database to get a list of all roles
    const roleQuery = "SELECT id, title FROM role";
    connection.query(roleQuery, (err, roles) => {
      if (err) throw err;
      // format the list of roles for the Inquirer prompt
      const roleChoices = roles.map((role) => ({
        name: role.title,
        value: role.id,
      }));

      // prompt the user to select an employee and a new role
      inquirer
        .prompt([
          {
            type: "list",
            name: "employeeId",
            message: "Select an employee to update that employee's role:",
            choices: employeeChoices,
          },
          {
            type: "list",
            name: "roleId",
            message: "Select the employee new role:",
            choices: roleChoices,
          },
        ])
        .then((answers) => {
          // update the employee's role in the database
          const updateQuery = "UPDATE employee SET role_id = ? WHERE id = ?";
          connection.query(
            updateQuery,
            [answers.roleId, answers.employeeId],
            (err) => {
              if (err) throw err;
              console.log("Employee role updated successfully!");
              // restart the application
              start();
            }
          );
        });
    });
  });
}
