# CampusFind – Campus Lost and Found Portal

## Project Description
CampusFind is a web-based Campus Lost and Found Portal developed to help students report, search, and recover lost belongings within the college campus.

Students can report lost or found items, search for items, submit claims, and track their reported items. Administrators can manage items, review claims, and update item statuses.

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6)
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API
- Postman

## Features

### Student Features
- Student registration and login
- Report lost and found items
- Upload item images
- Search and view lost and found items
- Submit claims for found items
- View personal dashboard
- Track reported items and claim status

### Admin Features
- Admin login
- View dashboard statistics
- Manage reported items
- Approve or reject claims
- Update item status
- Delete reported items

## Project Structure

```text
CampusFind/
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── models/
│   ├── claim.js
│   ├── item.js
│   └── user.js
└── public/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── lost.html
    ├── found.html
    ├── report.html
    ├── dashboard.html
    ├── admin.html
    ├── search.html
    ├── css/
    │   └── style.css
    └── js/
        ├── admin.js
        ├── dashboard.js
        ├── found.js
        ├── home.js
        ├── login.js
        ├── lost.js
        ├── register.js
        ├── report.js
        └── search.js
```

## Installation and Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and configure your own MongoDB connection string and JWT secret.

4. Start the server:

```bash
node server.js
```

5. Open the application in your browser:

```text
http://localhost:5000
```

## Future Enhancements
- Email notifications
- Improved search and filtering
- Additional dashboard features

## Project Information
**Project Name:** CampusFind – Campus Lost and Found Portal

**Course:** Web Technology and Internet Programming

**Academic Year:** 2026–2027

**School:** School of Computing and Data Science

**University:** Sai University
