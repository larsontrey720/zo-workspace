import { readFileSync, writeFileSync, existsSync } from "fs";

const STATE_FILE = "/dev/shm/temp-mail-state.json";

interface State {
  email: string;
  createdAt: number;
  url: string;
}

function loadState(): State | null {
  try {
    if (existsSync(STATE_FILE)) {
      return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    }
  } catch {}
  return null;
}

function saveState(state: State) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getState() {
  const state = loadState();
  if (!state) {
    console.log(JSON.stringify({ error: "No active session. Run 'temp-mail create' first" }));
    process.exit(1);
  }
  return state;
}

const cmd = Bun.argv[2];

if (cmd === "create" || cmd === "reset") {
  // Return instructions for browser
  console.log(JSON.stringify({
    message: "Open https://www.emailondeck.com in browser, get the email address, then save it with: temp-mail save <email>",
    action: "open_browser",
    url: "https://www.emailondeck.com"
  }));
} else if (cmd === "save") {
  const email = Bun.argv[3];
  if (!email) {
    console.log(JSON.stringify({ error: "Usage: temp-mail save <email>" }));
    process.exit(1);
  }
  const state: State = {
    email,
    createdAt: Date.now(),
    url: `https://www.emailondeck.com`
  };
  saveState(state);
  console.log(JSON.stringify({ success: true, email }));
} else if (cmd === "address") {
  const state = getState();
  console.log(JSON.stringify({ email: state.email, createdAt: state.createdAt }));
} else if (cmd === "check") {
  const state = getState();
  console.log(JSON.stringify({ 
    message: "Use browser to check emails at emailondeck.com",
    email: state.email,
    url: state.url,
    action: "check_in_browser"
  }));
} else {
  const state = loadState();
  if (state) {
    console.log(JSON.stringify({ email: state.email, url: state.url }));
  } else {
    console.log(JSON.stringify({ 
      message: "No session. Run 'temp-mail create' to start"
    }));
  }
}