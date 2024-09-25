
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>OAuth Authorization with Node.js, Express, and MySQL</h1>
    <p>This project implements an OAuth-based authorization system using Node.js and Express, with MySQL as the database for securely storing user information and tokens.</p>
    <h2>Key Features</h2>
    <ul>
        <li><strong>OAuth 2.0 Authentication:</strong> Implements OAuth 2.0 for secure, third-party user authentication.</li>
        <li><strong>Express Framework:</strong> Uses Express.js for server-side logic and routing.</li>
        <li><strong>MySQL Integration:</strong> Utilizes MySQL for persisting user data, tokens, and other relevant information.</li>
        <li><strong>Token Management:</strong> Manages access and refresh tokens efficiently within the database.</li>
    </ul>
    <h2>Tech in use</h2>
    <ul>
        <li>Node js/Express js</li>
        <li>Nodemailer</li>
        <li>Mysql2</li>
        <li>Express-validator</li>
    </ul>
    <h2>Installation and Setup</h2>
    <ol>
        <li>Clone the repository:
            <pre><code>git clone https://github.com/Deyhen/Horizon_Project_Server.git 
cd project-directory</code></pre>
        </li>
        <li>Install dependencies:
            <pre><code>npm install</code></pre>
        </li>
        <li>Set up the MySQL database:
            <ul>
                <li>Create a MySQL database with nessesary tables and columns.</li>
                <li>Configure Google and Gmail settings.</li>
                <li>Configure the details in the <code>.env</code> file:
                    <pre><code>DB_HOST=&lt;your_db_host&gt;
<br>PORT=&lt;your_back_port&gt;
<br>BACKEND_URL=&lt;your_back_url&gt;
<br>FRONTEND_URL=&lt;your_front_url&gt;
<br>MYSQL_HOST=&lt;your_db_host&gt;
<br>MYSQL_PORT=&lt;your_db_port&gt;
<br>MYSQL_LOGIN=&lt;your_db_login&gt;
<br>MYSQL_PASSWORD=&lt;your_db_password&gt;
<br>MYSQL_DB_NAME=&lt;your_db_name&gt;
<br>SMTP_USER=&lt;your_smtp_user&gt;
<br>SMTP_PASSWORD=&lt;your_smtp_password&gt;
<br>JWT_SECRET_ACCESS=&lt;your_jwt_key_access&gt;
<br>JWT_SECRET_REFRESH=&lt;your_jwt_key_refresh&gt;
</code></pre>
                </li>
            </ul>
        </li>
        <li>Start the development server:
            <pre><code>npm run dev</code></pre>
        </li>
    </ol>
    <h2>Contributions</h2>
    <p>Feel free to open issues or submit pull requests for any improvements!</p>
</body>
</html>
