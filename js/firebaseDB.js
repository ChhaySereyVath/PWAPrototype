import { db } from "./firebaseConfig.js";
import { getCurrentUser} from "./auth.js";
import { 
  collection,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
 } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
 


// Add a reservation
export async function addReservationToFirebase(reservation) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    const userId = currentUser.uid;
    console.log("User ID: ", userId);

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { email: currentUser.email }, { merge: true });

    const reservationRef = collection(userRef, "reservations");

    const docRef = await addDoc(reservationRef, reservation);
    console.log("Document written with ID: ", docRef.id);
    return { id: docRef.id, ...reservation }; // Return the document ID along with the reservation data
  } catch (e) {
    console.error("Error adding reservation: ", e);
  }
}


// Get all reservations
export async function getReservationsFromFirebase() {
  const reservations = [];
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) { 
        throw new Error("User not authenticated");
    }
    const userId = currentUser.uid;
    const reservationRef = collection(doc(db, "users", userId), "reservations");
    const querySnapshot = await getDocs(reservationRef);
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    const userId = currentUser.uid;
    await deleteDoc(doc(db, "users", userId, "reservations", id));
  } catch (e) {
    console.error("Error deleting reservation: ", e);
  }
}

// Update a reservation
export async function updateReservationInFirebase(id, updatedData) {
  try {
    const currentUser = await getCurrentUser();
    if(!currentUser) {
      throw new Error("User not authenticated");
    }
    const userId = currentUser.uid;
    const reservationRef = doc(db, "users", userId, "reservations", id);
    await updateDoc(reservationRef, updatedData);
    console.log(`Reservation with ID ${id} updated in Firebase.`);
  } catch (error) {
    console.error(`Error updating reservation in Firebase: ${error}`);
  }
}



