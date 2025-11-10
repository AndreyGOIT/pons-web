# PONS Web

A modern website for the Finnish sports club **PONS**.

## 🔍 Overview

This web application provides:

- User registration with email confirmation
- Private dashboard with personal info, invoices, notifications
- Attendance tracking and course management
- Admin panel for content, order, and attendance management
- PDF invoice generation
- REST API (Node.js + Express)
- Frontend built with React and W3.CSS
- Live data fetching of courses with trainers

The project is now deployed in production at https://pons.fi and is actively used by the sports club.

## 📦 Tech Stack

- **Frontend**: React, Vite, W3.CSS
- **Backend**: Node.js, Express, MariaDB, TypeORM
- **Auth**: Email/password (JWT), role-based access
- **Attendance & Courses**: TypeORM entities, migrations, API endpoints
- **PDF**: pdfkit
- **Mail**: Nodemailer + SMTP (zone.fi)
- **Deployment**: zone.fi (pm2, Apache reverse proxy)

## 🚀 Project Goals

Built a scalable and modern website for PONS with a smooth user experience and admin capabilities. The site is live and actively serving the club.

## 📄 License

MIT

## 🌐 Live

[https://pons.fi](https://pons.fi)
