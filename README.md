# A1C Project - Nx Monorepo with NestJS API and NextJS Web

This project demonstrates a modern full-stack application architecture using Nx for monorepo management, NestJS for the backend API, and NextJS for the frontend web application.

## Project Structure

```
a1c-project/
├── api/                  # NestJS API backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/     # Authentication module
│   │   │   └── users/    # Users module
│   │   └── main.ts       # API entry point
├── web/                  # NextJS frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/      # API client functions
│   │   │   ├── components/
│   │   │   ├── context/  # React context providers
│   │   │   └── page.tsx  # Main page
├── shared/               # Shared libraries
│   ├── api-interfaces/   # Shared API interfaces
│   ├── auth/             # Authentication utilities
│   └── environments/     # Environment configuration
└── .env                  # Environment variables
```

## Features

- **Monorepo Architecture**: Efficiently manage multiple applications and shared libraries in a single repository
- **Type Safety**: Full TypeScript support across frontend and backend with shared interfaces
- **Authentication**: JWT-based authentication with protected routes
- **API Communication**: Structured API client with shared interfaces
- **Environment Configuration**: Centralized environment management
- **Component Library**: Reusable React components

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/a1c-project.git
cd a1c-project

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Development

```bash
# Start the API development server
npx nx serve api

# Start the web development server (in a separate terminal)
npx nx dev web

# Or run both simultaneously
npx nx run-many --target=serve --projects=api --target=dev --projects=web --parallel=2
```

### Building for Production

```bash
# Build the API
npx nx build api

# Build the web application
npx nx build web

# Build both applications
npx nx run-many --target=build --projects=api,web --parallel=2
```

### Testing

```bash
# Run API tests
npx nx test api

# Run web tests
npx nx test web

# Run all tests
npx nx run-many --target=test --all
```

## Authentication

The application includes a complete authentication system:

### Backend (NestJS)
- JWT-based authentication with Passport.js
- Protected routes using Guards
- User service (currently using mock data)

### Frontend (NextJS)
- Authentication context for state management
- Login form component
- Protected routes with automatic redirection
- User profile display

### Test Users

For development and testing purposes, the API includes two default users:

1. **Admin User**
   - Email: admin@example.com
   - Password: admin123
   - Role: admin

2. **Regular User**
   - Email: user@example.com
   - Password: user123
   - Role: user

## Environment Variables

The application uses the following environment variables:

```
# API Configuration
PORT=3333
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:4200
API_URL=http://localhost:3333/api
```

## Technologies Used

- [Nx](https://nx.dev/) - Monorepo management and build system
- [NestJS](https://nestjs.com/) - Progressive Node.js framework for building server-side applications
- [NextJS](https://nextjs.org/) - React framework for production-grade applications
- [Passport](https://www.passportjs.org/) - Authentication middleware for Node.js
- [JWT](https://jwt.io/) - JSON Web Tokens for secure authentication
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- User registration functionality
- Role-based access control
- Additional API endpoints
- Enhanced frontend components
- Comprehensive test coverage

## License

MIT
