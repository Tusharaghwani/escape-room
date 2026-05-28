# 🧠 Infinite AI Escape Room

Welcome to the Infinite AI Escape Room project! This guide will show you exactly how to boot up the Machine Learning backend and the React frontend from your terminal.

---

## 🚀 How to Run the Project

You will need to open **two separate terminal windows** (or two tabs in VSCode) so that the frontend and backend can run at the same time.

### Terminal 1: Start the ML Backend Server
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd C:\Users\tusha\.gemini\antigravity\scratch\escape_room\backend
   ```
2. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
   *(Note: The very first time you boot the server, it may take 10-20 seconds to load the 260MB NLP Transformer model into your RAM. Please be patient until you see the "Application startup complete" message!)*

### Terminal 2: Start the React Frontend
1. Open a second terminal window and navigate to the frontend folder:
   ```bash
   cd C:\Users\tusha\.gemini\antigravity\scratch\escape_room\frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Once it starts, hold `Ctrl` and click the `http://localhost:5173` link in the terminal to open the game in your browser!

---

## 🔍 How to Test the New ML Features

Once both servers are running, log into the game and click **Forge Door** to test the new AI systems:

1. **Test the Sentiment Analyzer:** 
   Write a highly aggressive or scary riddle (e.g., *"Blood, death, and darkness surround you"*). 
   **Result:** When you enter the room, the UI will shift into a pulsating red "Dark Theme".
   
2. **Test the Fog of War (Lexical Complexity):** 
   Write a riddle using extremely complex, academic, or archaic vocabulary.
   **Result:** The text will be covered in a thick blur filter. You must use your mouse as a flashlight to read it.

3. **Test the Paradox Detector (NLI Model):** 
   Write a logically contradictory riddle (e.g., *"I always tell lies, but I am telling the truth right now."*).
   **Result:** The AI will catch the contradiction. The room text will violently glitch in neon green. The only way to escape the room is to type the word `PARADOX` as your answer.
