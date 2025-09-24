const { db } = require("./firebase");

// Sample student data
const student = {
  uid: "pd4NnHmckUXo3LlFGLpEy6yX9H12", // Must match Firebase Auth UID
  studentId: "pd4NnHmckUXo3LlFGLpEy6yX9H12",
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan@example.com",
  status: "active"
};

async function addStudent(student) {
  try {
    await db.collection("students").doc(student.uid).set(student);
    console.log(`✅ Student ${student.firstName} ${student.lastName} added!`);
  } catch (error) {
    console.error("❌ Error adding student:", error);
  }
}

// Run the function
addStudent(student);
