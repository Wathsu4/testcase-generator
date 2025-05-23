# AI Test Case Generator

An AI-powered test case generator with a React frontend and FastAPI backend. The system can generate test cases using either OpenAI's GPT models or Hugging Face's FLAN-T5 model.

## Project Structure

- `/my-test-gen-frontend` - React frontend application
- `/test_case_generator` - Python FastAPI backend service

## Features

- Interactive web interface for input
- Real-time test case generation
- Support for multiple AI backends (OpenAI GPT and Hugging Face FLAN-T5)
- Responsive design with modern UI

## Prerequisites

- Node.js 18+ for frontend
- Python 3.10+ for backend
- OpenAI API key (if using OpenAI backend)

## Setup & Installation

### Frontend Setup

```bash
cd my-test-gen-frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd test_case_generator
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Configuration

1. Create `.env` file in root directory
2. Add your OpenAI API key if using OpenAI backend:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Configure backend in `test_case_generator/config.yaml`:
   ```yaml
   backend: openai # or 'huggingface'
   ```

## Running the Project

### Development Mode

Frontend: `npm run dev` (in my-test-gen-frontend directory)
Backend: `uvicorn main:app --reload` (in test_case_generator directory)

### Production Deployment

The project is configured for Vercel deployment using `vercel.json` configuration.

## Tech Stack

- Frontend: React, Vite, TailwindCSS
- Backend: FastAPI, Transformers, OpenAI API
- AI Models: GPT-4 (OpenAI) or FLAN-T5 (Hugging Face)
