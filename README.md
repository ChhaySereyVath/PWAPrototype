Project Overview: https://docs.google.com/document/d/14Y8i4ctwlSamNEVG63Jt_46z3IAnc_wLrmMDY31LqLs/edit?usp=sharing
Firebase Hosting: https://weyer-9c4be.web.app/


# Weyer Mental Health PWA Prototype

The Weyer Mental Health Progressive Web Application (PWA) is intended to give users with easily accessible mental health services. The portal provides a variety of entertainment options to enhance mental health, such as articles, podcasts, video and music playlists, and journaling tools. The site has a user-friendly layout and allows you to sign in or sign up for personalized content, as well as access support services.


## Features:
- User Authentication: Users can sign up, sign in, and manage their accounts.
- Booking Options: There are options for user to book for a consultation online.
- Entertainment Options:
   Mental Health Articles: Read informative and insightful articles focused on mental health.
   Videos & Songs: Access a curated playlist of calming music and relaxing videos.
   Podcasts: Listen to mental health discussions led by experts.
   Journaling: Write daily journals to reflect on thoughts and emotions.
- Responsive Design: Optimized for mobile and desktop.
- Offline capability using a service worker.
- Caching of essential assets for faster load times.
- PWA features, including installation prompts for supported devices.
- Mental health resources, including videos, articles, and contact forms.

## Service Worker

The service worker is a core part of the PWA that enables offline functionality and caching. The service worker file, `serviceworker.js`, is registered in the main HTML file and manages caching of static assets and handling network requests.

### How it Works

- **Registration**: The service worker is registered in the `<head>` section of `index.html`, which ensures it’s loaded once the page is visited.
- **Installation**: When the service worker is installed, it caches critical assets like HTML, CSS, JavaScript files, and images.
- **Fetch Event**: During fetch events, the service worker intercepts requests, serving assets from the cache if available or fetching from the network otherwise.

## Firebase/Index DB
The combination of FirebaseDB and IndexedDB provides users with an intuitive interface by ensuring that data is accessible and synchronized regardless of their internet connection.

### How it works
1. Online mode.
When the user goes online:
- FirebaseDB is the primary database for storing and retrieving information.
- Operations such as adding, modifying, and removing reservations are instantaneously synced with Firebase.
- IndexedDB is updated concurrently with the same data to provide consistency and offline access.
Workflow: The user takes an action (e.g., adding a reservation).
1. The app transmits the data to FirebaseDB and returns the generated Firebase ID.
2. The data, together with the Firebase ID, are saved to IndexedDB for offline access.
3. The modifications are immediately reflected in the user interface via the Firebase ID.
Key points:
- In the online mode, Firebase serves as the definitive source of truth.
- IndexedDB functions as a local cache, providing faster access and offline fallback.
  
2. Offline mode.
When the user is offline:
- All operations are carried out utilizing IndexedDB, the browser's local database.
- New reservations are granted temporary IDs in order to uniquely identify them until they can sync with Firebase.
Workflow:
1. A user takes an action (such as adding or updating a reservation).
2. Data is stored locally in IndexedDB and assigned a temp-<timestamp> ID.
3. The UI is quickly updated with data from IndexedDB.
4. The reservation is marked as "unsynced."
Key points:
- IndexedDB enables the program to function seamlessly offline.
- The user can read, add, or alter reservations, but changes are saved locally until an internet connection is restored.

3. Synchronization
When the app detects an internet connection after going offline:
- The syncReservations function fetches all unsynced reservations from Indexed Database.
- Each unsynced reservation is submitted to FirebaseDB, where it is assigned a permanent Firebase ID.
- The relevant entry in IndexedDB is updated with the Firebase ID, replacing the temporary ID.
- The user interface is refreshed to reflect the changed IDs and data.
Key Steps in Synchronization:
In IndexedDB, unsynchronized reservations are indicated by the flag synced: false.
During synchronization, 
- data is transferred to Firebase.
- IndexedDB replaces temporary IDs with Firebase IDs.
- The UI has been changed to reflect the changes.

4. User Authentication
- When user is sign in, the user will display in firebase with userID and they can input any data that also appear within the userID so the data will not be mix if there another user sign in. 

## Technology Stack:
- HTML/CSS/JavaScript: Core web technologies for building the front-end interface.
- Materialize CSS: framework used for designing responsive layouts.
- Local Storage: To store user preferences and journals.
- PWA Features: Service workers, caching for offline functionality, and installable app setup.
- Firebase/Index DB: Store the form input from reservation page into database online and offline.

## File Structure:
- index.html - Home page with mental health resources.
- about.html - Page that talk about our application goals and information
- entertainment.html - Entertainment options page with articles, videos, podcasts, and journaling.
- booking.html - Session booking page.
- reservation.html - Submit a session after selecting the one you need.
- contact.html - Contact form for user support.
- auth.html - Login and Signup pages for user authentication.
- style.css - Custom styling for the PWA.
- js/scripts.js - JavaScript handling PWA.
- images/ - store all the images used in the vscode
- manifest.json - for add to homescreen.
- service worker - working on the offline access.
- firebaseDB.js - working with the firebase db fetching the data and add data. (Create, Read, Update, Delete).
- indexDB.js - working with indexDB to store the data offline and will sync whenever it online also implemented the CRUD operation on to reservation page.
- auth.js - working with user authentication and sync accross user. 
- signIn.js - working with user signin and signup.

## Progress:
- Right now, I only enable the PWA functionality with online access, add or install to homescreen and now I completed the firebaseDB and indexDB to store the data or the input form from user into the both database wether it online or offline. 

## Future Improvements
- PWA functionality: (offline access, installability, etc.) (Done).
- Database Access for online and offline. (Done).
- Secure Authentication and user profile.
