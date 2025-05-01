Task Tracker App
Table of Contents
1. Frontend Setup
2. Backend Setup
3. Environment Variables
4. Running the App
5. License
Frontend Setup
1. Install dependencies:
```bash
npm install
```
2. Run the development server:
```bash
npm run dev
```
This will start the frontend application at [http://localhost:5173](http://localhost:5173).
Backend Setup
1. Install dependencies:
```bash
npm install
```
2. Run the backend server:
```bash
node server.js
```
This will start the backend server on [http://localhost:5000](http://localhost:5000).
Environment Variables
In the backend, you need to create a .env file in the root directory to store sensitive information and configuration settings. The .env file should contain the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-tracker  # Update with your local MongoDB URI
JWT_SECRET=your_jwt_secret_key_here
```
- **PORT**: The port on which your backend server will run (default is `5000`).
- **MONGO_URI**: The connection URI for your MongoDB database (use `mongodb://localhost:27017/task-tracker` if you're using a local MongoDB instance).
- **JWT_SECRET**: A secret key for signing JWT tokens (replace with a secure random string).
Running the App
1. **Start the backend server**:
- Make sure MongoDB is running on your local machine.
- Run the backend server using the command:
```bash
node server.js
```
2. **Start the frontend**:
- Run the frontend application using the command:
```bash
npm run dev
```
Once both the backend and frontend are running, you can access the app in your browser at [http://localhost:5173](http://localhost:5173).
License
This project is licensed under the MIT License - see the LICENSE file for details.
