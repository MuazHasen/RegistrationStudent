// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ============================
   FIREBASE CONFIG
============================ */
const firebaseConfig = {
  apiKey: "AIzaSyCP0TUcYhOY5RZ_Wkvp0cdI3GHI5LqUrrM",
  authDomain: "registration-system-for-cs.firebaseapp.com",
  projectId: "registration-system-for-cs",
  storageBucket: "registration-system-for-cs.firebasestorage.app",
  messagingSenderId: "351341265102",
  appId: "1:351341265102:web:b2d45076646dcbb0de909f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ============================
   FORM LOGIC
============================ */
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successOverlay = document.getElementById('successOverlay');
    const resetBtn = document.getElementById('resetBtn');

    const fields = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        studentId: document.getElementById('studentId'),
        department: document.getElementById('department'),
        year: document.getElementById('year'),
        semester: document.getElementById('semester'),
        gender: document.getElementById('gender'),
        status: document.getElementById('status')
    };

    // Validation functions
    function validateStudentId(id) {
        return /^RU\d{4}$/.test(id);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Check if Student ID already exists in Firestore
    async function isDuplicateStudentId(studentId) {
        const q = query(collection(db, "students"), where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isValid = true;

        if (fields.fullName.value.trim().length < 2) isValid = false;
        if (!validateEmail(fields.email.value)) isValid = false;

        if (!validateStudentId(fields.studentId.value)) {
            alert('Student ID must be RUXXXX (Example: RU0333)');
            return;
        }

        const selects = ['department','year','semester','gender','status'];
        selects.forEach(select => {
            if (!fields[select].value) isValid = false;
        });

        if (!isValid) {
            alert('Please fill all fields correctly.');
            return;
        }

        // Check for duplicate Student ID
        if (await isDuplicateStudentId(fields.studentId.value)) {
            alert("This Student ID is already registered!");
            return;
        }

        submitBtn.classList.add('loading');

        try {
            // 1️⃣ Create Firebase Auth User
            const defaultPassword = "DefaultPassword123!"; // Can be changed later or input in form
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                fields.email.value,
                defaultPassword
            );
            const uid = userCredential.user.uid;

            // 2️⃣ Save student info in Firestore
            await addDoc(collection(db, "students"), {
                uid: uid,
                fullName: fields.fullName.value,
                email: fields.email.value,
                studentId: fields.studentId.value,
                department: fields.department.value,
                year: fields.year.value,
                semester: fields.semester.value,
                gender: fields.gender.value,
                status: fields.status.value,
                createdAt: new Date()
            });

            submitBtn.classList.remove('loading');
            successOverlay.classList.add('active');

        } catch (error) {
            submitBtn.classList.remove('loading');
            alert("Error: " + error.message);
        }

    });

    resetBtn.addEventListener('click', () => {
        successOverlay.classList.remove('active');
        form.reset();
    });

});