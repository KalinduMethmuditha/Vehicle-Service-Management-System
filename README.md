# Vehicle Service Management System

A modern full-stack web application for managing vehicle service center operations. The system streamlines customer management, vehicle records, service bookings, mechanic assignments, spare parts inventory, job tracking, invoicing, and dashboard analytics.

Built using Laravel and Inertia.js with React, the application follows modern software engineering practices including clean architecture, role-based authorization, input validation, and responsive UI design.

---

## Features

### Authentication & Authorization
- Secure user authentication
- Role-Based Access Control (RBAC)
- Admin, Service Advisor, and Mechanic roles
- Protected routes and permissions using Spatie Laravel Permission

### Customer Management
- Create, update, delete, and search customers
- Customer profile management
- Contact information and notes

### Vehicle Management
- Vehicle registration
- Customer-vehicle relationship
- Vehicle history
- Mileage tracking

### Mechanic Management
- Manage mechanics
- Specialization management
- Employee information

### Service Booking
- Appointment scheduling
- Mechanic assignment
- Booking conflict prevention
- Job status tracking

### Job Cards
- Service progress tracking
- Parts allocation
- Status updates
- Service history

### Parts Inventory
- Inventory management
- Stock monitoring
- Low stock alerts
- Automatic stock deduction

### Billing & Invoicing
- Invoice generation
- Labor and parts calculation
- Payment tracking
- Invoice history

### Dashboard
- Today's bookings
- Active jobs
- Revenue summary
- Inventory alerts
- Business overview

### AI Feature
- AI-powered service recommendations / summaries / search (depending on implementation)

---

## Technology Stack

### Backend
- Laravel 13
- PHP 8+
- Eloquent ORM

### Frontend
- React
- Inertia.js
- Tailwind CSS

### Database
- MySQL / PostgreSQL

### Authentication & Authorization
- Laravel Authentication
- Spatie Laravel Permission

### Version Control
- Git
- GitHub

---

## Project Structure

```
app/
 ├── Http/
 ├── Models/
 ├── Services/
 ├── Policies/
 ├── Requests/

database/
 ├── migrations/
 ├── seeders/
 ├── factories/

resources/
 ├── js/
 ├── css/

routes/

public/
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/vehicle-service-management-system.git
```

### Navigate

```bash
cd vehicle-service-management-system
```

### Install Dependencies

```bash
composer install

npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Update database configuration.

Generate application key

```bash
php artisan key:generate
```

### Run Migrations

```bash
php artisan migrate --seed
```

### Start Development Server

```bash
php artisan serve

npm run dev
```

---

## Core Modules

- Authentication
- User Management
- Customer Management
- Vehicle Management
- Mechanic Management
- Service Booking
- Job Cards
- Inventory Management
- Billing & Invoicing
- Dashboard
- AI Assistance

---

## Software Engineering Practices

- MVC Architecture
- Service Layer
- Form Request Validation
- Policies & Authorization
- Eloquent Relationships
- Database Transactions
- Pagination
- Search & Filtering
- Responsive Design
- Clean Code Principles

---

## Future Improvements

- Email Notifications
- Calendar Scheduling
- PDF Invoice Export
- Excel Reports
- Docker Deployment
- Unit & Feature Testing
- SMS Notifications
- Advanced Analytics
- Mobile Application


