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

## Technology Stack:
- HTML/CSS/JavaScript: Core web technologies for building the front-end interface.
- Materialize CSS: framework used for designing responsive layouts.
- Local Storage: To store user preferences and journals.
- PWA Features (Future Improvement): Service workers, caching for offline functionality, and installable app setup.

## File Structure:
- index.html - Home page with mental health resources.
- about.html - Page that talk about our application goals and information
- entertainment.html - Entertainment options page with articles, videos, podcasts, and journaling.
- booking.html - Session booking page.
- reservation.html - Submit a session after selecting the one you need.
- contact.html - Contact form for user support.
- signin.html - Login and Signup pages for user authentication.
- style.css - Custom styling for the PWA.
- js/scripts.js - JavaScript handling PWA.
- images/ - store all the images used in the vscode
- manifest.json - for add to homescreen.
- service worker - working on the offline access.

## Progress:
- Right now, I only enable the PWA functionality with online access, and add or install to homescreen.

## Future Improvements
- PWA functionality: (offline access, installability, etc.) (already done)
- Database Access.
