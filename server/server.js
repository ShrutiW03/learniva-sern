require('dotenv').config();
const express = require('express');
const path = require('path'); 
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const axios = require('axios');
const cors = require('cors'); 

const OpenAI = require('openai');

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173'
}));

const PORT = process.env.PORT || 3000;

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, 
  baseURL: "https://openrouter.ai/api/v1"  
});

// In-memory cache for quiz answers
const quizAnswersCache = {};

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// =================================================================
// --- CORE API ROUTES (NOW USING OPENROUTER) ---
// =================================================================

// ROUTE 1: Generate a course
app.post('/api/course/generate', async (req, res) => {
    const { topic, skillLevel, learningStyle, hoursPerWeek, learningGoals, existingKnowledge } = req.body;
    
    const sanitizedGoals = learningGoals.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const sanitizedKnowledge = existingKnowledge.replace(/"/g, '\\"').replace(/\n/g, ' ');

    const coursePrompt = `
      You are a world-class curriculum designer and subject-matter expert. Your task is to generate a comprehensive, personalized, week-by-week course.

      **USER PROFILE:**
      - **Topic:** "${topic}"
      - **Current Skill Level:** "${skillLevel}"
      - **Learning Goals:** "${sanitizedGoals}"
      - **Preferred Learning Style:** "${learningStyle}"
      - **Time Commitment:** "${hoursPerWeek}" hours per week
      - **Existing Knowledge:** "${sanitizedKnowledge}"

      **PERSONALIZATION INSTRUCTIONS:**
      1.  **Skill Level:** Adjust the starting point. For "Beginner", start with fundamentals. For "Advanced", dive into complex topics.
      2.  **Learning Style:** - "Project-Based": Make the \`projectIdea\` for each module the main focus.
          - "Visual": Include more links to "YouTube Video" and "Interactive Tutorial".
          - "Reading/Theoretical": Include more links to "Official Documentation" and "Article".
      3.  **Goals:** The modules MUST be structured to achieve the user's specific \`learningGoals\`.
      4.  **Time:** The \`totalWeeks\` and \`estimatedHours\` per module must be realistic for the user's \`hoursPerWeek\`.

      **OUTPUT FORMAT (Strict JSON):**
      Your entire response must be ONLY the JSON object. Do not add any extra text like "Here is your course".
      Your response must start with { and end with }. Ensure all resource URLs are real, valid, and relevant, not placeholders.

      {
        "title": "A compelling, catchy title for the course",
        "totalWeeks": "Calculated total weeks for the course (e.g., '6 weeks')",
        "prerequisites": ["A list of 2-3 essential skills the user should have before starting (be specific)"],
        "courseSummary": "A 2-3 sentence overview of what this course will achieve for the user.",
        "modules": [
          {
            "week": "Week number (e.g., 'Week 1')",
            "name": "Title of the module for this week",
            "description": "A summary of what this module covers and why it's important for the user's goals.",
            "keywords": ["List", "of", "key concepts"],
            "keyTakeaways": [
                "Key takeaway 1",
                "Key takeaway 2",
                "Key takeaway 3"
            ],
            "projectIdea": "A small, practical project for the user to build this week to apply their knowledge. Make this relevant to their goals.",
            "estimatedHours": "An estimated number of hours for this module (e.g., '5 hours')",
            "learningOutcomes": [
                "Specific learning outcome 1", 
                "Specific learning outcome 2"
            ],
            "resources": [
              {
                "title": "A specific, real resource title",
                "url": "https://www.realsite.com/...",
                "type": "One of: 'YouTube Video', 'Official Documentation', 'Article', 'Interactive Tutorial', 'Book Recommendation'"
              },
              {
                "title": "Another real resource title",
                "url": "https://www.anothersite.com/...",
                "type": "Article"
              }
            ]
          }
        ]
      }
    `;

    try {
        // --- NEW: OpenRouter API Call ---
        const completion = await openrouter.chat.completions.create({
            model: "mistralai/mistral-7b-instruct:free", // <-- THIS IS THE NEW, SMARTER MODEL
            messages: [
                { role: "system", content: "You are an expert curriculum designer. You MUST respond with ONLY the valid JSON object requested. Do not add any introductory text, conversation, or markdown ticks. Your response must start with { and end with }." },
                { role: "user", content: coursePrompt }
            ]
        });

        const rawText = completion.choices[0].message.content;
        
        // --- Safely find the JSON in the response ---
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch || !jsonMatch[0]) {
            console.error("Raw AI Response:", rawText); // This will now log the bad response
            throw new Error("Could not find a valid JSON object in the AI's response.");
        }
        
        const jsonString = jsonMatch[0];
        const generatedCourse = JSON.parse(jsonString);
        
        res.json({
            status: 'success',
            message: 'Course and resources generated successfully!',
            generatedCourse: generatedCourse,
            receivedData: { topic, skillLevel, learningStyle, hoursPerWeek, learningGoals, existingKnowledge }
        });
    } catch (error) {
        console.error('Error in OpenRouter course generation:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate course. The AI may have returned an invalid format.' });
    }
});

// ROUTE 2: Generate a quiz
app.post('/api/course/:courseId/quiz', async (req, res) => {
    const { courseId } = req.params;
    const { topic, userId, difficulty, quizType } = req.body;
    const questionCount = quizType === 'test' ? 10 : 5;
    console.log(`Generating a ${difficulty} ${quizType} with ${questionCount} questions for topic: "${topic}"`);

    const prompt = `
      You are a quiz-generation expert. Your task is to create a challenging but fair quiz.

      **QUIZ DETAILS:**
      - **Topic:** "${topic}"
      - **Difficulty:** "${difficulty}"
      - **Type:** "${quizType}"
      - **Number of Questions:** ${questionCount}

      **INSTRUCTIONS:**
      1.  The questions must be relevant to the topic and difficulty.
      2.  All questions must be multiple-choice with 4 options (A, B, C, D).
      3.  There must be only one correct option.
      4.  Ensure the question_id for each question is a unique number.

      **OUTPUT FORMAT (Strict JSON):**
      Your entire response must be ONLY the JSON object. Do not add any extra text like "Here is your quiz".
      Your response must start with { and end with }.

      {
        "questions": [
          {
            "question_id": 1,
            "question_text": "A clear, specific question about the topic.",
            "options": [
              { "option": "A", "text": "A plausible but incorrect answer." },
              { "option": "B", "text": "The correct answer." },
              { "option": "C", "text": "Another plausible but incorrect answer." },
              { "option": "D", "text": "A third plausible but incorrect answer." }
            ],
            "correct_option": "B"
          }
        ]
      }
    `;
    
    try {
        // --- NEW: OpenRouter API Call ---
        const completion = await openrouter.chat.completions.create({
            model: "mistralai/mistral-7b-instruct:free", // <-- THIS IS THE NEW, SMARTER MODEL
            messages: [
                { role: "system", content: "You are a quiz generator. You MUST respond with ONLY the valid JSON object requested. Do not add any introductory text, conversation, or markdown ticks. Your response must start with { and end with }." },
                { role: "user", content: prompt }
            ]
        });
        
        const rawText = completion.choices[0].message.content;
        
        // --- Safely find the JSON in the response ---
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch || !jsonMatch[0]) {
            console.error("Raw AI Response:", rawText); // This will now log the bad response
            throw new Error("Could not find a valid JSON object in the AI's response.");
        }
        
        const aiResponseContent = jsonMatch[0];
        const quizData = JSON.parse(aiResponseContent);

        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('API response did not contain a valid "questions" array.');
        }

        const answers = {};
        const questionsForClient = quizData.questions.map(q => {
            answers[q.question_id] = q.correct_option;
            const { correct_option, ...questionForClient } = q;
            return questionForClient;
        });

        quizAnswersCache[`${userId}_${courseId}`] = answers;
        setTimeout(() => { delete quizAnswersCache[`${userId}_${courseId}`]; }, 600000);

        res.json({ status: 'success', questions: questionsForClient });
    } catch (error) {
        console.error('Error generating post-course quiz:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate quiz. The AI may have returned an invalid format.' });
    }
});

// --- ALL OTHER ROUTES (Auth, Progress, etc.) ARE UNCHANGED ---

// ROUTE 3: Submit the post-course quiz
app.post('/api/course/:courseId/submit-quiz', async (req, res) => {
    // ... (This route is unchanged) ...
    const { courseId } = req.params;
    const { userId, answers, courseTopic, difficulty, quizType } = req.body;
    const topic = courseTopic || 'General Quiz';
    const cacheKey = `${userId}_${courseId}`;
    const correctAnswers = quizAnswersCache[cacheKey];
    if (!correctAnswers) return res.status(400).json({ status: 'error', message: 'Quiz session expired.' });
    let score = 0;
    const questionIds = Object.keys(answers);
    questionIds.forEach(id => { if (answers[id] === correctAnswers[id]) score++; });
    delete quizAnswersCache[cacheKey];
    try {
        await pool.execute(
            `INSERT INTO userquizresults (user_id, course_id, topic, score, total_questions, difficulty, quiz_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, courseId, topic, score, questionIds.length, difficulty, quizType]
        );
        res.json({ status: 'success', message: `Quiz submitted! You scored ${score} out of ${questionIds.length}.` });
    } catch (error) {
        console.error("Error saving quiz result:", error);
        res.status(500).json({ status: 'error', message: 'Failed to save your quiz score.' });
    }
});

// ROUTE 4: Save a generated course
app.post('/save-course', async (req, res) => {
    // ... (This route is unchanged) ...
    const { receivedData, generatedCourse, userId } = req.body;
    const { topic, skillLevel, learningGoals } = receivedData;
    
    const durationString = receivedData.duration || generatedCourse.totalWeeks; 
    const duration = parseInt(durationString) || 0; 

    if (!generatedCourse || !topic || !skillLevel || !learningGoals || !userId) {
        return res.status(400).json({ status: 'error', message: 'Missing required course data.' });
    }
    const generatedContentJson = JSON.stringify(generatedCourse);
    try {
        const [result] = await pool.execute(
            `INSERT INTO courses (topic, duration, skill_level, learning_goals, generated_content, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [topic, duration, skillLevel, learningGoals, generatedContentJson, userId] 
        );
        res.json({ status: 'success', message: 'Course saved successfully!', courseId: result.insertId });
    } catch (error) {
        console.error("Error saving course:", error);
        res.status(500).json({ status: 'error', message: `Failed to save course: ${error.message}` });
    }
});


// ROUTE 5: Get all courses for a user
app.get('/my-courses', async (req, res) => {
    // ... (This route is unchanged) ...
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is required.' });
    }
    try {
        const [courses] = await pool.execute(
            `SELECT c.*, p.completed_resources 
             FROM courses c
             LEFT JOIN user_course_progress p ON c.id = p.course_id AND p.user_id = ?
             WHERE c.user_id = ? 
             ORDER BY c.created_at DESC`,
            [userId, userId]
        );
        const parsedCourses = courses.map(course => {
            try {
                const parsedContent = JSON.parse(course.generated_content);
                let completedResources = [];
                if (course.completed_resources) {
                    completedResources = typeof course.completed_resources === 'string' 
                        ? JSON.parse(course.completed_resources) 
                        : course.completed_resources;
                }
                return { ...course, generated_content: parsedContent, completed_resources: completedResources };
            } catch (parseError) {
                return { ...course, generated_content: { title: "Error: Could not load content" }, completed_resources: [] }; 
            }
        });
        res.json({ status: 'success', courses: parsedCourses });
    } catch (error) {
        console.error("Error fetching my-courses:", error);
        res.status(500).json({ status: 'error', message: `Failed to fetch courses: ${error.message}` });
    }
});

// ROUTE 6: Get course progress
app.get('/api/course/:courseId/progress', async (req, res) => {
    // ... (This route is unchanged) ...
    const { courseId } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ status: 'error', message: 'User ID is required.' });
    try {
        const [rows] = await pool.execute(
            'SELECT completed_resources FROM user_course_progress WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );
        res.json({ status: 'success', completed_resources: rows.length > 0 ? (rows[0].completed_resources || []) : [] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch course progress.' });
    }
});

// ROUTE 7: Update course progress
app.post('/api/course/:courseId/progress', async (req, res) => {
    // ... (This route is unchanged) ...
    const { courseId } = req.params;
    const { userId, completed_resources } = req.body;
    if (!userId || !Array.isArray(completed_resources)) {
        return res.status(400).json({ status: 'error', message: 'Invalid data provided.' });
    }
    const completedResourcesJson = JSON.stringify(completed_resources);
    try {
        await pool.execute(
            `INSERT INTO user_course_progress (user_id, course_id, completed_resources) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE completed_resources = ?`,
            [userId, courseId, completedResourcesJson, completedResourcesJson]
        );
        res.json({ status: 'success', message: 'Progress saved.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to save progress.' });
    }
});


// ROUTE 8: User Signup
app.post('/signup', async (req, res) => {
    // ... (This route is unchanged) ...
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ status: 'error', message: 'Username and password are required.' });
    try {
        const [existingUser] = await pool.execute(`SELECT id FROM users WHERE username = ?`, [username]);
        if (existingUser.length > 0) return res.status(409).json({ status: 'error', message: 'Username already taken.' });
        const password_hash = await bcrypt.hash(password, 10);
        await pool.execute(`INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)`, [username, password_hash, email || null]);
        res.status(201).json({ status: 'success', message: 'User registered successfully!' });
    } catch (error) { 
        console.error("Signup error:", error);
        res.status(500).json({ status: 'error', message: `Sign-up failed: ${error.message}` });
    }
});

// ROUTE 9: User Login
app.post('/login', async (req, res) => {
    // ... (This route is unchanged) ...
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ status: 'error', message: 'Username and password are required.' });
    try {
        const [users] = await pool.execute(`SELECT id, username, password_hash FROM users WHERE username = ?`, [username]);
        if (users.length === 0) return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        res.status(200).json({ status: 'success', message: 'Logged in successfully!', userId: user.id, username: user.username });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ status: 'error', message: `Login failed: ${error.message}` });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});