from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
import os
import yaml
from dotenv import load_dotenv
import openai
from fastapi.middleware.cors import CORSMiddleware


# Load environment variables from .env file
load_dotenv()

# Load config
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

BACKEND = config.get("backend", "huggingface")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client if backend is openai
client = None
if BACKEND == "openai":
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY not set in .env file for OpenAI backend")
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    print("OpenAI backend selected and client initialized.")



class InputData(BaseModel):
    code_or_requirements: str

app = FastAPI()

origins = [
    "http://localhost:5173",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = "models"
MODEL_NAME = "google/flan-t5-small"
model = None

def load_model():

    global model
    if BACKEND == "huggingface":
        os.makedirs(MODEL_DIR, exist_ok=True)
        model_path = os.path.join(MODEL_DIR, MODEL_NAME.replace("/", "--"))  # Sanitize path

        if os.path.exists(model_path):
            print(f"Loading model from local directory: {model_path}")
            model = pipeline("text2text-generation", model=model_path, tokenizer=model_path)
        else:
            print(f"Downloading model: {MODEL_NAME}")
            hf_model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
            hf_tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            hf_model.save_pretrained(model_path)
            hf_tokenizer.save_pretrained(model_path)
            model = pipeline("text2text-generation", model=hf_model, tokenizer=hf_tokenizer)
            print(f"Model saved to: {model_path}")

@app.on_event("startup")
async def startup_event():
    global client
    if BACKEND == "huggingface":
        load_model()
    elif BACKEND == "openai":
        if not OPENAI_API_KEY: # Redundant if checked above, but good for safety
             raise RuntimeError("OPENAI_API_KEY not set in .env file for OpenAI backend")
        # openai.api_key = OPENAI_API_KEY # This line is for older versions
        if client is None: # Initialize if not already done
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
        print("OpenAI backend confirmed for startup.")
    

@app.post("/generate_tests/")
async def generate_tests(input_data: InputData):
    if BACKEND == "huggingface":
        if model is None:
            raise HTTPException(status_code=503, detail="Model not loaded yet.")
        try:
            test_cases = model(input_data.code_or_requirements, max_length=200)
            return {"test_cases": [case["generated_text"] for case in test_cases]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during test case generation: {str(e)}")
    elif BACKEND == "openai":
        try:
            # Initialize the OpenAI client
            client = openai.OpenAI(api_key=OPENAI_API_KEY) # Make sure OPENAI_API_KEY is accessible here

            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that generates test cases for code or requirements. You only return the test case code without any additional text."},
                    {"role": "user", "content": input_data.code_or_requirements}
                ],
                max_tokens=200,
                n=1,
                # stop=None, # 'stop' is often not needed with newer models or can be handled differently
                temperature=0.7,
            )
            test_case = response.choices[0].message.content # Access content directly
            return {"test_cases": [test_case]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")

    else:
        raise HTTPException(status_code=500, detail="Invalid backend configuration.")
