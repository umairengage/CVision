import React, { useState, useRef } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
// Import all images
import uploadIcon from "./assets/upload.png";
import jobIcon from "./assets/job.png";
import aiIcon from "./assets/ai.png";
import group46 from "./assets/Group 46.png";
import fileUpload from "./assets/fileupload.png";
import complete from "./assets/Complete.png";
import uploadSupported from "./assets/uploadsupported.png";
import pasteText from "./assets/pastetext.png";
import documentIcon from "./assets/docoment.png";
import uploadDescription from "./assets/uploaddiscription.png";
import doneCheck from "./assets/donecheck.png";
import checkIcon from "./assets/check.png";
import crossIcon from "./assets/corss.png";

import Header from "./header";
import Footer from "./footer";

// import mammoth from "mammoth";
import { GlobalWorkerOptions } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
// import Loader from "./Loader";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

function Loader() {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

function getMatchColor(match){
  let color = '#ef4444';
  if(match === 'Poor Match'){
    color = '#ef4444';
  }
  if(match === 'Fair Match'){
    color = '#f59e0b';
  }
  if(match === 'Good Match'){
    color = '#10b981';
  }
  if(match === 'Excellent Match'){
    color = '#3b82f6';
  }
  return color;
}

function App() {
  // const [rawText, setRawText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState({
    score: 41,
    matchLabel: "Fair Match",
    matchedKeywords: [
      "developer",
      "strong",
      "framework",
      "analysis",
      "product",
      "design",
    ],
    missingKeywords: [
      "teamwork",
      "collaboration",
      "system",
      "leadership",
      "coding",
    ],
    totalKeywords: 80,
    skillsByCategory: {
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
  });
  const [loading, setLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // const extractTextFromPDF = async (file) => {
  //   const arrayBuffer = await file.arrayBuffer();
  //   const pdf = await getDocument({ data: arrayBuffer }).promise;

  //   let text = "";
  //   for (let i = 1; i <= pdf.numPages; i++) {
  //     const page = await pdf.getPage(i);
  //     const content = await page.getTextContent();
  //     const strings = content.items.map((item) => item.str);
  //     text += strings.join(" ") + "\n";
  //   }

  //   return text;
  // };

  // const extractTextFromFile = async (file) => {
  //   if (file.type === "application/pdf") {
  //     return await extractTextFromPDF(file);
  //   } else if (
  //     file.type ===
  //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //   ) {
  //     const arrayBuffer = await file.arrayBuffer();
  //     const result = await mammoth.extractRawText({ arrayBuffer });
  //     return result.value;
  //   } else {
  //     throw new Error("Unsupported file type.");
  //   }
  // };

  // const showStep = (index) => {
  //   setCurrentStep(index);
  // };

  const nextStep = async () => {
    console.log("currentStep", currentStep);
    if (currentStep < 2) {
      if (currentStep === 1) {
        await handleAnalyze();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileChange = async (e) => {
    // if (e.target.files.length > 0) {
    //   setFileName(`Selected file: ${e.target.files[0].name}`);
    // } else {
    //   setFileName('');
    // }

    // const file = e.target.files[0];
    // if (file) {
    //   setFileName(`Selected file: ${file.name}`);
    //   try {
    //     const text = await extractTextFromFile(file);
    //     setResumeText(text);
    //   } catch (err) {
    //     alert("Failed to extract text: " + err);
    //   }
    // }

    const file = e.target.files[0];
    if (!file) return;

    setFileName(`Selected file: ${file.name}`);
    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("data", data);
      if (data && data.rawText) {
        setResumeText(data.rawText);
      }
      // if (data && data.rawText) {
      //   setJobDescription(data.rawText);
      // }
    } catch (err) {
      alert("Failed to extract text from file.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    fileInputRef.current.files = e.dataTransfer.files;
    handleFileChange({ target: fileInputRef.current });
    e.currentTarget.style.borderColor = "#999";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#333";
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.borderColor = "#999";
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();
      console.log("analysing-data", data);
      let analysisResult = {};
      if (data && data.analysis) {
        try {
          analysisResult = JSON.parse(data.analysis);
          setAnalysisResult(analysisResult);
        } catch (parseErr) {
          console.log("parseError", parseErr);
        }
      }
      // setAnalysisResult(analysisResult);
      setCurrentStep(2); // Move to AI Analysis step
    } catch (err) {
      alert("Failed to analyze resume.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <Header />
      {/* Header Banner */}
      <section className="homebanner">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1>Land Your Dream Job</h1>
              <p>
                Get instant analysis of how well your resume matches any job
                posting. Discover what's working, what's missing, and exactly
                how to improve your chances.
              </p>
              <ul>
                <li>Real-time matching</li>
                <li>Detailed scoring</li>
                <li>Smart Insights</li>
                <li>AI recommendations</li>
              </ul>
              <a href="#">Start Analysis</a>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar Section */}
      <section className="progressbar">
        <div className="container">
          <div className="stepper-wrapper">
            <div className="stepper">
              <div
                className={`step ${currentStep >= 0 ? "active" : ""}`}
                data-step="0"
              >
                <div className="circle">
                  <img src={uploadIcon} alt="Upload" />
                </div>
                <h4>Upload Resume</h4>
                <p>Upload your resume and portfolio</p>
              </div>
              <div
                className={`step ${currentStep >= 1 ? "active" : ""}`}
                data-step="1"
              >
                <div className="circle">
                  <img src={jobIcon} alt="Job" />
                </div>
                <h4>Job Description</h4>
                <p>Add job posting details</p>
              </div>
              <div
                className={`step ${currentStep >= 2 ? "active" : ""}`}
                data-step="2"
              >
                <div className="circle">
                  <img src={aiIcon} alt="AI" />
                </div>
                <h4>AI Analysis</h4>
                <p>Get comprehensive analysis</p>
              </div>
            </div>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            ></div>
          </div>

          {/* Step 0: Upload Resume */}
          <div
            className={`section ${currentStep === 0 ? "active" : ""}`}
            id="step-0"
          >
            <div className="upload">
              <img src={group46} alt="Upload" />
            </div>
            <h2>Upload Your Resume</h2>
            <p>
              Start by uploading your resume or pasting the content. We support
              PDF, Word documents, or plain text. Our AI will extract and
              analyze every detail.
            </p>
            <div className="uploadwrapper">
              <div className="uploadtop">
                <img src={fileUpload} alt="File upload" />
                <p>
                  Upload your resume file or paste the content directly below
                </p>
              </div>
              <div
                className="upload-box"
                id="uploadBox"
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <img src={complete} alt="Complete" />
                <br />
                <label htmlFor="resumeUpload">
                  Drop your resume or click here to browse
                </label>
                <br />
                <img src={uploadSupported} alt="Supported formats" />
                <input
                  type="file"
                  id="resumeUpload"
                  accept=".pdf,.doc,.docx"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div className="file-name">{fileName}</div>
              </div>
              <div className="textarea-box">
                <img src={pasteText} alt="Paste text" />
                <textarea
                  placeholder="Paste your resume content here..."
                  onChange={(e) => setResumeText(e.target.value)}
                  value={resumeText}
                />

                {/* <div id="resumeEditor" contenteditable="true" class="editor">{jobDescription}</div> */}
              </div>
            </div>
          </div>

          {/* Step 1: Job Description */}
          <div
            className={`section jobdiscription ${
              currentStep === 1 ? "active" : ""
            }`}
            id="step-1"
          >
            <div className="upload">
              <img src={documentIcon} alt="Document" />
            </div>
            <h1>Job Description</h1>
            <p className="description">
              Paste the complete job posting to analyze requirements, skills,
              and qualifications.The more detailed the description, the more
              accurate our analysis.
            </p>
            <div className="jobdiscriptionwrapper">
              <div className="uploadtop">
                <img src={uploadDescription} alt="Upload description" />
                <p>
                  Paste the complete job posting to analyze requirements and
                  skills
                </p>
              </div>

              <div className="textarea-box">
                <img src={pasteText} alt="Paste text" />
                <textarea
                  placeholder="Paste job description here..."
                  onChange={(e) => setJobDescription(e.target.value)}
                  value={jobDescription}
                />

                {/* <div id="resumeEditor" contenteditable="true" class="editor">{jobDescription}</div> */}
              </div>

              {/* <div className="job-description">
                <div className="job-title">
                  Senior Frontend Developer - React
                </div>
                <p>
                  We are looking for a Senior Frontend Developer to join our
                  growing team.
                </p>
              </div>
              <div className="requirements">
                <h2>Requirements:</h2>
                <ul>
                  <li>3+ years of experience with React and TypeScript</li>
                  <li>Strong knowledge of modern JavaScript (ES6+)</li>
                  <li>Experience with state management (Redux, Zustand)</li>
                  <li>
                    Proficiency in CSS frameworks (Tailwind CSS,
                    styled-components)
                  </li>
                  <li>
                    Experience with testing frameworks (Jest, React Testing
                    Library)
                  </li>
                  <li>Knowledge of build tools (Webpack, Vite)</li>
                  <li>Familiarity with version control (Git)</li>
                  <li>Experience with agile methodologies</li>
                </ul>
              </div>
              <div className="job-meta">
                <span>Job description Uploaded</span>
                <span>1,740 characters</span>
                <span>Ready For Analysis</span>
              </div> */}
              <div className="status-bar">
                <span className="status-dot"></span> Job description Uploaded ·
                {jobDescription?.length} characters · Ready For Analysis
              </div>
            </div>
          </div>

          {/* Step 2: AI Analysis */}
          <div
            className={`section ${currentStep === 2 ? "active" : ""}`}
            id="step-2"
          >
            <h2>AI Analysis</h2>
            <p>
              Review the AI-generated insights and recommendations based on your
              resume and job description.
            </p>
            <p className="buttontextanalyze">
              (This would be dynamic AI-generated content.)
            </p>

            {/* Analyze Result */}
            <div className="anakyzewrapper">
              <div className="status">
                <img src={doneCheck} alt="Done" />
                <span>Analysis Complete</span>
              </div>
              <h1>Your Resume Analysis</h1>
              <p>
                Here's your comprehensive analysis with match score, detailed
                keyword breakdown, and actionable recommendations to improve
                your application.
              </p>

              <div className="scrorewrapper">
                {/* Match Score Box */}
                <div className="score-box">
                  <div className="icon">⚡</div>
                  <div className="percent" style={{color:getMatchColor(analysisResult?.matchLabel || "Poor Match")}}>{analysisResult?.score || 0}%</div>
                  <div className="label">
                    {analysisResult?.matchLabel || "Poor Match"}
                  </div>
                </div>

                {/* Progress Bar and Keywords */}
                <div className="progress-section">
                  <div className="progress-label">
                    Match Progress &nbsp;&nbsp; {analysisResult?.score || 0}%
                  </div>
                  {/* <div className="progress-bar"></div> */}

                  <div className="progress-container-dynamic">
                    <div
                      className="progress-bar-dynamic"
                      style={{ width: `${analysisResult?.score || 0}%`, background: getMatchColor(analysisResult?.matchLabel || "Poor Match") }}
                    ></div>
                  </div>
                  <div className="match-stats">
                    <div className="stat matched">
                      {analysisResult?.matchedKeywords?.length || 0} Matched
                    </div>
                    <div className="stat missing">
                      {analysisResult?.missingKeywords?.length || 0} Missing
                    </div>
                  </div>
                </div>

                {/* Total Keywords */}
                <div className="keyword-box">
                  {analysisResult?.totalKeywords || 0}
                  <br />
                  <h6 className="keyword-subtext">
                    Total Keywords
                    <br />
                    from job description
                  </h6>
                </div>
              </div>

              <div className="keywords">
                <div className="box present">
                  <h3>
                    <img src={checkIcon} alt="Present" /> Present in Resume (
                    {analysisResult?.matchedKeywords?.length || 0})
                  </h3>
                  <div className="tags">
                    {analysisResult?.matchedKeywords?.map(
                      (matched, matchedIdx) => (
                        <span key={matchedIdx}>{matched}</span>
                      )
                    )}
                  </div>
                </div>
                <div className="box missing">
                  <h3>
                    <img src={crossIcon} alt="Missing" /> Missing From Resume (
                    {analysisResult?.missingKeywords?.length || 0})
                  </h3>
                  <div className="tags">
                    {analysisResult?.missingKeywords?.map(
                      (missings, missingsdIdx) => (
                        <span key={missingsdIdx}>{missings}</span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {analysisResult.skillsByCategory ? (
                <div class="skillsbycategories">
                  <h2>Skills By Category</h2>
                  <div class="subtitle">
                    Detailed breakdown of technical skills, soft skills, and
                    tools
                  </div>
                  <div class="categories">
                    {/* Technical Skills */}
                    <div class="category">
                      <h3>
                        Technical Skills
                        <br />
                        <small>
                          {parseInt(
                            analysisResult?.skillsByCategory?.technical?.present
                              ?.length || 0
                          ) +
                            parseInt(
                              analysisResult?.skillsByCategory?.technical
                                ?.missing?.length || 0
                            )}{" "}
                          Total Skills
                        </small>
                      </h3>
                      <div class="card present">
                        <div class="card-title">
                          Present (
                          {analysisResult?.skillsByCategory?.technical?.present
                            ?.length || 0}
                          )
                        </div>
                        <div class="tags">
                          {analysisResult?.skillsByCategory?.technical?.present?.map(
                            (technicalPresent, techPresentIdx) => (
                              <div key={techPresentIdx} class="tag">
                                {technicalPresent}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <div class="card missing">
                        <div class="card-title">
                          Missing (
                          {analysisResult?.skillsByCategory?.technical?.missing
                            ?.length || 0}
                          )
                        </div>
                        <div class="tags">
                          {analysisResult?.skillsByCategory?.technical?.missing?.map(
                            (technicalMissing, techMissingIdx) => (
                              <div key={techMissingIdx} class="tag">
                                {technicalMissing}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Soft Skills  */}
                    <div class="category">
                      <h3>
                        Soft Skills
                        <br />
                        <small>
                          {parseInt(
                            analysisResult?.skillsByCategory?.soft?.present
                              ?.length || 0
                          ) +
                            parseInt(
                              analysisResult?.skillsByCategory?.soft?.missing
                                ?.length || 0
                            )}{" "}
                          Total Skills
                        </small>
                      </h3>
                      <div class="card present">
                        <div class="card-title">
                          Present (
                          {analysisResult?.skillsByCategory?.soft?.present
                            ?.length || 0}
                          )
                        </div>
                        <div class="tags">
                          {analysisResult?.skillsByCategory?.soft?.present?.map(
                            (softPresent, softPresentIdx) => (
                              <div key={softPresentIdx} class="tag">
                                {softPresent}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <div class="card missing">
                        <div class="card-title">
                          Missing (
                          {analysisResult?.skillsByCategory?.soft?.missing
                            ?.length || 0}
                          )
                        </div>
                        <div class="tags">
                          {analysisResult?.skillsByCategory?.soft?.missing?.map(
                            (softMissing, softMissingIdx) => (
                              <div key={softMissingIdx} class="tag">
                                {softMissing}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Tools Skills */}
                    <div class="category">
                      <h3>
                        Tools Skills
                        <br />
                        <small>
                          {parseInt(
                            analysisResult?.skillsByCategory?.tools?.present
                              ?.length || 0
                          ) +
                            parseInt(
                              analysisResult?.skillsByCategory?.tools?.missing
                                ?.length || 0
                            )}{" "}
                          Total Skills
                        </small>
                      </h3>
                      <div class="card present">
                        <div class="card-title">
                          Present (
                          {analysisResult?.skillsByCategory?.tools?.present
                            ?.length || 0}
                          )
                        </div>
                        <div class="tags">
                          {analysisResult?.skillsByCategory?.tools?.present?.map(
                            (toolPresent, toolPresentIdx) => (
                              <div key={toolPresentIdx} class="tag">
                                {toolPresent}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <div class="card missing">
                        <div class="card-title">
                          Missing (
                          {analysisResult?.skillsByCategory?.tools?.missing
                            ?.length || 0}
                          )
                        </div>
                        <div class="tags">
                          {analysisResult?.skillsByCategory?.tools?.missing?.map(
                            (toolMissing, toolMissingIdx) => (
                              <div key={toolMissingIdx} class="tag">
                                {toolMissing}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {analysisResult?.suggestions ? (
                <div class="suggestions-box">
                  <h3>Improvement Suggestions</h3>
                  <div class="subtitle">
                    Personalized recommendations to enhance your resume match
                  </div>
                  {analysisResult?.suggestions?.map(
                    (suggestion, suggestionIdx) => (
                      <div key={suggestionIdx} class="suggestion-item">
                        <div class="circle">{suggestionIdx + 1}</div>
                        <div class="suggestion-text">{suggestion}</div>
                      </div>
                    )
                  )}
                </div>
              ) : null}

              {/* Rest of the AI Analysis content remains the same */}
              {/* ... */}
            </div>
          </div>
          {loading && <Loader />}

          <div className="buttons">
            <button className="btn-prev" onClick={prevStep}>
              Previous
            </button>
            <button className="btn-next" onClick={nextStep}>
              Next
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
