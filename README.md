# sugandhmaya.com E-commerce Platform

This repository contains the source code for **sugandhmaya.com**, the official e-commerce website for the Sugandhmaya brand. It's a full-stack application featuring a static frontend and a Node.js backend, designed to provide a seamless shopping experience for artisanal puja essentials.

## About The Project

Sugandhmaya is a complete e-commerce solution built to be elegant, fast, and secure. The platform allows users to browse products, add items to their cart, and complete their purchases through a secure, two-factor authentication process using an OTP sent to their email.

The backend manages products, orders, and email notifications, while the frontend provides a clean, responsive, and user-friendly interface.

### Key Features

* **Product Catalog**: Dynamically displays products from a MongoDB database.
* **Shopping Cart**: Fully persistent cart functionality using local storage.
* **Secure Checkout**: An OTP-based verification system ensures secure order placement.
* **Transactional Emails**: Integrates with Resend for sending OTPs and SendGrid for beautiful, detailed order confirmation emails.
* **RESTful API**: A Node.js and Express-based backend serves product data and handles orders.
* **Static Frontend**: Built with pure HTML, CSS, and vanilla JavaScript for speed and simplicity.

## Technologies Used

This project is built with a modern, lightweight stack:

* **Frontend**:
    * HTML5
    * CSS3 with Tailwind CSS for styling
    * Vanilla JavaScript for client-side logic

* **Backend**:
    * [Node.js](https://nodejs.org/)
    * [Express.js](https://expressjs.com/)
    * [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) for data modeling

* **Services**:
    * [Resend](https://resend.com/) for OTP emails
    * [SendGrid](https://sendgrid.com/) for order confirmation emails
    * [Vercel](https://vercel.com/) for deployment

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need to have the following software installed on your machine:
* [Node.js](https://nodejs.org/en/download/) (which includes npm)
* [MongoDB](https://www.mongodb.com/try/download/community)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/sugandhmaya.com.git](https://github.com/your-username/sugandhmaya.com.git)
    cd sugandhmaya.com
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file inside the `server/` directory and add the following variables with your credentials:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    RESEND_API_KEY=your_resend_api_key
    RESEND_FROM_EMAIL=your_verified_resend_from_email
    SENDGRID_API_KEY=your_sendgrid_api_key
    SENDGRID_FROM_EMAIL=your_verified_sendgrid_from_email
    COMPANY_EMAIL=your_email_for_receiving_order_notifications
    ```

### Running the Application

1.  **Start the server:**
    To run the server in development mode with automatic restarts, use:
    ```sh
    npm run dev
    ```
    To start the server for production, use:
    ```sh
    npm run start
    ```
    The server will be running on `http://localhost:5000` by default.

2.  **Seed the database (Optional):**
    To populate the database with initial product data from `seed.js`, run:
    ```sh
    npm run seed
    ```

## Project Structure

The project is organized into two main parts: the `client` and the `server`.
```sh
├── client/              # All frontend files
│   ├── images/          # Product images, logos, and assets
│   ├── _footer.html     # Reusable footer component
│   ├── _header.html     # Reusable header component
│   ├── checkout.html
│   ├── confirmation.html
│   ├── index.html
│   ├── product.html
│   ├── shop.html
│   ├── script.js        # Main JavaScript file for the frontend
│   └── style.css        # Main stylesheet
│
├── server/              # All backend files
│   ├── models/          # Mongoose schemas (Product, Order)
│   │   ├── order.js
│   │   └── product.js
│   ├── utils/           # Utility functions
│   │   └── sendEmail.js # Email sending logic
│   ├── .env             # Environment variables (needs to be created)
│   └── db.js            # MongoDB connection logic
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── seed.js              # Script to populate the database
└── server.js            # Main server entry point
```
## License

This is a proprietary and confidential project. Unauthorized copying of the files in this repository, via any medium, is strictly prohibited.
