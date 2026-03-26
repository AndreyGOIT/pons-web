# Pons.fi – Enrollment & Administration Platform

## Overview

Pons.fi is a full-stack web application designed to manage user registrations and course enrollments for a local sports organization.

The system replaces manual workflows (email + spreadsheets) with a structured, role-based and maintainable digital solution.

The application is used in a real operational environment and was developed iteratively based on user feedback.

---

## Problem

Before this system, the organization handled enrollments manually:

- Registrations via email
- Manual validation and confirmations
- Spreadsheet-based tracking
- No structured role separation
- High risk of duplicate or inconsistent data

This led to:

- Administrative overhead
- Inefficient communication
- Lack of centralized data integrity
- Limited visibility into enrollment status

---

## Solution

I designed and implemented a full-stack web application that provides:

- Role-based access control (Admin / User)
- Structured relational database model
- RESTful backend API
- Responsive React frontend
- Centralized enrollment workflow
- Clear separation between business logic and UI

---

## Architecture

### Frontend

- React
- TypeScript
- Component-based architecture
- REST API communication
- Basic state management via hooks

### Backend

- Node.js
- Express
- RESTful API design
- Authentication and authorization logic
- Role-based access middleware
- Clear separation of routes, controllers and services

### Database

- PostgreSQL / MariaDB
- Normalized relational schema
- Foreign key constraints
- Structured entities (Users, Courses, Enrollments)

---

## Key Features

- User registration and authentication
- Role-based permissions
- Enrollment management
- Admin dashboard functionality
- Basic data validation (client + server side)
- Clean API structure for scalability

---

## Security & Design Considerations

- Password hashing
- Server-side validation
- Role-based route protection
- Separation of concerns
- Structured database design to ensure integrity

---

## Development Approach

- Iterative development
- Built for real users
- Refactoring based on feedback
- Git-based version control
- Focus on maintainable and readable code

---

## What I Learned

- Designing data models early prevents downstream complexity
- Authentication and access control must be considered from the start
- Real users expose edge cases quickly
- Maintainability is more important than short-term speed

---

## Future Improvements

- Automated testing (unit + integration)
- Dockerized deployment
- CI/CD pipeline
- Logging & monitoring improvements
- Performance optimization
- Improved error handling

---

## Tech Stack

Frontend:

- React
- TypeScript
- HTML
- CSS

Backend:

- Node.js
- Express

Database:

- SQL (PostgreSQL / MariaDB)

Version Control:

- Git

---

## Running the Project Locally

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure environment variables
4. Run backend: `npm run start`
5. Run frontend: `npm run dev`

---

## Documentation

Project documentation and näyttö strategy:
https://github.com/AndreyGOIT/pons-strategy

---

## Author

Andy Erokhin  
Junior Software Developer (Full Stack)  
LinkedIn: https://www.linkedin.com/in/andyerokhin/  
GitHub: https://github.com/AndreyGOIT
