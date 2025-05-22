from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import json
import os
from gtts import gTTS
import uuid
from pydantic import BaseModel
from pathlib import Path
from typing import List, Dict, Any, Optional
import time
import platform
import requests
from pydantic import BaseModel

# Create necessary directories
os.makedirs("data", exist_ok=True)
os.makedirs("data/audio", exist_ok=True)
os.makedirs("data/experiments", exist_ok=True)

app = FastAPI(title="Science Education Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring and Docker healthchecks"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "0.1.0",
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "system": platform.system(),
        "python_version": platform.python_version()
    }

# Model for image analysis request
class ImageAnalysisRequest(BaseModel):
    image_url: str

@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    """Analyze an image and provide educational insights"""
    try:
        # In a real implementation, this would call a vision AI model
        # For now we'll return sample data

        # You could implement OpenAI Vision API, Google Cloud Vision, or similar here
        # Example: response = openai.ChatCompletion.create(model="gpt-4-vision-preview", ...)

        # For now, return a sample response
        return {
            "visible_objects": ["গাছপালা", "পাখি", "আকাশ", "মেঘ"],
            "observation_type": "প্রকৃতি ও পরিবেশ",
            "is_useful": True,
            "usefulness_reason": "এই ছবিটি বাস্তুতন্ত্র ও প্রকৃতির সম্পর্ক বোঝাতে উপযোগী।",
            "fun_fact": "আপনি যে গাছগুলো দেখছেন, সেগুলো প্রতিদিন প্রায় ৪০০ লিটার পানি শোষণ করে এবং অক্সিজেন উৎপাদন করে যা ৪ জন মানুষের দৈনিক অক্সিজেনের চাহিদা মেটাতে পারে!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

# Load experiment data
def load_experiment_data(category: str):
    try:
        file_path = f"data/experiments/{category}.json"
        if not os.path.exists(file_path):
            # Create default data if file doesn't exist
            create_default_data(category)

        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {category} data: {str(e)}")
        return []

def create_default_data(category: str):
    """Create default data for each category"""
    default_data = {}

    if category == "physics":
        default_data = {
            "experiments": [
                {
                    "id": "projectile-motion",
                    "title": "প্রজেক্টাইল মোশন",
                    "description": "বস্তুর গতিবিদ্যা এবং প্রক্ষেপণের গতিপথ অধ্যয়ন করুন",
                    "parameters": {
                        "angle": {"min": 0, "max": 90, "default": 45, "label": "কোণ (ডিগ্রি)"},
                        "velocity": {"min": 1, "max": 50, "default": 20, "label": "বেগ (m/s)"},
                        "gravity": {"min": 1, "max": 20, "default": 9.8, "label": "অভিকর্ষ (m/s²)"}
                    },
                    "narration": "প্রক্ষেপণ গতি হল একটি বস্তুর গতি যা শুধুমাত্র পৃথিবীর অভিকর্ষীয় আকর্ষণের অধীনে থাকে। কোণ এবং প্রাথমিক বেগ পরিবর্তন করে দেখুন গতিপথ কিভাবে পরিবর্তিত হয়।"
                },
                {
                    "id": "circuit-simulator",
                    "title": "ইলেকট্রিক সার্কিট সিমুলেটর",
                    "description": "ড্র্যাগ এন্ড ড্রপ উপাদান দিয়ে বৈদ্যুতিক সার্কিট তৈরি করে ওহমের সূত্র এবং সিরিজ ও প্যারালাল সার্কিট শিখুন",
                    "type": "circuit",
                    "parameters": {
                        "voltage": {"min": 1, "max": 24, "default": 9, "label": "ভোল্টেজ (V)"},
                        "resistance": {"min": 1, "max": 1000, "default": 100, "label": "রেজিস্টেন্স (Ω)"},
                        "showLabels": {"min": 0, "max": 1, "default": 1, "label": "লেবেল দেখান"}
                    },
                    "narration": "এই সিমুলেটরে আপনি ব্যাটারি, রেজিস্টর, তার এবং সুইচগুলি টেনে এনে বৈদ্যুতিক সার্কিট তৈরি করতে পারেন। ওহমের সূত্র (V = IR) অনুসারে, আপনি দেখতে পাবেন কিভাবে কারেন্ট এবং ভোল্টেজ সার্কিটের মধ্যে প্রবাহিত হয়। সিরিজ এবং প্যারালাল কনফিগারেশনে রেজিস্টরের আচরণ দেখুন।"
                },
                {
                    "id": "newton-laws",
                    "title": "নিউটনের গতিসূত্র",
                    "description": "কার্ট ঠেলা বনাম রিকশা টানা - বল, ভর, ও ত্বরণের সম্পর্ক অধ্যয়ন করুন",
                    "type": "newton",
                    "parameters": {
                        "mass": {"min": 10, "max": 100, "default": 50, "label": "ভর (kg)"},
                        "force": {"min": 10, "max": 500, "default": 100, "label": "বল (N)"},
                        "friction": {"min": 0, "max": 1, "default": 0.2, "label": "ঘর্ষণ সহগ"}
                    },
                    "narration": "নিউটনের দ্বিতীয় সূত্র অনুসারে, একটি বস্তুর ত্বরণ তার উপর প্রযুক্ত বলের সমানুপাতিক এবং ভরের ব্যস্তানুপাতিক (a = F/m)। বল এবং ভর পরিবর্তন করে দেখুন কিভাবে একটি কার্ট ঠেলা এবং রিকশা টানার গতি পরিবর্তিত হয়।"
                },
                {
                    "id": "pendulum",
                    "title": "দোলক গতি",
                    "description": "সাধারণ দোলক এবং তার দোলন বৈশিষ্ট্য অধ্যয়ন করুন",
                    "parameters": {
                        "length": {"min": 0.1, "max": 3, "default": 1, "label": "দৈর্ঘ্য (m)"},
                        "gravity": {"min": 1, "max": 20, "default": 9.8, "label": "অভিকর্ষ (m/s²)"},
                        "angle": {"min": 0, "max": 45, "default": 20, "label": "প্রারম্ভিক কোণ (ডিগ্রি)"}
                    },
                    "narration": "একটি সাধারণ দোলক হল একটি সুতার সাথে বাঁধা একটি ভর যা এদিক-ওদিক দুলতে থাকে। দোলকের দৈর্ঘ্য পরিবর্তন করলে দোলনের সময়কাল কিভাবে প্রভাবিত হয় তা পর্যবেক্ষণ করুন।"
                }
            ]
        }
    elif category == "biology":
        default_data = {
            "experiments": [
                {
                    "id": "heart",
                    "title": "মানব হৃদয়",
                    "description": "হৃদয়ের গঠন এবং রক্ত প্রবাহ সিস্টেম শিখুন",
                    "model_url": "/models/heart.glb",
                    "parts": [
                        {"id": "left-ventricle", "name": "বাম নিলয়", "description": "বাম নিলয় থেকে অক্সিজেনযুক্ত রক্ত শরীরের বিভিন্ন অংশে পাঠায়।"},
                        {"id": "right-ventricle", "name": "ডান নিলয়", "description": "ডান নিলয় কার্বন ডাই অক্সাইডযুক্ত রক্ত ফুসফুসে পাঠায়।"},
                        {"id": "left-atrium", "name": "বাম অলিন্দ", "description": "বাম অলিন্দ ফুসফুস থেকে অক্সিজেনযুক্ত রক্ত গ্রহণ করে।"},
                        {"id": "right-atrium", "name": "ডান অলিন্দ", "description": "ডান অলিন্দ শরীর থেকে কার্বন ডাই অক্সাইডযুক্ত রক্ত গ্রহণ করে।"}
                    ],
                    "narration": "মানব হৃদয় চারটি কক্ষ নিয়ে গঠিত: দুটি অলিন্দ এবং দুটি নিলয়। হৃদয় রক্তকে পাম্প করে শরীরের বিভিন্ন অংশে ও ফুসফুসে সরবরাহ করে। বিভিন্ন অংশে ক্লিক করে আরো জানুন।"
                },
                {
                    "id": "cell",
                    "title": "জীব কোষ",
                    "description": "জীব কোষের আণবিক গঠন এবং অঙ্গগুলি অধ্যয়ন করুন",
                    "model_url": "/models/cell.glb",
                    "parts": [
                        {"id": "nucleus", "name": "নিউক্লিয়াস", "description": "নিউক্লিয়াস কোষের মূল নিয়ন্ত্রক যা DNA ধারণ করে এবং প্রোটিন সংশ্লেষণ নিয়ন্ত্রণ করে।"},
                        {"id": "mitochondria", "name": "মাইটোকন্ড্রিয়া", "description": "মাইটোকন্ড্রিয়া কোষের 'পাওয়ার হাউস' যা শক্তি উৎপাদন করে।"},
                        {"id": "cell-membrane", "name": "কোষ ঝিল্লি", "description": "কোষ ঝিল্লি কোষকে সুরক্ষা দেয় এবং পদার্থের আদান-প্রদান নিয়ন্ত্রণ করে।"},
                        {"id": "endoplasmic-reticulum", "name": "এন্ডোপ্লাজমিক রেটিকুলাম", "description": "প্রোটিন সংশ্লেষণ এবং পরিবহনে সাহায্য করে।"}
                    ],
                    "narration": "জীব কোষ হল জীবনের মৌলিক একক। একটি কোষের ভিতরে বিভিন্ন অঙ্গাণু রয়েছে, যেমন নিউক্লিয়াস, মাইটোকন্ড্রিয়া, এবং এন্ডোপ্লাজমিক রেটিকুলাম। প্রতিটি অঙ্গাণু কোষের জীবনধারণের জন্য নির্দিষ্ট ভূমিকা পালন করে।"
                }
            ]
        }
    elif category == "chemistry":
        default_data = {
            "experiments": [
                {
                    "id": "acid-base",
                    "title": "অম্ল-ক্ষার বিক্রিয়া",
                    "description": "বিভিন্ন অম্ল ও ক্ষারের মধ্যে বিক্রিয়া দেখুন",
                    "chemicals": [
                        {"id": "HCl", "name": "হাইড্রোক্লোরিক অ্যাসিড", "type": "acid"},
                        {"id": "H2SO4", "name": "সালফিউরিক অ্যাসিড", "type": "acid"},
                        {"id": "CH3COOH", "name": "অ্যাসেটিক অ্যাসিড", "type": "acid"},
                        {"id": "NaOH", "name": "সোডিয়াম হাইড্রক্সাইড", "type": "base"},
                        {"id": "KOH", "name": "পটাসিয়াম হাইড্রক্সাইড", "type": "base"},
                        {"id": "NH4OH", "name": "অ্যামোনিয়াম হাইড্রক্সাইড", "type": "base"}
                    ],
                    "narration": "অম্ল-ক্ষার বিক্রিয়ায় একটি অম্ল এবং একটি ক্ষার বিক্রিয়া করে লবণ ও পানি উৎপন্ন করে। বিভিন্ন অম্ল ও ক্ষার নির্বাচন করে তাদের বিক্রিয়া দেখুন।"
                },
                {
                    "id": "precipitation",
                    "title": "অধঃক্ষেপণ বিক্রিয়া",
                    "description": "দুটি দ্রবণের বিক্রিয়া থেকে অদ্রবণীয় পদার্থ গঠন প্রক্রিয়া",
                    "chemicals": [
                        {"id": "AgNO3", "name": "সিলভার নাইট্রেট", "type": "solution"},
                        {"id": "NaCl", "name": "সোডিয়াম ক্লোরাইড", "type": "solution"},
                        {"id": "PbNO3", "name": "লেড নাইট্রেট", "type": "solution"},
                        {"id": "KI", "name": "পটাসিয়াম আয়োডাইড", "type": "solution"},
                        {"id": "BaCl2", "name": "বেরিয়াম ক্লোরাইড", "type": "solution"},
                        {"id": "Na2SO4", "name": "সোডিয়াম সালফেট", "type": "solution"}
                    ],
                    "narration": "অধঃক্ষেপণ বিক্রিয়ায় দুটি দ্রবণীয় যৌগ বিক্রিয়া করে একটি অদ্রবণীয় পদার্থ বা অধঃক্ষেপ গঠন করে। বিভিন্ন দ্রবণ নির্বাচন করে তাদের বিক্রিয়ার ফলাফল দেখুন।"
                }
            ]
        }

    # Save default data
    os.makedirs(os.path.dirname(f"data/experiments/{category}.json"), exist_ok=True)
    with open(f"data/experiments/{category}.json", "w", encoding="utf-8") as f:
        json.dump(default_data, f, ensure_ascii=False, indent=2)

    return default_data

# Chemistry data handling
@app.get("/api/chemistry/chemicals")
async def get_chemistry_chemicals():
    """Get list of all available chemicals for the chemistry simulator"""
    try:
        file_path = "data/experiments/chemicals.json"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Chemicals data not found")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception as e:
        print(f"Error getting chemicals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get chemicals: {str(e)}")

@app.get("/api/chemistry/reactions")
async def get_all_reactions():
    """Get list of all possible chemical reactions"""
    try:
        file_path = "data/experiments/reactions.json"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Reactions data not found")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception as e:
        print(f"Error getting reactions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get reactions: {str(e)}")

@app.get("/api/chemistry/react")
async def perform_reaction(
    chem1: str = Query(...),
    chem2: str = Query(...),
    temperature: float = Query(25.0),  # Default room temperature
    mixing_speed: float = Query(50.0),  # Default medium mixing speed
    actions: str = Query(None)
):
    """Get the reaction result for two chemicals with optional parameters for temperature, mixing speed, and actions"""
    # Load reactions data
    try:
        file_path = "data/experiments/reactions.json"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Reactions data not found")

        with open(file_path, "r", encoding="utf-8") as f:
            reactions_data = json.load(f)

        # Parse actions if provided
        action_list = actions.split(',') if actions else []

        # Search for match
        for reaction in reactions_data.get("reactions", []):
            if ((reaction["reactant1"] == chem1 and reaction["reactant2"] == chem2) or
                (reaction["reactant1"] == chem2 and reaction["reactant2"] == chem1)):

                # Enhance reaction based on actions and parameters
                result = reaction.copy()

                # Apply temperature effects
                if temperature > 50:
                    # Enhanced effects at higher temperatures
                    if reaction.get("reactionType") == "acid-carbonate":
                        result["animation"] = "bubble"
                        result["description"] = result["description"] + f" At {temperature}°C, the reaction is accelerated."
                        result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {temperature}°C তাপমাত্রায়, বিক্রিয়াটি ত্বরান্বিত হয়।"
                    elif reaction.get("reactionType") == "redox":
                        result["animation"] = "smoke"
                        result["description"] = result["description"] + f" At {temperature}°C, the redox reaction is intensified."
                        result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {temperature}°C তাপমাত্রায়, জারণ-বিজারণ বিক্রিয়াটি তীব্র হয়।"
                    elif reaction.get("animation") == "precipitate":
                        result["description"] = result["description"] + f" At {temperature}°C, the precipitation forms more quickly."
                        result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {temperature}°C তাপমাত্রায়, অধঃক্ষেপণ দ্রুত হয়।"
                elif temperature < 10:

                    result["description"] = result["description"] + f" At {temperature}°C, the reaction is slowed down."
                    result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {temperature}°C তাপমাত্রায়, বিক্রিয়াটি ধীর হয়।"

                # Apply mixing speed effects
                if mixing_speed > 75:
                    if reaction.get("animation") == "precipitate":
                        result["description"] = result["description"] + f" With vigorous mixing at {mixing_speed}% speed, the precipitation is more uniform."
                        result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {mixing_speed}% গতিতে তীব্র মিশ্রণে, অধঃক্ষেপণ আরও সমান হয়।"
                    elif reaction.get("animation") == "bubble":
                        result["description"] = result["description"] + f" With vigorous mixing at {mixing_speed}% speed, bubbling is more intense."
                        result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {mixing_speed}% গতিতে তীব্র মিশ্রণে, বাবল উৎপাদন আরও তীব্র হয়।"

                # Check for additional actions (for backward compatibility)
                if "heat" in action_list:
                    # Legacy heating action support
                    if result.get("animation") != "smoke" and reaction.get("reactionType") == "acid-carbonate":
                        result["animation"] = "bubble"

                if "shake" in action_list:
                    # Legacy shaking action support
                    if reaction.get("animation") == "precipitate":
                        result["description"] = result["description"] + " Shaking accelerates the precipitation."
                        result["bengaliDescription"] = result.get("bengaliDescription", "") + " ঝাঁকুনি অধঃক্ষেপণ প্রক্রিয়াকে ত্বরান্বিত করে।"

                return result

        # No match found
        return {
            "id": f"{chem1}-{chem2}",
            "reactant1": chem1,
            "reactant2": chem2,
            "product": "No Reaction",
            "description": "The selected chemicals do not react or their reaction is unknown.",
            "bengaliDescription": "নির্বাচিত রাসায়নিকগুলি এক অপরের সাথে বিক্রিয়া করে না বা তাদের বিক্রিয়া অজানা।",
            "animation": "none",
            "color": "#f8f9fa",
            "reactionType": "none",
            "hazards": "None"
        }
    except Exception as e:
        print(f"Error getting reaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get reaction: {str(e)}")

@app.get("/api/chemistry/reactions-by-type")
async def get_reactions_by_type(type: str = Query(...)):
    """Get reactions filtered by a specific reaction type"""
    try:
        file_path = "data/experiments/reactions.json"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Reactions data not found")

        with open(file_path, "r", encoding="utf-8") as f:
            reactions_data = json.load(f)

        filtered_reactions = [
            reaction for reaction in reactions_data.get("reactions", [])
            if reaction.get("reactionType") == type
        ]

        return {"reactions": filtered_reactions}
    except Exception as e:
        print(f"Error getting reactions by type: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get reactions: {str(e)}")

@app.get("/api/audio")
async def get_audio(text: str = Query(...)):
    """Generate and return TTS audio for the given text"""
    try:
        # Create a unique filename for this audio
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join("data/audio", filename)

        # Generate TTS audio
        tts = gTTS(text=text, lang='bn', slow=False)
        tts.save(filepath)

        # Return the audio file
        return FileResponse(
            filepath,
            media_type="audio/mpeg",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {str(e)}")

# Add a convenience endpoint for the enhanced chemistry simulation
@app.get("/api/experiments/chemistry")
async def get_chemistry_data():
    """Get all chemistry data (chemicals and reactions) in one request"""
    try:
        # Get chemicals
        chemicals_path = "data/experiments/chemicals.json"
        reactions_path = "data/experiments/reactions.json"

        if not os.path.exists(chemicals_path) or not os.path.exists(reactions_path):
            raise HTTPException(status_code=404, detail="Chemistry data not found")

        with open(chemicals_path, "r", encoding="utf-8") as f:
            chemicals_data = json.load(f)

        with open(reactions_path, "r", encoding="utf-8") as f:
            reactions_data = json.load(f)

        return {
            "chemicals": chemicals_data.get("chemicals", []),
            "reactions": reactions_data.get("reactions", [])
        }
    except Exception as e:
        print(f"Error getting chemistry data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get chemistry data: {str(e)}")

@app.get("/api/reactions")
async def get_reaction(
    chem1: str = Query(...),
    chem2: str = Query(...),
    temperature: float = Query(25.0, gt=0, lt=100),
    mixing_speed: float = Query(50.0, ge=0, le=100)
):
    """Get the reaction data for specific chemicals with temperature and mixing speed parameters"""
    try:
        file_path = "data/experiments/reactions.json"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Reactions data not found")

        with open(file_path, "r", encoding="utf-8") as f:
            reactions_data = json.load(f)

        # Search for matching reaction
        for reaction in reactions_data.get("reactions", []):
            if ((reaction["reactant1"] == chem1 and reaction["reactant2"] == chem2) or
                (reaction["reactant1"] == chem2 and reaction["reactant2"] == chem1)):

                # Enhance reaction based on parameters
                result = reaction.copy()

                # Apply temperature effects (simplified version of the logic in the more complex endpoint)
                if temperature > 50:
                    result["description"] = result["description"] + f" At {temperature}°C, the reaction is accelerated."
                    result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {temperature}°C তাপমাত্রায়, বিক্রিয়াটি ত্বরান্বিত হয়।"
                elif temperature < 10:
                    result["description"] = result["description"] + f" At {temperature}°C, the reaction is slowed down."
                    result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {temperature}°C তাপমাত্রায়, বিক্রিয়াটি ধীর হয়।"

                # Apply mixing speed effects (simplified)
                if mixing_speed > 75:
                    result["description"] = result["description"] + f" With vigorous mixing at {mixing_speed}% speed, the reaction is more uniform."
                    result["bengaliDescription"] = result.get("bengaliDescription", "") + f" {mixing_speed}% গতিতে তীব্র মিশ্রণে, বিক্রিয়াটি আরও সমান হয়।"

                return result

        # No match found
        return {
            "id": f"{chem1}-{chem2}",
            "reactant1": chem1,
            "reactant2": chem2,
            "product": "No Reaction",
            "description": "The selected chemicals do not react or their reaction is unknown.",
            "bengaliDescription": "নির্বাচিত রাসায়নিকগুলি এক অপরের সাথে বিক্রিয়া করে না বা তাদের বিক্রিয়া অজানা।",
            "animation": "none",
            "color": "#f8f9fa",
            "reactionType": "none",
            "hazards": "None"
        }

    except Exception as e:
        print(f"Error getting reaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get reaction: {str(e)}")

@app.get("/api/experiments/physics")
async def get_physics_data():
    """Get all physics experiments data"""
    try:
        physics_path = "data/experiments/physics.json"

        if not os.path.exists(physics_path):
            # Use the default creation function already defined in the file
            create_default_data("physics")

        with open(physics_path, "r", encoding="utf-8") as f:
            physics_data = json.load(f)

        return physics_data
    except Exception as e:
        print(f"Error getting physics data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get physics data: {str(e)}")

@app.get("/api/experiments/biology")
async def get_biology_data(category: str = Query(None)):
    """Get all biology experiments data, optionally filtered by category"""
    try:
        biology_path = "data/experiments/biology.json"

        if not os.path.exists(biology_path):
            # Use the default creation function already defined in the file
            create_default_data("biology")

        with open(biology_path, "r", encoding="utf-8") as f:
            biology_data = json.load(f)

        # If a category is specified, filter the experiments
        if category:
            # Filter experiments by their category field
            filtered_experiments = [
                exp for exp in biology_data["experiments"]
                if "category" in exp and exp["category"] == category
            ]
            biology_data["experiments"] = filtered_experiments

        return biology_data
    except Exception as e:
        print(f"Error getting biology data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get biology data: {str(e)}")

@app.get("/api/svg/{filename}")
async def get_svg_file(filename: str):
    """
    Serve SVG files for physics simulations and other visualizations
    """
    try:
        svg_path = f"app/svg/{filename}"
        if not os.path.exists(svg_path):
            raise HTTPException(status_code=404, detail=f"SVG file {filename} not found")

        # Return the SVG file with proper content type
        return FileResponse(
            svg_path,
            media_type="image/svg+xml"
        )
    except Exception as e:
        print(f"Error retrieving SVG file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve SVG: {str(e)}")

@app.get("/api/models/{filename}")
async def get_model_file(filename: str):
    """
    Serve 3D model files (glb, gltf) for biology and other 3D simulations
    """
    try:
        model_path = f"app/webmodel/{filename}"
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model file {filename} not found")

        # Get file size for logging
        file_size = os.path.getsize(model_path) / (1024 * 1024)  # Size in MB
        print(f"Serving model file {filename}, size: {file_size:.2f} MB")

        # Determine content type
        content_type = "model/gltf-binary" if filename.endswith('.glb') else "model/gltf+json"

        # Add caching headers for better performance and CORS headers
        headers = {
            "Cache-Control": "public, max-age=604800",  # Cache for 1 week
            "Access-Control-Allow-Origin": "*",  # Allow CORS
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }

        # Return the file with appropriate headers
        return FileResponse(
            model_path,
            media_type=content_type,
            headers=headers
        )
    except Exception as e:
        error_message = f"Error retrieving model file {filename}: {str(e)}"
        print(error_message)
        raise HTTPException(status_code=500, detail=error_message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
