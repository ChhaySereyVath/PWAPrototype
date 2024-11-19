
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { 
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
 } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDN5NTJpO1IHYmy0EE1LQ3Kvk88Aw6eGAc",
    authDomain: "weyer-9c4be.firebaseapp.com",
    projectId: "weyer-9c4be",
    storageBucket: "weyer-9c4be.firebasestorage.app",
    messagingSenderId: "388394426694",
    appId: "1:388394426694:web:91ef31886ef6ba6a050547",
    measurementId: "G-58MK7PBKYX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add a reservation
export async function addReservationToFirebase(reservation) {
  try {
    const docRef = await addDoc(collection(db, "reservations"), reservation);
    return { id: docRef.id, ...reservation }; // Return the document ID along with the reservation data
  } catch (e) {
    console.error("Error adding reservation: ", e);
  }
}

// Get all reservations
export async function getReservationsFromFirebase() {
  const reservations = [];
  try {
    const querySnapshot = await getDocs(collection(db, "reservations"));
    querySnapshot.forEach((doc) => {
      reservations.push({ id: doc.id, ...doc.data() });
    });
  } catch (e) {
    console.error("Error retrieving reservations: ", e);
  }
  return reservations;
}

// Delete a reservation
export async function deleteReservationFromFirebase(id) {
  if (!id) {
    console.error("Invalid ID passed to deleteTaskFromFirebase.");
    return;
  }
  try {
    await deleteDoc(doc(db, "reservations", id));
  } catch (e) {
    console.error("Error deleting reservation: ", e);
  }
}

// // Update a reservation
// export async function updateReservationInFirebase(id, updatedData) {
//   try {
//     const reservationRef = doc(db, "reservations", id);
//     await updateDoc(reservationRef, updatedData);
//   } catch (e) {
//     console.error("Error updating reservation: ", e);
//   }
// }

// Update a reservation
export async function updateReservationInFirebase(id, updatedData) {
  try {
    const reservationDoc = doc(db, "reservations", id);
    await updateDoc(reservationDoc, updatedData);
    console.log(`Reservation with ID ${id} updated in Firebase.`);
  } catch (error) {
    console.error(`Error updating reservation in Firebase: ${error}`);
  }
}



