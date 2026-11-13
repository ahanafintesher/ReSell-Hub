🛍️ ReSell Hub -- Second-Hand Marketplace Platform
=================================================

ReSell Hub is a full-stack second-hand marketplace platform where users can buy and sell pre-owned products through a secure, user-friendly, and responsive web application.

The platform connects buyers and sellers, making it easier to discover affordable products, manage listings, and complete secure online transactions. It promotes sustainable consumption by giving pre-owned products a second life.

🚀 Project Overview
-------------------

ReSell Hub provides a complete marketplace experience with three different user roles:

-   **Buyer:** Browse products, manage wishlists, place orders, and complete payments.

-   **Seller:** Create and manage product listings, handle orders, and monitor sales.

-   **Admin:** Manage users, products, orders, and platform activities.

The application follows a separate frontend and backend architecture.


---

## 📸 Screenshots

<img width="1859" height="883" alt="image" src="https://github.com/user-attachments/assets/d0027584-5b2c-496f-85d2-1c1898e2c26e" />

---



🔗 Project Links
----------------

-   **Frontend Repository:** [ReSell Hub](https://github.com/ahanafintesher/ReSell-Hub)

-   **Backend Repository:** [ReSell Hub Server](https://github.com/ahanafintesher/ReSell-Hub-Server)

-   **Live Website:** Not published yet.

✨ Key Features
--------------

### 🔐 Authentication & Authorization

-   Email and password authentication.

-   Google authentication.

-   Secure logout functionality.

-   Better Auth integration.

-   JWT-based API authentication.

-   Role-based access control (Buyer, Seller, Admin).

-   Protected routes and APIs.

### 🛒 Marketplace

-   Browse all available products.

-   View detailed product information.

-   Search products by name and category.

-   Sort products by price (Low to High / High to Low).

-   Product pagination.

-   Explore products by category.

-   Responsive product listing interface.

### 👤 Buyer Dashboard

-   Personalized dashboard overview.

-   Browse and manage product wishlists.

-   Place and manage orders.

-   Track order status.

-   View payment history.

-   Manage personal profile information.

### 🏪 Seller Dashboard

-   Seller dashboard with business statistics.

-   Add new product listings.

-   Update and delete existing products.

-   Manage product inventory.

-   View and manage incoming orders.

-   Accept or reject orders.

-   Update delivery status.

-   Sales analytics and performance charts.

### 🛡️ Admin Dashboard

-   Platform overview and analytics.

-   Manage buyers and sellers.

-   Block and unblock users.

-   Manage product listings.

-   Approve and reject products.

-   Monitor reported products.

-   Manage orders and transactions.

-   Track platform activities.

### 💳 Payment Integration

-   Stripe payment gateway integration.

-   Secure checkout process.

-   Payment validation.

-   Payment success page.

-   Transaction ID generation.

-   Payment history management.

-   Payment status tracking.

### 🎨 Additional Features

-   Responsive design for mobile, tablet, and desktop.

-   Modern UI with HeroUI and Tailwind CSS.

-   Smooth animations using Motion.

-   Interactive charts and analytics using Recharts.

-   Loading states and skeleton UI.

-   Custom error and 404 pages.

-   Product reviews and ratings.

🛠️ Technology Stack
--------------------

### Frontend

| Technology | Purpose |
| Next.js 16 | React Framework |
| React 19 | UI Development |
| JavaScript (ES6+) | Programming Language |
| Tailwind CSS 4 | Styling |
| HeroUI 3 | UI Components |
| Better Auth | Authentication |
| MongoDB Driver | Database Integration |
| Motion | Animations |
| Recharts | Data Visualization |
| Stripe | Payment Integration |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
| Node.js | Runtime Environment |
| Express.js 5 | Backend Framework |
| MongoDB | Database |
| MongoDB Native Driver | Database Operations |
| jose-cjs | JWT Verification |
| Stripe SDK | Payment Processing |
| CORS | Cross-Origin Resource Sharing |
| dotenv | Environment Configuration |



## 📦 Dependencies

### Frontend Dependencies

- `next` – React Framework
- `react` – UI Development
- `react-dom` – DOM Rendering
- `@heroui/react` – UI Components
- `@heroui/styles` – UI Styling
- `better-auth` – Authentication
- `@better-auth/mongo-adapter` – MongoDB Authentication Adapter
- `mongodb` – Database Integration
- `motion` – Animations
- `tailwindcss` – CSS Framework
- `@tailwindcss/postcss` – Tailwind CSS Integration
- `stripe` – Payment Integration
- `recharts` – Data Visualization
- `lucide-react` – Icons
- `react-icons` – Icon Library
- `react-hot-toast` – Toast Notifications
- `react-simple-star-rating` – Star Ratings
- `three` – 3D Graphics

**Development Dependencies:**
- `eslint`
- `eslint-config-next`
- `babel-plugin-react-compiler`
- `@gravity-ui/icons`

### Backend Dependencies

- `express` – Backend Framework
- `mongodb` – Database Integration
- `jose-cjs` – JWT Verification
- `stripe` – Payment Processing
- `cors` – Cross-Origin Resource Sharing
- `dotenv` – Environment Variables

### 🛠️ Development Tools

- `Node.js` – JavaScript Runtime
- `npm` – Package Manager
- `Git & GitHub` – Version Control
- `MongoDB` – NoSQL Database
- `Stripe` – Payment Gateway

### Development Tools

-   `Node.js` -- JavaScript Runtime

-   `npm` -- Package Manager

-   `Git & GitHub` -- Version Control

-   `MongoDB` -- NoSQL Database

-   `Stripe` -- Payment Gateway


📦 Installation & Setup
-----------------------

### Prerequisites

Make sure you have installed:

-   Node.js (v20 or later recommended)

-   npm

-   MongoDB

-   Git

### 1\. Clone the Frontend Repository

```
git clone https://github.com/ahanafintesher/ReSell-Hub.git

cd ReSell-Hub
```

### 2\. Install Frontend Dependencies

```
npm install
```

### 3\. Configure Frontend Environment Variables

Create a `.env.local` file in the frontend root directory.

```
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string
AUTH_DB_NAME=your_auth_database_name

RESELL_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_RESELL_SERVER_URL=http://localhost:5000
```

### 4\. Start the Frontend Development Server

```
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

### 5\. Clone the Backend Repository

Open another terminal:

```
git clone https://github.com/ahanafintesher/ReSell-Hub-Server.git

cd ReSell-Hub-Server
```

### 6\. Install Backend Dependencies

```
npm install
```

### 7\. Configure Backend Environment Variables

Create a `.env` file in the backend root directory.

```
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

ALLOWED_ORIGINS=http://localhost:3000

JWKS_URL=your_better_auth_jwks_url
JWT_ISSUER=your_jwt_issuer
JWT_AUDIENCE=your_jwt_audience

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 8\. Start the Backend Server

```
npm run dev
```

Backend will run at:

```
http://localhost:5000
```

📁 Project Architecture
-----------------------

The project is divided into two independent repositories:

```
ReSell-Hub/
│
├── Frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
└── Backend/
    ├── routes/
    ├── middleware/
    ├── scripts/
    ├── test/
    ├── index.js
    └── package.json
```

*Note: This is a simplified architectural overview.*

🔒 Security
-----------

-   Sensitive credentials are stored in environment variables.

-   JWT verification is used for protected backend APIs.

-   Role-based authorization controls access to protected resources.

-   Stripe handles payment processing.

-   CORS is configured for frontend-backend communication.

-   Private routes require authentication.

Never commit `.env` or `.env.local` files to GitHub.

🧪 Testing
----------

Run backend tests:

```
npm test
```

Run frontend linting:

```
npm run lint
```

🎯 Project Goals
----------------

-   Build a practical full-stack marketplace application.

-   Implement secure authentication and authorization.

-   Develop role-based dashboards.

-   Integrate real-world payment processing.

-   Practice REST API development and database management.

-   Build responsive and reusable UI components.


## 🧩 Challenges Faced During Development

While developing ReSell Hub, I faced several technical and practical challenges:

- **Authentication & Authorization:** Implementing secure authentication with Better Auth and managing role-based access for Buyers, Sellers, and Admins.
- **Frontend-Backend Integration:** Connecting the Next.js frontend with the Express.js backend and ensuring smooth API communication.
- **Database Management:** Designing and managing MongoDB collections for users, products, orders, reviews, and payments.
- **Payment Integration:** Integrating Stripe and handling checkout sessions, payment verification, and transaction status.
- **Dashboard Development:** Building separate dashboards with role-specific functionality and analytics.
- **Responsive Design:** Ensuring a consistent user experience across mobile, tablet, and desktop devices.
- **State & Data Management:** Managing dynamic data, loading states, error handling, and API responses.

## 🛠️ Why I Chose These Technologies

| Technology | Why I Used It |
|---|---|
| **Next.js** | For server-side rendering, routing, and building a scalable React application. |
| **React.js** | To create reusable components and interactive user interfaces. |
| **Tailwind CSS** | To build responsive layouts quickly with utility-first styling. |
| **HeroUI** | To create modern and reusable UI components. |
| **Node.js** | To run JavaScript on the server side. |
| **Express.js** | To build RESTful APIs and handle backend operations. |
| **MongoDB** | To store flexible marketplace data using a NoSQL database. |
| **Better Auth** | To implement authentication and manage user sessions. |
| **JWT** | To verify authenticated requests to protected backend APIs. |
| **Stripe** | To provide secure online payment processing. |
| **Motion** | To add smooth animations and improve user experience. |
| **Recharts** | To visualize sales, orders, and marketplace analytics. |
| **Lucide React** | To use consistent and lightweight icons throughout the application. |

## 💡 Challenges Solved During Development

During development, I implemented solutions to several important problems:

- **Role-Based Access Control:** Implemented separate permissions and protected routes for Buyers, Sellers, and Admins.
- **Secure API Communication:** Integrated JWT verification to protect private backend endpoints.
- **Authentication Integration:** Connected Better Auth with the backend authentication flow.
- **Product Management:** Implemented product creation, updating, deletion, searching, sorting, and pagination.
- **Order Management:** Developed order processing and status management functionality for buyers and sellers.
- **Payment Processing:** Integrated Stripe checkout and implemented payment verification and transaction tracking.
- **Dashboard Analytics:** Used Recharts to display marketplace statistics and business performance.
- **Frontend-Backend Communication:** Connected independent frontend and backend applications through REST APIs.
- **Error Handling:** Implemented appropriate loading states, error messages, and user feedback for different operations.
- **Responsive UI:** Optimized layouts and components for different screen sizes.



## 🔮 Future Improvements

> 🚧 **Coming Soon!** ReSell Hub is currently under development and will be live very soon.

The following features are planned for upcoming updates:

- Real-time buyer-seller communication.
- Real-time notifications.
- Advanced product recommendations.
- Improved marketplace analytics.
- Enhanced product discovery and filtering.

**Stay tuned for the upcoming launch of ReSell Hub!**


👨‍💻 Developer
---------------

**Ahanaf Intesher**

Full-Stack MERN Stack Developer

-   **GitHub:** [ahanafintesher](https://github.com/ahanafintesher)

-   **LinkedIn:** [Ahanaf Intesher](https://www.linkedin.com/in/ahanafintesher/)

-   **Portfolio:** [Visit Portfolio](https://portfolio-eight-black-76g2a6w3zj.vercel.app/)

* * * * *

⭐ If you find this project interesting, feel free to explore the repositories and give them a star!

**Built with passion by Ahanaf Intesher.**
