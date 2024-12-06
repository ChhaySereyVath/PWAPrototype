import { auth } from "./firebaseConfig.js";
import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { clearIndexedDB } from "./indexDB.js";

let currentUser = null;

// Export a dynamic getter for the authenticated user
export function getCurrentUser() {
    return new Promise((resolve, reject) => {
        if (currentUser) {
            // If already set, resolve immediately
            resolve(currentUser);
        } else {
            // Subscribe to auth state changes
            onAuthStateChanged(auth, (user) => {
                currentUser = user || null; // Update the cached user
                resolve(user); // Resolve with the current user or null
            }, reject); // Reject in case of an error
        }
    });
}

// Initialize authentication functionality
async function initializeAuth() {
    const logoutBtn = document.getElementById("logout-btn");

    try {
        // Wait for the current user
        const user = await getCurrentUser();

        if (user) {
            console.log("User is signed in:", user.email);
        } else {
            console.log("No user signed in. Redirecting...");
            window.location.href = "/pages/auth.html"; // Redirect if no user is signed in
        }
    } catch (error) {
        console.error("Error initializing auth:", error);
    }

    // Attach logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    } else {
        console.warn("Logout button not found in the DOM.");
    }
}

// Logout handler
async function handleLogout() {
    try {
        await signOut(auth); // Sign out the user
        await clearIndexedDB(); // Clear indexedDB
        console.log("User signed out and IndexedDB cleared.");
        M.toast({ html: "Sign-out successful!" });
        window.location.href = "/pages/auth.html"; // Redirect to login page
    } catch (error) {
        console.error("Error during sign-out:", error);
        M.toast({ html: error.message });
    }
}

// Initialize the script on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initializeAuth);
