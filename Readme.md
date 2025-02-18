# *Dhan-Rashi :*    
# **💸 Fake Money Transfer System**  


---


 <a href="http://localhost:8500/user/sign-up"><h3>Localhost</h3></a>
A secure **fake money transfer** web application built using **Node.js, Express, and EJS**. This project simulates transactions between users while ensuring security through authentication, encryption, and email notifications.  

---
<br>


## 🚀 **Features**  

✅ User Authentication (**JWT**-based)  

✅ Secure Fake Transactions Between Users  

✅ Email Notifications (via **Nodemailer**)  

✅ Encrypted Data Storage (**Crypto** module)  

✅ File Upload Support (**Multer**)  

✅ MongoDB Database Integration (**Mongoose**)  

✅ **Dynamic UI with EJS**  

---

<br>

## 🛠️ **Tech Stack**  

- **Backend**: Node.js, Express  

- **Frontend**: EJS (Embedded JavaScript)  

- **Database**: MongoDB, Mongoose  

- **Security**: JSON Web Token (JWT), Crypto module  

- **Email Service**: Nodemailer  

- **File Handling**: Multer  

- **Other**: Custom modules for additional functionalities  

---


<br>

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Priyanshuomer/Dhan-Rashi.git
   cd Dhan-Rashi
   ```
2. Install the required packages and dependencies:
   ```bash
    npm install
   ```
3. Run the application:
    ```bash
    node index.js
    ```


### 3️⃣ Set Up Environment Variables

<p>  Create a `.env` file in the root directory and add the following : </p>

```env
PORT=8500
JWT_SECRET_KET=<key>
EMAIL_PASS=<pass>
DB_URL=<URL>
```

<br>
----- 


<br>

🛡️ **Security Measures**
-------------------------

*   **JWT Authentication** for secure user sessions
*   **Crypto module** for password and transaction pin hashing
*   **Email verification** for transactions

----------------



<br>


📧 **Email Notifications**
--------------------------

*   Users receive an <b>real-time</b> **email confirmation** upon login and successful transfers.
*   **Nodemailer** is used to send emails securely.
