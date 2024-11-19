
# Authentication and Authorization Overview

The application utilizes NestJS to implement robust authentication and authorization mechanisms. Below is a detailed breakdown divided into three key components: IP and Token Guards, Roles and Decorators Guards, and the Login/Signup Process.

## 1. IP and Token Guards

### **IP Rate Limiting (`IpRateLimitGuard`)**

The `IpRateLimitGuard` is designed to control the number of requests a single IP address can make within a specified time window. This guard helps prevent abuse and ensures fair usage of the application resources. It leverages Redis to track the number of requests from each IP address. When a request is made, the guard increments a counter associated with the IP and checks if it exceeds the configured maximum allowed requests. If the limit is exceeded, the guard responds with a `Too Many Requests` error, effectively throttling the IP address.

### **Token Rate Limiting (`TokenRateLimitGuard`)**

The `TokenRateLimitGuard` manages the rate at which authenticated users can make requests based on their unique tokens and assigned roles. It ensures that users do not exceed their allocated usage limits, which vary depending on their role (e.g., `SUPER`, `ADMIN`, `BASIC`). This guard validates the format of the token, retrieves the associated user, and checks the token's usage against the predefined limits. For `SUPER` users, the guard allows unlimited access, while `ADMIN` and `BASIC` users have specific request quotas. Token usage is tracked and stored in MongoDB, and Redis is used to manage real-time rate limiting counters.

## 2. Roles and Decorators Guards

### **Role-Based Access Control (RBAC)**

The application employs Role-Based Access Control to restrict access to certain endpoints based on the user's role. Roles are defined as `SUPER`, `ADMIN`, and `BASIC`, each with varying levels of access and permissions.

### **RolesGuard**

The `RolesGuard` is responsible for enforcing RBAC by checking if the authenticated user's role matches the roles required to access a particular endpoint. It utilizes custom decorators to specify the necessary roles for each route. If a user attempts to access a route without the appropriate role, the guard denies access by throwing a `ForbiddenException`.

### **Custom Decorators**

- **@Roles:** This decorator is used to specify the roles required to access a particular route. For example, `@Roles(UserRole.ADMIN, UserRole.BASIC)` restricts access to users with `ADMIN` or `BASIC` roles.

- **@Public:** Marks endpoints that do not require authentication, allowing unrestricted access.

- **@CurrentUser:** Retrieves the authenticated user's information from the request, making it accessible within route handlers.

These decorators, combined with the `RolesGuard`, provide a flexible and declarative way to manage access control throughout the application.

## 3. Login/Signup Process

### **User Registration (Sign-Up)**

Users can register by providing their email and password through the `POST /auth/signup` endpoint. The registration process involves several steps:

1. **Input Validation:** The system validates the provided email and password to ensure they meet the required criteria, such as format and strength.
2. **Email Normalization:** The email address is converted to lowercase to maintain consistency and avoid duplication.
3. **Duplication Check:** The system checks if the email is already associated with an existing account to prevent duplicate registrations.
4. **Password Hashing:** The password is securely hashed using Argon2, a robust hashing algorithm, before being stored in the database.
5. **Email Verification:** A verification code is generated and sent to the user's email address to confirm ownership. The user must verify their email to activate the account.
6. **Token Generation:** A unique authentication token is generated for the user, which will be used for subsequent authenticated requests.
7. **Rate Limit Configuration:** Initial rate limits are set based on the user's role, ensuring that new users adhere to the application's usage policies.

### **User Login (Sign-In)**

Registered users can log in through the `POST /auth/login` endpoint by providing their email and password. The login process includes:

1. **Credential Verification:** The system retrieves the user by email and verifies the provided password against the stored hashed password.
2. **Token Validation:** Upon successful authentication, the user's token is validated to ensure it is active and has not expired.
3. **Rate Limit Enforcement:** The system checks the user's token usage against their rate limits to prevent overuse.
4. **Response Handling:** A sanitized user object, excluding sensitive information like the password, is returned along with relevant authentication details.

### **Password Reset and Email Verification**

Authenticated users can reset their passwords via the `PUT /auth/reset-password` endpoint by providing their current password and a new password. The system verifies the current password, hashes the new password, and updates it in the database. Additionally, users must verify their email addresses using the verification code sent during registration to activate their accounts fully.

### **Super User Initialization**

Upon application startup, the `SuperUserService` ensures that a super user exists with elevated privileges. This super user is created or updated based on environment configurations, granting them unlimited access and bypassing standard rate limits. This mechanism guarantees that there is always an administrator account with full control over the application.

---

This structured approach ensures that the application maintains high security standards, provides fair usage policies, and offers a seamless user experience through well-defined authentication and authorization processes.
