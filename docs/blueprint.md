# **App Name**: ReliefLink

## Core Features:

- User Authentication: Enables user sign-up and login using email/password, Google, and phone authentication, leveraging Firebase Authentication.
- Profile Creation: Allows users to create and manage their profiles, storing data in the `users` collection with default 'unassigned' role. Each user can only modify their own profile.
- Request Submission: Enables authenticated users to submit help/blood/rescue requests, stored in the `requests` collection.
- Volunteer Registration: Allows volunteers and rescuers to register their data, stored in the `volunteers` collection.
- Donor Information: Enables users to register as blood donors, storing blood type and availability in the `donors` collection.
- Role Assignment Tool: A tool that recommends a default user role based on the user's submitted information in the profiles, requests, volunteers or donor collections.
- Data security: Includes Firestore security rules to ensure only authenticated users can read/write data, and users can only modify their profiles.

## Style Guidelines:

- Primary color: Deep blue (#21409A) to convey trust and stability.
- Background color: Light blue (#E0F7FA) for a clean and calming backdrop.
- Accent color: Soft orange (#F4A261) to highlight calls to action and important information.
- Body and Headline Font: 'PT Sans', sans-serif, to provide modern legibility while retaining a humanist feel.
- Code Font: 'Source Code Pro', monospaced, to display snippets of the app's codebase if necessary.
- Use clear, universal icons to represent different categories of requests (medical, rescue, blood) and user roles.
- Subtle animations to acknowledge user interactions, such as form submissions or data updates, providing clear visual feedback.