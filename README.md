
# LearnAbleAI: Personalized AI Tutor

LearnAbleAI is a web-based, personalized AI tutor designed to provide an adaptive learning experience for users with learning disabilities, including Dyslexia, ADHD, and Autism. It leverages the power of the Google Gemini API to tailor its teaching style, making education more accessible and effective for everyone.

##  Core Features

*   **Personalized Learning Profiles**: Users can select a profile (Dyslexia, ADHD, or Autism) to receive content and interact with the AI in a way that best suits their needs.
*   **Adaptive AI Conversation**: Powered by Google's Gemini model, the tutor adjusts its language, structure, and tone based on the chosen profile.
    *   **Dyslexia Mode**: Provides simplified text, short sentences, and emphasizes key terms. Includes a **Text-to-Speech** feature to read responses aloud.
    *   **ADHD Mode**: Engages users with gamified micro-lessons, an encouraging tone, and bite-sized, actionable steps.
    *   **Autism Mode**: Delivers clear, literal, and highly structured information, avoiding ambiguity and metaphors.
*   **Sleek & Intuitive UI**: A clean, beautiful, dark-mode chat interface that is easy to navigate and free of distractions.
*   **Built with Modern Tech**: A responsive and performant single-page application built with React and TypeScript.

##  How It Works

The magic of LearnAbleAI lies in its use of **System Instructions** with the Google Gemini API.

1.  **Profile Selection**: The user first chooses one of the three learning profiles.
2.  **AI Initialization**: When the chat is created, a specific `systemInstruction` is sent to the Gemini API. This instruction primes the model, telling it exactly what persona to adopt. For example, for the ADHD profile, the instruction is: *"You are an AI tutor for a user with ADHD. Present information in engaging, bite-sized micro-lessons..."*
3.  **Tailored Interaction**: From that point on, all of the AI's responses are filtered through this persona, ensuring the conversation is perfectly tailored to the user's learning style without complex frontend logic.

##  Tech Stack

*   **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
*   **AI Engine**: [Google Gemini API](https://ai.google.dev/)
*   **Styling**: CSS-in-JS (React Style Objects) & Global CSS Custom Properties for theming.
*   **Accessibility**: Browser-native `SpeechSynthesis` API for Text-to-Speech functionality.

##  Future Enhancements

This prototype lays a strong foundation. Future improvements could include:

*   **Streaming Responses**: Use `chat.sendMessageStream()` to display the AI's response token-by-token for a more dynamic, real-time feel.
*   **Conversation History**: Save chat sessions to the browser's `localStorage` to allow users to continue where they left off.
*   **Secure API Key**: Implement a simple Node.js/Express backend to proxy API requests, keeping the API key off the frontend.
*   **User Accounts**: Add user authentication to track progress and save preferences.
*   **More Profiles**: Expand the application to support a wider range of learning styles and needs.
