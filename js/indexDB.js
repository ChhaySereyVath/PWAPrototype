import { openDB } from "https://unpkg.com/idb?module";
import { addReservationToFirebase, deleteReservationFromFirebase, getReservationsFromFirebase, updateReservationInFirebase } from "./firebaseDB.js";
import { getCurrentUser } from "./auth.js";

document.addEventListener('DOMContentLoaded', async function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
    await getCurrentUser();
    loadReservations();
    // syncReservations();
    checkStorageUsage();
    
});

// Create IndexedDB database
async function createDB() {
  const db = await openDB("weyer", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("reservations")) {
        const store = db.createObjectStore("reservations", {
          keyPath: "id",
          autoIncrement: true,
        });
        // Define indexes for fields
        store.createIndex("FullName", "FullName", { unique: false });
        store.createIndex("Email", "Email", { unique: false });
        store.createIndex("Phone", "Phone", { unique: false });
        store.createIndex("SessionDate", "SessionDate", { unique: false });
        store.createIndex("SessionTime", "SessionTime", { unique: false });
        store.createIndex("Comments", "Comments", { unique: false });
      }
    },
  });
  return db;
}


// Add reservation to IndexedDB
async function addReservation(reservation) {
    try {
        const db = await createDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }
        const userId = currentUser.uid;

        let reservationId;

        if (navigator.onLine) {
            const savedReservation = await addReservationToFirebase(reservation);
            reservationId = savedReservation?.id;

            if (!reservationId) {
                console.error("No ID returned from Firebase for the reservation.");
                return null;
            }

            const tx = db.transaction("reservations", "readwrite");
            const store = tx.objectStore("reservations");
            await store.put({ ...reservation, id: reservationId, userId, synced: true });
            await tx.done;

            return { ...reservation, id: reservationId, synced: true };
        } else {
            reservationId = `temp-${Date.now()}`;
            const reservationToStore = { ...reservation, id: reservationId, userId, synced: false };

            const tx = db.transaction("reservations", "readwrite");
            const store = tx.objectStore("reservations");
            await store.add(reservationToStore);
            await tx.done;

            return reservationToStore;
        }
    } catch (error) {
        console.error("Error adding reservation to IndexedDB:", error);
        return null;
    }
}


//edit reservation in IndexedDB
async function editReservation(id, updatedData) {
  try {
    const db = await createDB();

    if (navigator.onLine) {
      console.log("You are online. Syncing updates with Firebase...");
      try {
        await updateReservationInFirebase(id, updatedData); // Call the helper
      } catch (error) {
        console.error(`Error updating reservation in Firebase: ${error}`);
      }
    } else {
      console.log("You are offline. Changes will sync later.");
    }

    const tx = db.transaction("reservations", "readwrite");
    const store = tx.objectStore("reservations");

    await store.put({ ...updatedData, id, synced: navigator.onLine }); // Update IndexedDB
    console.log(`Reservation with ID ${id} updated in IndexedDB.`);
    await tx.done;

    updateReservationInUI(id, updatedData); // Update the UI
  } catch (error) {
    console.error("Error editing reservation in IndexedDB:", error);
  }
}

// Update reservation in UI
function updateReservationInUI(id, updatedData) {
  const bookingCard = document.querySelector(`.card[data-id="${id}"]`);
  if (!bookingCard) {
    console.error(`Booking card with ID ${id} not found in the UI.`);
    return;
  }

  // Update the card's content with the new data
  bookingCard.innerHTML = `
    <div class="card-content">
      <p><strong>Name:</strong> ${updatedData.FullName}</p>
      <p><strong>Email:</strong> ${updatedData.Email}</p>
      <p><strong>Phone:</strong> ${updatedData.Phone}</p>
      <p><strong>Preferred Session Date:</strong> ${updatedData.SessionDate}</p>
      <p><strong>Preferred Session Time:</strong> ${updatedData.SessionTime}</p>
      <p><strong>Comments:</strong> ${updatedData.Comments || "N/A"}</p>
      <button class="btn-small red delete-btn" data-id="${id}">delete</button>
      <button class="btn-small green edit-btn" data-id="${id}">edit</button>
    </div>
  `;

  // Reattach event listeners for delete and edit buttons
  const deleteBtn = bookingCard.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", async () => {
    try {
      console.log(`Deleting reservation with ID: ${id}`);
      await deleteReservation(id);
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  });

  const editBtn = bookingCard.querySelector(".edit-btn");
  editBtn.addEventListener("click", () => {
    openEditForm(
      id,
      updatedData.FullName,
      updatedData.Email,
      updatedData.Phone,
      updatedData.SessionDate,
      updatedData.SessionTime,
      updatedData.Comments
    );
  });

  console.log(`Reservation with ID ${id} updated in the UI.`);
}

// Get reservations from IndexedDB
async function getReservations() {
    try {
        const db = await createDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }
        const userId = currentUser.uid;

        const tx = db.transaction("reservations", "readonly");
        const store = tx.objectStore("reservations");

        const allReservations = await store.getAll();
        await tx.done;

        // Filter reservations for the current user
        return allReservations.filter(reservation => reservation.userId === userId);
    } catch (error) {
        console.error("Error fetching reservations from IndexedDB:", error);
        return [];
    }
}


// Delete reservation from IndexedDB
async function deleteReservation(id) {
  if (!id) {
    console.error("Invalid ID passed to deleteReservation.");
    return;
  }

  const db = await createDB();
  if (navigator.onLine) {
    try {
      await deleteReservationFromFirebase(id); // Delete from Firebase
    } catch (error) {
      console.error(`Error deleting reservation from Firebase: ${error}`);
    }
  }

  // Delete from IndexedDB
  const tx = db.transaction("reservations", "readwrite");
  const store = tx.objectStore("reservations");

  try {
    await store.delete(id); // Delete using the correct ID
    console.log(`Reservation with ID ${id} deleted from IndexedDB.`);
  } catch (error) {
    console.error("Error deleting reservation from IndexedDB: ", error);
  }

  await tx.done;

  // Remove the corresponding card from the UI
  const bookingCard = document.querySelector(`.card[data-id="${id}"]`);
  if (bookingCard) {
    bookingCard.remove();
  }

  // Check storage usage
  checkStorageUsage();
}

// load reservations from IndexedDB and display in UI
let isLoadingReservations = false;

async function loadReservations() {
  if (isLoadingReservations) {
    console.log("loadReservations already in progress. Skipping...");
    return; // Prevent duplicate calls
  }

  isLoadingReservations = true;

  try {
    console.log("Loading reservations...");
    const db = await createDB();
    const historyContainer = document.getElementById("historyContainer");

    if (!historyContainer) {
      console.error("History container not found in DOM.");
      return;
    }

    historyContainer.innerHTML = ""; // Clear previous history

    if (navigator.onLine) {
      console.log("You are online. Fetching reservations from Firebase...");
      
      // Fetch reservations from Firebase
      const firebaseReservations = await getReservationsFromFirebase();
      console.log("Reservations from Firebase:", firebaseReservations);

      const tx = db.transaction("reservations", "readwrite");
      const store = tx.objectStore("reservations");

      // Sync Firebase reservations to IndexedDB and display them
      for (const reservation of firebaseReservations) {
        await store.put({ ...reservation, synced: true });
        displayReservation(reservation);
      }

      await tx.done;
    } else {
      console.log("You are offline. Fetching reservations from IndexedDB...");

      // Fetch reservations from IndexedDB
      const tx = db.transaction("reservations", "readonly");
      const store = tx.objectStore("reservations");

      const reservations = await store.getAll();
      reservations.forEach((reservation) => displayReservation(reservation));

      await tx.done;
    }
  } catch (error) {
    console.error("Error loading reservations:", error);
  } finally {
    isLoadingReservations = false; // Reset guard flag
  }
}

// Sync unsynced reservations with Firebase
async function syncReservations() {
  const db = await createDB();
  const tx = db.transaction("reservations", "readwrite");
  const store = tx.objectStore("reservations");

  // Fetch all unsynced reservations
  const unsyncedReservations = await store.getAll();
  await tx.done;

  for (const reservation of unsyncedReservations) {
    if (!reservation.synced && navigator.onLine) {
      try {
        const reservationToSync = {
          FullName: reservation.FullName,
          Email: reservation.Email,
          Phone: reservation.Phone,
          SessionDate: reservation.SessionDate,
          SessionTime: reservation.SessionTime,
          Comments: reservation.Comments,
        };

        // Send reservation to Firebase and get the new ID
        const savedReservation = await addReservationToFirebase(reservationToSync);
        console.log("Saved reservation from Firebase:", savedReservation);

        // Replace temp ID with Firebase ID in IndexedDB
        const txUpdate = db.transaction("reservations", "readwrite");
        const storeUpdate = txUpdate.objectStore("reservations");

        // Delete the old temp ID entry
        await storeUpdate.delete(reservation.id);

        // Add the reservation with the new Firebase ID
        const updatedReservation = { ...reservation, id: savedReservation.id, synced: true };
        await storeUpdate.put(updatedReservation);
        await txUpdate.done;

        // Update the UI to reflect the new Firebase ID
        const bookingCard = document.querySelector(`.card[data-id="${reservation.id}"]`);
        if (bookingCard) {
          // Update the card's data-id attribute to the new Firebase ID
          bookingCard.dataset.id = savedReservation.id;

          // Update the card's content to ensure it reflects the latest data
          bookingCard.innerHTML = `
            <div class="card-content">
              <p><strong>Name:</strong> ${updatedReservation.FullName}</p>
              <p><strong>Email:</strong> ${updatedReservation.Email}</p>
              <p><strong>Phone:</strong> ${updatedReservation.Phone}</p>
              <p><strong>Preferred Session Date:</strong> ${updatedReservation.SessionDate}</p>
              <p><strong>Preferred Session Time:</strong> ${updatedReservation.SessionTime}</p>
              <p><strong>Comments:</strong> ${updatedReservation.Comments || "N/A"}</p>
              <button class="btn-small red delete-btn" data-id="${savedReservation.id}">delete</button>
              <button class="btn-small green edit-btn" data-id="${savedReservation.id}">edit</button>
            </div>
          `;

          // Reattach event listeners with the new ID
          attachCardEventListeners(bookingCard, updatedReservation);
        }
      } catch (error) {
        console.error("Error syncing reservation:", error);
      }
    }
  }
}

// Helper to attach event listeners
function attachCardEventListeners(bookingCard, reservation) {
  const deleteBtn = bookingCard.querySelector(".delete-btn");
  const editBtn = bookingCard.querySelector(".edit-btn");

  // Clear existing listeners to prevent duplicates
  deleteBtn.replaceWith(deleteBtn.cloneNode(true));
  editBtn.replaceWith(editBtn.cloneNode(true));

  const newDeleteBtn = bookingCard.querySelector(".delete-btn");
  const newEditBtn = bookingCard.querySelector(".edit-btn");

  // Attach new delete listener
  newDeleteBtn.addEventListener("click", async () => {
    try {
      const id = bookingCard.dataset.id;
      console.log(`Deleting reservation with ID: ${id}`);
      await deleteReservation(id);
      bookingCard.remove();
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  });

  // Attach new edit listener
  newEditBtn.addEventListener("click", () => {
    openEditForm(
      reservation.id,
      reservation.FullName,
      reservation.Email,
      reservation.Phone,
      reservation.SessionDate,
      reservation.SessionTime,
      reservation.Comments
    );
  });
}


// Load reservations on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    try {
      await loadReservations(); // Load from IndexedDB
    } catch (error) {
      console.error("Error loading reservations:", error);
    }
  });
  
// Add a new booking
async function addBooking() {
  const FullName = document.getElementById("FullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const arrivalDate = document.getElementById("arrivalDate").value.trim();
  const arrivalTime = document.getElementById("arrivalTime").value.trim();
  const comments = document.getElementById("comments").value.trim();

  // Validate required fields
  if (!FullName || !email || !phone || !arrivalDate || !arrivalTime) {
    alert("Please fill in all required fields.");
    return;
  }

  const reservation = {
    FullName,
    Email: email,
    Phone: phone,
    SessionDate: arrivalDate,
    SessionTime: arrivalTime,
    Comments: comments,
  };

  try {
    // Save reservation to IndexedDB and get the reservation with ID
    const savedReservation = await addReservation(reservation);
    if (!savedReservation) {
      console.error("Failed to save reservation. No reservation returned.");
      alert("Failed to save the reservation. Please try again.");
      return;
    }

    console.log("Reservation added to IndexedDB:", savedReservation);

    // Display reservation in UI
    displayReservation(savedReservation);

    // Reset form fields
    document.getElementById("bookingForm").reset();
  } catch (error) {
    console.error("Error adding reservation:", error);
  }
}

  // Attach event listener to the form
  document.getElementById("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload
    addBooking();
  });

// Display reservation in UI
function displayReservation(reservation) {
  const historyContainer = document.getElementById("historyContainer");

  // Create a new booking card
  const bookingCard = document.createElement("div");
  bookingCard.className = "card";
  bookingCard.dataset.id = reservation.id;
  bookingCard.innerHTML = `
    <div class="card-content">
      <p><strong>Name:</strong> ${reservation.FullName}</p>
      <p><strong>Email:</strong> ${reservation.Email}</p>
      <p><strong>Phone:</strong> ${reservation.Phone}</p>
      <p><strong>Preferred Session Date:</strong> ${reservation.SessionDate}</p>
      <p><strong>Preferred Session Time:</strong> ${reservation.SessionTime}</p>
      <p><strong>Comments:</strong> ${reservation.Comments || "N/A"}</p>
      <button class="btn-small red delete-btn" data-id="${reservation.id}">delete</button>
      <button class="btn-small green edit-btn" data-id="${reservation.id}">edit</button>
    </div>
  `;

  // Append the booking card to the history container
  historyContainer.appendChild(bookingCard);

  const deleteBtn = bookingCard.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", async () => {
    try {
      const id = bookingCard.dataset.id; // Use Firebase ID
      console.log(`Deleting reservation with ID: ${id}`);
  
      // Perform both deletions sequentially
      await deleteReservation(id); // Delete from IndexedDB
      console.log(`Deleted from IndexedDB: ${id}`);

      bookingCard.remove(); // Remove from UI
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  });
    // Add edit event listener
    const editBtn = bookingCard.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => {
    openEditForm(
        reservation.id,
        reservation.FullName,
        reservation.Email,
        reservation.Phone,
        reservation.SessionDate,
        reservation.SessionTime,
        reservation.Comments
    );
    });
}

// Open the edit form with existing data
function openEditForm(id, FullName, Email, Phone, SessionDate, SessionTime, Comments) {
  const titleInput = document.querySelector("#FullName");
  const emailInput = document.querySelector("#email");
  const phoneInput = document.querySelector("#phone");
  const dateInput = document.querySelector("#arrivalDate");
  const timeInput = document.querySelector("#arrivalTime");
  const commentsInput = document.querySelector("#comments");
  const formActionButton = document.querySelector("#form-action-btn");

  // Populate the form with existing data
  titleInput.value = FullName;
  emailInput.value = Email;
  phoneInput.value = Phone;
  dateInput.value = SessionDate;
  timeInput.value = SessionTime;
  commentsInput.value = Comments || "";

  // Update button text
  formActionButton.textContent = "Edit";

  // Remove existing event listeners by cloning the button
  const newFormActionButton = formActionButton.cloneNode(true);
  formActionButton.parentNode.replaceChild(newFormActionButton, formActionButton);

  // Add a fresh event listener for editing
  newFormActionButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const updatedReservation = {
      FullName: titleInput.value,
      Email: emailInput.value,
      Phone: phoneInput.value,
      SessionDate: dateInput.value,
      SessionTime: timeInput.value,
      Comments: commentsInput.value,
    };

    // Call the edit function
    await editReservation(id, updatedReservation);

    // Reset the form to "add reservation" mode
    closeForm();
  });

  M.updateTextFields(); // Update Materialize fields if you're using it
}


// Close the form and reset fields
function closeForm() {
  const titleInput = document.querySelector("#FullName");
  const emailInput = document.querySelector("#email");
  const phoneInput = document.querySelector("#phone");
  const dateInput = document.querySelector("#arrivalDate");
  const timeInput = document.querySelector("#arrivalTime");
  const commentsInput = document.querySelector("#comments");
  const formActionButton = document.querySelector("#form-action-btn");

  // Reset form fields
  titleInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
  commentsInput.value = "";

  // Reset button text to "Add"
  formActionButton.textContent = "Add";

  // Remove existing event listeners by cloning the button
  const newFormActionButton = formActionButton.cloneNode(true);
  formActionButton.parentNode.replaceChild(newFormActionButton, formActionButton);

  // Reattach the default "add" event listener
  newFormActionButton.addEventListener("click", async (event) => {
    event.preventDefault();
    addBooking();
  });
}

//clear indexedDB
export async function clearIndexedDB() {
    try {
        const db = await createDB();
        const tx = db.transaction("reservations", "readwrite");
        const store = tx.objectStore("reservations");
        await store.clear();
        await tx.done;
        console.log("IndexedDB cleared.");
    } catch (error) {
        console.error("Error clearing IndexedDB:", error);
    }
}

// Check storage usage and update the UI
async function checkStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { usage, quota } = await navigator.storage.estimate();
      const usageInMB = (usage / (1024 * 1024)).toFixed(2);
      const quotaInMB = (quota / (1024 * 1024)).toFixed(2);

      console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);

      const storageInfo = document.querySelector("#storage-info");
      if (storageInfo) {
        storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
      }

      const storageWarning = document.querySelector("#storage-warning");
      if (usage / quota > 0.8) {
        if (storageWarning) {
          storageWarning.textContent = "Warning: You are running low on data!";
          storageWarning.style.display = "block";
        }
      } else if (storageWarning) {
        storageWarning.textContent = "";
        storageWarning.style.display = "none";
      }
    } catch (error) {
      console.error("Error checking storage usage:", error);
    }
  }
}

window.addEventListener("online", syncReservations);

// Export the necessary functions
export { addReservation, getReservations, deleteReservation, loadReservations, editReservation, createDB };
