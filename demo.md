Demo script for the University Maintenance Reporting App

1. Start backend

```bash
cd c:\Users\Jasen MJ\Desktop\WEB PRACTICAL\school-activity-api
npm install
npm start
```

2. Start frontend

```bash
cd client
npm install
npm run dev
```

3. Walkthrough steps

- Open http://localhost:5173 in browser.
- Register a new student account and login.
- Create a report (attach an image) and submit.
- Log out and login as admin: admin@uot.ac.zm / admin123
- From admin dashboard, mark the report as `Resolved` then delete it.
- Forgot password: on login page click "Forgot password", enter your email. If SMTP is not configured the reset link will appear in the backend console.

4. Screenshots to collect

- Registration page after success
- Report creation page showing uploaded image
- Admin deleting a resolved report

5. Notes

- If the frontend or backend ports conflict, stop other servers or adjust ports via environment variables.
- For Android testing, deploy the frontend to a public URL or use `npx cap` to create an Android build (see README).
