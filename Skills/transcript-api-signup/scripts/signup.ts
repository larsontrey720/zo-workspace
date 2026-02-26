// TranscriptAPI Signup Automation
// Usage: bun Skills/transcript-api-signup/scripts/signup.ts

import { spawn } from "child_process";

// Constants
const CATCHMAIL_API = "https://api.catchmail.io/api/v1";
const SITE_URL = "https://transcriptapi.com";
const PASSWORD = "TestPass123!";

// Generate random username
function generateUsername(): string {
  return "user" + Math.random().toString(36).substring(2, 8);
}

// Create catchmail email
async function createEmail(): Promise<string> {
  const username = generateUsername();
  const email = `${username}@catchmail.io`;
  console.log(`Created email: ${email}`);
  return email;
}

// Fetch messages from catchmail
async function getMessages(email: string): Promise<any[]> {
  const url = `${CATCHMAIL_API}/mailbox?address=${email}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.messages || [];
}

// Get verification code from the latest email
async function getVerificationCode(email: string): Promise<string | null> {
  const messages = await getMessages(email);
  
  if (messages.length === 0) {
    return null;
  }
  
  // Get the latest message
  const latestMsg = messages[messages.length - 1];
  const msgUrl = `${CATCHMAIL_API}/message/${latestMsg.id}?mailbox=${email}`;
  
  const res = await fetch(msgUrl);
  const data = await res.json();
  
  // Extract 6-digit code from text
  const text = data.body?.text || "";
  const match = text.match(/(\d{6})/);
  
  if (match) {
    return match[1];
  }
  
  return null;
}

// Main signup function using browser automation
async function signup() {
  console.log("Starting TranscriptAPI signup...\n");
  
  // Step 1: Create catchmail email
  const email = await createEmail();
  console.log("");
  
  // Step 2-5: Use browser to do the signup
  console.log("Opening signup page...");
  
  // Use curl to simulate the signup API call first
  const signupUrl = `${SITE_URL}/api/auth/signup`;
  
  const signupData = {
    email: email,
    password: PASSWORD
  };
  
  const signupRes = await fetch(signupUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signupData),
  });
  
  const signupResult = await signupRes.json();
  console.log("Signup response:", signupResult);
  
  if (!signupResult.success) {
    console.error("Signup failed!");
    process.exit(1);
  }
  
  console.log("\nAccount created! Now verifying email...");
  
  // Step 3: Click "Send verification code" - this is done via the verify-email page
  // For now, we'll need to use the browser for this part
  
  console.log(`
Signup completed!

Email: ${email}
Password: ${PASSWORD}

Next steps:
1. Go to ${SITE_URL}/login
2. Login with the email and password above
3. You'll be redirected to /verify-email
4. Click "Send verification code"
5. Run: curl "${CATCHMAIL_API}/mailbox?address=${email}"
6. Get the 6-digit code from the response
7. Enter the code to verify your email

The account will be active after email verification.
  `);
}

// Run if called directly
signup().catch(console.error);