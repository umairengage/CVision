const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { Configuration, OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });

// OpenAI setup
// const openai = new OpenAIApi(new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// }));
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

const analysisData = {
  matchScore: 41,
  matchedKeywords: ["developer", "strong", "framework", "analysis", "product", "design"],
  missingKeywords: ["teamwork", "collaboration", "system", "leadership", "coding"],
  totalKeywords: 80,
  skillCategories: {
    technical: {
      present: ["azure", "developer", "react", "tailwind", "typescript"],
      missing: ["nextjs", "backend"],
    },
    soft: {
      present: ["knowledge", "agile", "work"],
      missing: ["proficiency"],
    },
    tools: {
      present: ["typescript"],
      missing: ["coding"],
    },
  },
  suggestions: [
    "Consider highlighting your experience with react, typescript, javascript if you have it, or consider learning these in-demand technical skills.",
    "Add examples demonstrating team and management in your experience descriptions.",
    "Familiarize yourself with for and code as they appear to be important for this role.",
    "Consider tailoring your resume more specifically to this job by incorporating more relevant keywords from the job description.",
    "Use specific examples and metrics to demonstrate your impact in previous roles.",
    "Consider adding a skills section that explicitly lists your technical competencies.",
  ],
};

// Upload and process file
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    let resumeText = '';

    if (!file) return res.status(400).send('No file uploaded.');

    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      resumeText = data.text;
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const data = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: data });
      resumeText = result.value;
    } else if (file.mimetype === 'text/plain') {
      resumeText = fs.readFileSync(file.path, 'utf-8');
    } else {
      return res.status(400).send('Unsupported file type.');
    }

    fs.unlinkSync(file.path); // Clean up temp file

    
    // const beautifyPrompt = (label, content) =>
    //   `Format and beautify the following ${label}. Use proper headings, spacing, bullet points, and clarity:\n\n${content}`;
    
    // const extractJdPrompt = (content) =>
    //   `Extract ONLY the job description section from the following resume or content. Return just the job description, nothing else:\n\n${content}`;

    // const resumeResponse = await openai.chat.completions.create({
    //     model: "gpt-4",
    //     messages: [
    //       { role: "user", content: beautifyPrompt("resume", resumeText) }
    //     ],
    //     temperature:0.7,
    //   });

      // openai.chat.completions.create({
      //   model: "gpt-4",
      //   messages: [
      //     { role: "user", content: extractJdPrompt(resumeText) }
      //   ],
      //   temperature:0.7,
      // }),
    

    res.json({
      // formattedResume: resumeResponse.choices[0].message.content,
      // formattedJobDescription: jdResponse.choices[0].message.content,
      rawText:resumeText
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to extract resume text.');
  }
});

// Analyze resume with OpenAI
app.post('/analyze', async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  try {


    const systemPrompt = `You are an AI that compares resumes and job descriptions.

    Return a JSON object with the following structure:

    {
      "score": number (0-100),
      "matchLabel": "Poor Match" | "Fair Match" | "Good Match" | "Excellent Match",
      "matchedKeywords": [array of strings],
      "missingKeywords": [array of strings],
      "totalKeywords": total number of relevant keywords from job description,
      "skillsByCategory": {
        "technical": {
          "present": [...],
          "missing": [...]
        },
        "soft": {
          "present": [...],
          "missing": [...]
        },
        "tools": {
          "present": [...],
          "missing": [...]
        }
      },
      "suggestions": [array of actionable suggestions]
    }

    Only return valid JSON.`;


    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` },
    ];



    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature:0.4
    });

    res.json({ analysis: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).send('OpenAI analysis failed.');
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
