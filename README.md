
## What the App Does

This project is a **semantic search system for SEC 10-K filings**.

It allows financial analysts, investors, and researchers to ask natural language questions about company reports, whether narrative ones like *“What risks did Microsoft mention in 2022?”* or factual ones like *“What was Microsoft’s revenue in 2022?”*.

Unlike traditional systems, it **classifies each query by intent**:
- **Qualitative queries** → semantic search over 10-K documents  
- **Quantitative queries** → structured financial database for exact numbers  

The system then combines results into clear, context-aware answers while always showing the sources for **trust and transparency**.

In short: a **hybrid search tool** that adapts to the type of financial question asked.

## Supported Companies & Years

The prototype currently supports **7 major tech companies** from **2020 – 2024**:


<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Alphabet" height="40" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" height="40" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" height="40" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" height="40" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" height="40" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/NVIDIA_logo.svg" alt="Nvidia" height="40" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" alt="Tesla" height="40" />
</p>

## **Start FastAPI Server** 

### Development:
Repo: https://github.com/5mbl/10k-v2-API

Run locally:
```bash
cd backend  
source venv/bin/activate  
uvicorn main:app --host 0.0.0.0 --port 8000 --reload  
```

### Production

- **API Base URL:**  
  [https://one0k-v2-api.onrender.com](https://one0k-v2-api.onrender.com)

- **Render.com Dashboard:**  
  [View Deployment](https://dashboard.render.com/web/srv-d21bb0qdbo4c73dvr5f0/deploys/dep-d21bvo7fte5s73fee1dg)

**Test the root endpoint:**

```http
GET https://one0k-v2-api.onrender.com
```

Expected Response:
{
  "message": "Welcome to the SEC-RAG-API"
}

## Tech Stack

- **Frontend**: React / Next.js  
- **Language Model**: [OpenAI](https://openai.com/) GPT (embeddings + generation)  
- **Vector Database**: [Pinecone](https://www.pinecone.io/)  
- **Financial Data**:  [Polygon API](https://polygon.io/)  
<br><br>

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" height="30" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Next.js_wordmark.svg" alt="Next.js" height="30" /> &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/OpenAI_logo_2025_%28wordmark%29.svg" alt="OpenAI" height="30" /> &nbsp;&nbsp;&nbsp;
  <img src="https://static.cdnlogo.com/logos/p/46/pinecone.svg" alt="Pinecone" height="30" /> &nbsp;&nbsp;&nbsp;
  <img src="https://github.com/user-attachments/assets/101f097d-1e5c-41e3-b1ae-b09e890fb652" alt="Polygon" height="30" />
</p>

---

## **Start Frontend**  
```bash
cd frontend  
npm run dev    
```   
<p float="left">
  <img src="https://github.com/user-attachments/assets/d0f3b0eb-1512-40ba-b7fb-c8ebf643937f" width="48%" />
  <img src="https://github.com/user-attachments/assets/48b49d8e-dfb8-4feb-8cf6-c3a51cf91ea3" width="48%" />
</p>


